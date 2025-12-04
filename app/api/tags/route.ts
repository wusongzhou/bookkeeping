import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import * as tagRepository from '@/lib/db/tag-repository';
import type { CreateTagDTO } from '@/lib/types';

/**
 * GET /api/tags - 获取所有标签
 */
export const GET = withAuth(async () => {
  try {
    const tags = tagRepository.getAllTags();
    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    console.error('获取标签列表失败:', error);
    return NextResponse.json(
      { error: '获取标签列表失败' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/tags - 创建新标签
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, color } = body;

    // 验证必填字段
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: '标签名称不能为空' },
        { status: 400 }
      );
    }

    // 验证颜色格式（可选）
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json(
        { error: '颜色格式不正确，应为 #RRGGBB 格式' },
        { status: 400 }
      );
    }

    const tagData: CreateTagDTO = {
      name: name.trim(),
      color: color || undefined,
    };

    const newTag = tagRepository.createTag(tagData);
    return NextResponse.json(
      { success: true, data: newTag },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建标签失败:', error);
    
    // 检查是否是唯一约束冲突
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return NextResponse.json(
        { error: '标签名称已存在' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: '创建标签失败' },
      { status: 500 }
    );
  }
});
