/**
 * 标签数据访问层
 */

import { getDatabase } from './sqlite';
import type { Tag, CreateTagDTO, UpdateTagDTO, ItemTag } from '../types';

const USER_ID = 'default_user';

/**
 * 获取所有标签
 */
export function getAllTags(): Tag[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(USER_ID) as Tag[];
}

/**
 * 根据ID获取标签
 */
export function getTagById(id: number): Tag | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tags WHERE id = ? AND user_id = ?');
  const tag = stmt.get(id, USER_ID) as Tag | undefined;
  return tag || null;
}

/**
 * 创建标签
 */
export function createTag(data: CreateTagDTO): Tag {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO tags (user_id, name, color, created_at)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    USER_ID,
    data.name,
    data.color || '#3B82F6',
    now
  );
  
  const tag = getTagById(result.lastInsertRowid as number);
  if (!tag) {
    throw new Error('创建标签失败');
  }
  
  return tag;
}

/**
 * 更新标签
 */
export function updateTag(id: number, data: UpdateTagDTO): Tag {
  const db = getDatabase();
  
  const fields: string[] = [];
  const values: (string | number)[] = [];
  
  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  
  if (data.color !== undefined) {
    fields.push('color = ?');
    values.push(data.color);
  }
  
  if (fields.length === 0) {
    const tag = getTagById(id);
    if (!tag) {
      throw new Error('标签不存在');
    }
    return tag;
  }
  
  values.push(id, USER_ID);
  
  const stmt = db.prepare(`
    UPDATE tags SET ${fields.join(', ')}
    WHERE id = ? AND user_id = ?
  `);
  
  stmt.run(...values);
  
  const tag = getTagById(id);
  if (!tag) {
    throw new Error('标签不存在');
  }
  
  return tag;
}

/**
 * 删除标签
 */
export function deleteTag(id: number): void {
  const db = getDatabase();
  
  // 先删除关联关系
  db.prepare('DELETE FROM item_tags WHERE tag_id = ?').run(id);
  
  // 再删除标签
  const stmt = db.prepare('DELETE FROM tags WHERE id = ? AND user_id = ?');
  stmt.run(id, USER_ID);
}

/**
 * 为物品添加标签
 */
export function addTagToItem(itemId: number, tagId: number): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  try {
    const stmt = db.prepare(`
      INSERT INTO item_tags (item_id, tag_id, created_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(itemId, tagId, now);
  } catch (error) {
    // 如果是唯一约束冲突，说明已经关联过了，忽略
    if (error instanceof Error && !error.message?.includes('UNIQUE constraint failed')) {
      throw error;
    }
  }
}

/**
 * 移除物品的标签
 */
export function removeTagFromItem(itemId: number, tagId: number): void {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?');
  stmt.run(itemId, tagId);
}

/**
 * 获取物品的所有标签
 */
export function getItemTags(itemId: number): Tag[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT t.* FROM tags t
    INNER JOIN item_tags it ON t.id = it.tag_id
    WHERE it.item_id = ?
    ORDER BY t.name
  `);
  return stmt.all(itemId) as Tag[];
}

/**
 * 设置物品的标签（替换现有标签）
 */
export function setItemTags(itemId: number, tagIds: number[]): void {
  const db = getDatabase();
  
  // 使用事务确保原子性
  db.transaction(() => {
    // 先删除所有现有标签
    db.prepare('DELETE FROM item_tags WHERE item_id = ?').run(itemId);
    
    // 添加新标签
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO item_tags (item_id, tag_id, created_at)
      VALUES (?, ?, ?)
    `);
    
    for (const tagId of tagIds) {
      stmt.run(itemId, tagId, now);
    }
  })();
}

/**
 * 根据标签筛选物品
 */
export function getItemIdsByTagId(tagId: number): number[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT item_id FROM item_tags WHERE tag_id = ?');
  const results = stmt.all(tagId) as { item_id: number }[];
  return results.map(r => r.item_id);
}
