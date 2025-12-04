import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 数据库文件路径
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'bookkeeping.db');

// 确保 data 目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// 创建数据库实例
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL'); // 开启 WAL 模式以提高并发性能
    initializeDatabase(db);
  }
  return db;
}

// 初始化数据库表结构
function initializeDatabase(db: Database.Database) {
  // 创建 items 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'default_user',
      name TEXT NOT NULL,
      purchased_at TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      remark TEXT NOT NULL DEFAULT '',
      archived INTEGER NOT NULL DEFAULT 0,
      archived_at TEXT,
      archived_daily_price_cents INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // 创建 tags 表（标签）
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'default_user',
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#3B82F6',
      created_at TEXT NOT NULL,
      UNIQUE(user_id, name)
    )
  `);

  // 创建 item_tags 表（物品-标签关联表）
  db.exec(`
    CREATE TABLE IF NOT EXISTS item_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
      UNIQUE(item_id, tag_id)
    )
  `);

  // 创建 users 表（用户表）
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // 插入默认用户（如果不存在）
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (user_id, username, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('default_user', 'admin', 'admin123', now, now);
  }

  // 创建索引以提高查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
    CREATE INDEX IF NOT EXISTS idx_items_archived ON items(archived);
    CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
    CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
    CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);
  `);
}

// 关闭数据库连接（用于清理资源）
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
