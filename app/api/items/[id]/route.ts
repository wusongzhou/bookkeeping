import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import * as repository from '@/lib/db/repository';
import type { UpdateItemDTO } from '@/lib/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/items/:id - 获取单个物品
 */
export const GET = withAuth(async (request: NextRequest, user, context?: RouteContext) => {
  try {
    if (!context?.params) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    const { id } = await context.params;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: '无效的物品 ID' },
        { status: 400 }
      );
    }

    const item = repository.getItemById(itemId);
    if (!item) {
      return NextResponse.json(
        { error: '物品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('获取物品失败:', error);
    return NextResponse.json(
      { error: '获取物品失败' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/items/:id - 更新物品
 */
export const PUT = withAuth(async (request: NextRequest, user, context?: RouteContext) => {
  try {
    if (!context?.params) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
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
    const updateData: UpdateItemDTO = {};

    // 只更新提供的字段
    if (body.name !== undefined) updateData.name = body.name;
    if (body.purchased_at !== undefined) updateData.purchased_at = body.purchased_at;
    if (body.price_cents !== undefined) updateData.price_cents = body.price_cents;
    if (body.remark !== undefined) updateData.remark = body.remark;
    if (body.archived !== undefined) updateData.archived = body.archived;
    if (body.archived_at !== undefined) updateData.archived_at = body.archived_at;
    if (body.archived_daily_price_cents !== undefined) {
      updateData.archived_daily_price_cents = body.archived_daily_price_cents;
    }

    const updatedItem = repository.updateItem(itemId, updateData);
    if (!updatedItem) {
      return NextResponse.json(
        { error: '物品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('更新物品失败:', error);
    return NextResponse.json(
      { error: '更新物品失败' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/items/:id - 删除物品
 */
export const DELETE = withAuth(async (request: NextRequest, user, context?: RouteContext) => {
  try {
    if (!context?.params) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    const { id } = await context.params;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: '无效的物品 ID' },
        { status: 400 }
      );
    }

    const success = repository.deleteItem(itemId);
    if (!success) {
      return NextResponse.json(
        { error: '物品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除物品失败:', error);
    return NextResponse.json(
      { error: '删除物品失败' },
      { status: 500 }
    );
  }
});
