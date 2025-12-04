import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken, type AuthPayload } from './jwt';

/**
 * API 认证中间件
 * 验证请求中的 JWT Token
 */
export function withAuth<T = unknown>(
  handler: (request: NextRequest, user: AuthPayload, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: '未提供认证令牌' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: '认证令牌无效或已过期' },
        { status: 401 }
      );
    }

    // 调用实际的处理函数
    return handler(request, user, context);
  };
}
