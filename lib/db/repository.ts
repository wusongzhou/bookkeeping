import { getDatabase } from './sqlite';
import type { Item, CreateItemDTO, UpdateItemDTO, ItemFilter } from '../types';

const USER_ID = 'default_user'; // 单用户模式，使用固定 user_id

/**
 * 获取所有物品（支持筛选）
 */
export function getAllItems(filter?: ItemFilter): Item[] {
  const db = getDatabase();
  let sql = 'SELECT * FROM items WHERE user_id = ?';
  const params: (string | number)[] = [USER_ID];

  if (filter?.archived !== undefined) {
    sql += ' AND archived = ?';
    params.push(filter.archived);
  }

  sql += ' ORDER BY created_at DESC';

  const stmt = db.prepare(sql);
  return stmt.all(...params) as Item[];
}

/**
 * 根据 ID 获取单个物品
 */
export function getItemById(id: number): Item | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM items WHERE id = ? AND user_id = ?');
  return stmt.get(id, USER_ID) as Item | undefined;
}

/**
 * 创建新物品
 */
export function createItem(data: CreateItemDTO): Item {
  const db = getDatabase();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO items (
      user_id, name, purchased_at, price_cents, remark,
      archived, archived_at, archived_daily_price_cents,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    USER_ID,
    data.name,
    data.purchased_at,
    data.price_cents,
    data.remark || '',
    0, // archived 默认为 0
    null, // archived_at
    null, // archived_daily_price_cents
    now,
    now
  );

  // 返回新创建的记录
  return getItemById(result.lastInsertRowid as number) as Item;
}

/**
 * 更新物品
 */
export function updateItem(id: number, data: UpdateItemDTO): Item | null {
  const db = getDatabase();
  const now = new Date().toISOString();

  // 构建动态 SQL
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.purchased_at !== undefined) {
    fields.push('purchased_at = ?');
    values.push(data.purchased_at);
  }
  if (data.price_cents !== undefined) {
    fields.push('price_cents = ?');
    values.push(data.price_cents);
  }
  if (data.remark !== undefined) {
    fields.push('remark = ?');
    values.push(data.remark);
  }
  if (data.archived !== undefined) {
    fields.push('archived = ?');
    values.push(data.archived);
  }
  if (data.archived_at !== undefined) {
    fields.push('archived_at = ?');
    values.push(data.archived_at);
  }
  if (data.archived_daily_price_cents !== undefined) {
    fields.push('archived_daily_price_cents = ?');
    values.push(data.archived_daily_price_cents);
  }

  // 总是更新 updated_at
  fields.push('updated_at = ?');
  values.push(now);

  // 添加 WHERE 条件
  values.push(id, USER_ID);

  const sql = `UPDATE items SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
  const stmt = db.prepare(sql);
  const result = stmt.run(...values);

  if (result.changes === 0) {
    return null; // 未找到记录或没有权限
  }

  return getItemById(id) as Item;
}

/**
 * 删除物品
 */
export function deleteItem(id: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM items WHERE id = ? AND user_id = ?');
  const result = stmt.run(id, USER_ID);
  return result.changes > 0;
}

/**
 * 归档物品
 */
export function archiveItem(id: number, archivedDailyPriceCents: number): Item | null {
  const now = new Date().toISOString();
  return updateItem(id, {
    archived: 1,
    archived_at: now,
    archived_daily_price_cents: archivedDailyPriceCents,
  });
}

/**
 * 取消归档物品
 */
export function unarchiveItem(id: number): Item | null {
  return updateItem(id, {
    archived: 0,
    archived_at: null,
    archived_daily_price_cents: null,
  });
}
