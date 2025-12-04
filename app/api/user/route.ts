import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import * as userRepository from '@/lib/db/user-repository';

/**
 * GET /api/user - 获取当前用户信息
 */
export const GET = withAuth(async () => {
  try {
    const user = userRepository.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/user - 更新用户信息
 */
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { username, oldPassword, newPassword } = body;

    // 如果要修改密码,需要验证旧密码
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json(
          { error: '请提供当前密码' },
          { status: 400 }
        );
      }

      // 验证旧密码
      if (!userRepository.verifyPassword(oldPassword)) {
        return NextResponse.json(
          { error: '当前密码不正确' },
          { status: 401 }
        );
      }

      // 验证新密码
      if (!newPassword.trim() || newPassword.length < 6) {
        return NextResponse.json(
          { error: '新密码长度至少为6个字符' },
          { status: 400 }
        );
      }

      // 更新密码
      userRepository.updatePassword(newPassword);
    }

    // 如果要修改用户名
    if (username) {
      if (!username.trim() || username.length < 3) {
        return NextResponse.json(
          { error: '用户名长度至少为3个字符' },
          { status: 400 }
        );
      }

      // 检查用户名是否已存在
      const existingUser = userRepository.getUserByUsername(username);
      const currentUser = userRepository.getCurrentUser();
      
      if (existingUser && existingUser.username !== currentUser?.username) {
        return NextResponse.json(
          { error: '用户名已存在' },
          { status: 409 }
        );
      }

      // 更新用户名
      userRepository.updateUsername(username);
    }

    // 返回更新后的用户信息
    const updatedUser = userRepository.getCurrentUser();
    return NextResponse.json({ 
      success: true, 
      data: updatedUser,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新用户信息失败' },
      { status: 500 }
    );
  }
});
