/**
 * 用户数据访问层
 */

import { getDatabase } from './sqlite';

export interface User {
  id: number;
  user_id: string;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
}

const USER_ID = 'default_user';

/**
 * 根据用户ID获取用户信息
 */
export function getUserByUserId(userId: string): User | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE user_id = ?');
  const user = stmt.get(userId) as User | undefined;
  return user || null;
}

/**
 * 根据用户名获取用户信息
 */
export function getUserByUsername(username: string): User | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const user = stmt.get(username) as User | undefined;
  return user || null;
}

/**
 * 更新用户名
 */
export function updateUsername(newUsername: string): User {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE users 
    SET username = ?, updated_at = ?
    WHERE user_id = ?
  `);
  
  stmt.run(newUsername, now, USER_ID);
  
  const user = getUserByUserId(USER_ID);
  if (!user) {
    throw new Error('用户不存在');
  }
  
  return user;
}

/**
 * 更新密码
 */
export function updatePassword(newPassword: string): User {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE users 
    SET password = ?, updated_at = ?
    WHERE user_id = ?
  `);
  
  stmt.run(newPassword, now, USER_ID);
  
  const user = getUserByUserId(USER_ID);
  if (!user) {
    throw new Error('用户不存在');
  }
  
  return user;
}

/**
 * 验证密码
 */
export function verifyPassword(password: string): boolean {
  const user = getUserByUserId(USER_ID);
  if (!user) {
    return false;
  }
  return user.password === password;
}

/**
 * 获取当前用户信息（不含密码）
 */
export function getCurrentUser(): Omit<User, 'password'> | null {
  const user = getUserByUserId(USER_ID);
  if (!user) {
    return null;
  }
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
