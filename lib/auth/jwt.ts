import jwt from 'jsonwebtoken';
import * as userRepository from '@/lib/db/user-repository';

// JWT 密钥（生产环境应该使用环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRES_IN = '7d'; // Token 7天过期

export interface AuthPayload {
  userId: string;
  username: string;
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * 验证用户登录
 */
export function validateCredentials(username: string, password: string): AuthPayload | null {
  // 从数据库验证用户凭据
  const user = userRepository.getUserByUsername(username);
  if (!user || user.password !== password) {
    return null;
  }
  
  return {
    userId: user.user_id,
    username: user.username,
  };
}

/**
 * 从请求头中提取 Token
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // 去掉 "Bearer " 前缀
}
