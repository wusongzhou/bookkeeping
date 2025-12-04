import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import * as tagRepository from '@/lib/db/tag-repository';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/items/[id]/tags - 获取物品的所有标签
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
    const itemId = parseInt(id, 10);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: '无效的物品 ID' },
        { status: 400 }
      );
    }

    const tags = tagRepository.getItemTags(itemId);
    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    console.error('获取物品标签失败:', error);
    return NextResponse.json(
      { error: '获取物品标签失败' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/items/[id]/tags - 设置物品的标签（替换现有标签）
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
    const itemId = parseInt(id, 10);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: '无效的物品 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { tag_ids } = body;

    // 验证 tag_ids 是数组
    if (!Array.isArray(tag_ids)) {
      return NextResponse.json(
        { error: 'tag_ids 必须是数组' },
        { status: 400 }
      );
    }

    // 验证所有 tag_id 都是数字
    const tagIds = tag_ids.map((id: unknown) => {
      if (typeof id !== 'number' || isNaN(id)) {
        throw new Error('无效的标签 ID');
      }
      return id;
    });

    tagRepository.setItemTags(itemId, tagIds);
    const updatedTags = tagRepository.getItemTags(itemId);
    
    return NextResponse.json({ success: true, data: updatedTags });
  } catch (error) {
    console.error('设置物品标签失败:', error);
    
    if (error instanceof Error && error.message.includes('无效的标签 ID')) {
      return NextResponse.json(
        { error: 'tag_ids 包含无效的 ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '设置物品标签失败' },
      { status: 500 }
    );
  }
});
