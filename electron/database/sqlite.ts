/**
 * SQLite 数据库封装
 * 使用 better-sqlite3 实现本地数据存储
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { Item, CreateItemDTO, UpdateItemDTO } from '../../lib/types';

let db: Database.Database | null = null;

/**
 * 获取数据库文件路径
 */
export function getDatabasePath(isDev: boolean, userDataPath: string): string {
  if (isDev) {
    // 开发环境：项目根目录下的 data 文件夹
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, 'bookkeeping.db');
  } else {
    // 生产环境：系统用户数据目录
    return path.join(userDataPath, 'bookkeeping.db');
  }
}

/**
 * 初始化数据库连接
 */
export function initDatabase(dbPath: string): Database.Database {
  console.log(`初始化数据库: ${dbPath}`);
  
  db = new Database(dbPath, { verbose: console.log });
  
  // 启用外键约束
  db.pragma('foreign_keys = ON');
  
  // 运行迁移
  runMigrations(db);
  
  return db;
}

/**
 * 获取数据库实例
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('数据库未初始化');
  }
  return db;
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * 运行数据库迁移
 */
function runMigrations(database: Database.Database): void {
  // 创建 items 表
  database.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      remote_id TEXT,
      name TEXT NOT NULL,
      purchased_at TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      remark TEXT,
      archived INTEGER NOT NULL DEFAULT 0,
      archived_at TEXT,
      archived_daily_price_cents INTEGER,
      sync_status INTEGER NOT NULL DEFAULT 0,
      last_synced_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      is_deleted INTEGER NOT NULL DEFAULT 0
    );
  `);

  // 创建索引
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_items_archived ON items(archived);
    CREATE INDEX IF NOT EXISTS idx_items_sync_status ON items(sync_status);
    CREATE INDEX IF NOT EXISTS idx_items_remote_id ON items(remote_id);
  `);

  console.log('数据库迁移完成');
}

/**
 * 获取所有物品
 */
export function getAllItems(filter?: { archived?: number }): Item[] {
  const db = getDatabase();
  
  let query = 'SELECT * FROM items WHERE is_deleted = 0';
  const params: (number | string)[] = [];
  
  if (filter?.archived !== undefined) {
    query += ' AND archived = ?';
    params.push(filter.archived);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const stmt = db.prepare(query);
  return stmt.all(...params) as Item[];
}

/**
 * 根据 ID 获取物品
 */
export function getItemById(id: number): Item | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM items WHERE id = ? AND is_deleted = 0');
  return (stmt.get(id) as Item) || null;
}

/**
 * 创建物品
 */
export function createItem(data: CreateItemDTO): Item {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO items (
      name, purchased_at, price_cents, remark,
      archived, sync_status, created_at, updated_at, version
    ) VALUES (?, ?, ?, ?, 0, 0, ?, ?, 1)
  `);
  
  const result = stmt.run(
    data.name,
    data.purchased_at,
    data.price_cents,
    data.remark || null,
    now,
    now
  );
  
  const item = getItemById(result.lastInsertRowid as number);
  if (!item) {
    throw new Error('创建物品失败');
  }
  
  return item;
}

/**
 * 更新物品
 */
export function updateItem(id: number, data: UpdateItemDTO): Item {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const updates: string[] = [];
  const values: (string | number | null | undefined)[] = [];
  
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.purchased_at !== undefined) {
    updates.push('purchased_at = ?');
    values.push(data.purchased_at);
  }
  if (data.price_cents !== undefined) {
    updates.push('price_cents = ?');
    values.push(data.price_cents);
  }
  if (data.remark !== undefined) {
    updates.push('remark = ?');
    values.push(data.remark);
  }
  if (data.archived !== undefined) {
    updates.push('archived = ?');
    values.push(data.archived);
  }
  
  updates.push('updated_at = ?');
  values.push(now);
  
  updates.push('version = version + 1');
  updates.push('sync_status = 2'); // 标记为待更新
  
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE items SET ${updates.join(', ')}
    WHERE id = ? AND is_deleted = 0
  `);
  
  stmt.run(...values);
  
  const item = getItemById(id);
  if (!item) {
    throw new Error('更新物品失败');
  }
  
  return item;
}

/**
 * 删除物品（软删除）
 */
export function deleteItem(id: number): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE items SET is_deleted = 1, updated_at = ?, sync_status = 3
    WHERE id = ?
  `);
  
  stmt.run(now, id);
}

/**
 * 归档物品
 */
export function archiveItem(id: number): Item {
  const item = getItemById(id);
  if (!item) {
    throw new Error('物品不存在');
  }
  
  const db = getDatabase();
  const now = new Date().toISOString();
  
  // 计算归档日均价格
  const usageDays = Math.max(
    Math.floor((Date.now() - new Date(item.purchased_at).getTime()) / (1000 * 60 * 60 * 24)),
    1
  );
  const archivedDailyPrice = Math.floor(item.price_cents / usageDays);
  
  const stmt = db.prepare(`
    UPDATE items SET 
      archived = 1,
      archived_at = ?,
      archived_daily_price_cents = ?,
      updated_at = ?,
      version = version + 1,
      sync_status = 2
    WHERE id = ?
  `);
  
  stmt.run(now, archivedDailyPrice, now, id);
  
  const updatedItem = getItemById(id);
  if (!updatedItem) {
    throw new Error('归档物品失败');
  }
  
  return updatedItem;
}

/**
 * 取消归档
 */
export function unarchiveItem(id: number): Item {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE items SET 
      archived = 0,
      archived_at = NULL,
      archived_daily_price_cents = NULL,
      updated_at = ?,
      version = version + 1,
      sync_status = 2
    WHERE id = ?
  `);
  
  stmt.run(now, id);
  
  const item = getItemById(id);
  if (!item) {
    throw new Error('取消归档失败');
  }
  
  return item;
}
