import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import * as tagRepository from '@/lib/db/tag-repository';
import type { UpdateTagDTO } from '@/lib/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tags/[id] - 获取单个标签
 */
export const GET = withAuth(async (_request: NextRequest, _user, context?: RouteContext) => {
  try {
    if (!context) {
      return NextResponse.json(
        { error: '缺少路由参数' },
        { status: 400 }
      );
    }
    
    const { id } = await context.params;
    const tagId = parseInt(id, 10);
    
    if (isNaN(tagId)) {
      return NextResponse.json(
        { error: '无效的标签 ID' },
        { status: 400 }
      );
    }

    const tag = tagRepository.getTagById(tagId);
    if (!tag) {
      return NextResponse.json(
        { error: '标签不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/tags/[id] - 更新标签
 */
export const PUT = withAuth(async (request: NextRequest, _user, context?: RouteContext) => {
  try {
    if (!context) {
      return NextResponse.json(
        { error: '缺少路由参数' },
        { status: 400 }
      );
    }
    
    const { id } = await context.params;
    const tagId = parseInt(id, 10);
    
    if (isNaN(tagId)) {
      return NextResponse.json(
        { error: '无效的标签 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, color } = body;

    // 验证字段
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return NextResponse.json(
        { error: '标签名称不能为空' },
        { status: 400 }
      );
    }

    if (color !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json(
        { error: '颜色格式不正确，应为 #RRGGBB 格式' },
        { status: 400 }
      );
    }

    const updateData: UpdateTagDTO = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (color !== undefined) {
      updateData.color = color;
    }

    const updatedTag = tagRepository.updateTag(tagId, updateData);
    return NextResponse.json({ success: true, data: updatedTag });
  } catch (error) {
    console.error('更新标签失败:', error);
    
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return NextResponse.json(
        { error: '标签名称已存在' },
        { status: 409 }
      );
    }
    
    if (error instanceof Error && error.message.includes('不存在')) {
      return NextResponse.json(
        { error: '标签不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: '更新标签失败' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/tags/[id] - 删除标签
 */
export const DELETE = withAuth(async (_request: NextRequest, _user, context?: RouteContext) => {
  try {
    if (!context) {
      return NextResponse.json(
        { error: '缺少路由参数' },
        { status: 400 }
      );
    }
    
    const { id } = await context.params;
    const tagId = parseInt(id, 10);
    
    if (isNaN(tagId)) {
      return NextResponse.json(
        { error: '无效的标签 ID' },
        { status: 400 }
      );
    }

    tagRepository.deleteTag(tagId);
    return NextResponse.json({ success: true, message: '标签已删除' });
  } catch (error) {
    console.error('删除标签失败:', error);
    return NextResponse.json(
      { error: '删除标签失败' },
      { status: 500 }
    );
  }
});
