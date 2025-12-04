import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import * as repository from '@/lib/db/repository';
import type { CreateItemDTO, ItemFilter } from '@/lib/types';

/**
 * GET /api/items - 获取所有物品
 * 支持查询参数：archived (0/1)
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const archivedParam = searchParams.get('archived');

    const filter: ItemFilter = {};
    if (archivedParam !== null) {
      filter.archived = parseInt(archivedParam, 10);
    }

    const items = repository.getAllItems(filter);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('获取物品列表失败:', error);
    return NextResponse.json(
      { error: '获取物品列表失败' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/items - 创建新物品
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, purchased_at, price_cents, remark } = body;

    // 验证必填字段
    if (!name || !purchased_at || price_cents === undefined) {
      return NextResponse.json(
        { error: '缺少必填字段：name, purchased_at, price_cents' },
        { status: 400 }
      );
    }

    // 验证数据类型
    if (typeof price_cents !== 'number' || price_cents < 0) {
      return NextResponse.json(
        { error: '价格必须为非负数' },
        { status: 400 }
      );
    }

    const itemData: CreateItemDTO = {
      name,
      purchased_at,
      price_cents,
      remark: remark || '',
    };

    const newItem = repository.createItem(itemData);
    return NextResponse.json(
      { success: true, data: newItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建物品失败:', error);
    return NextResponse.json(
      { error: '创建物品失败' },
      { status: 500 }
    );
  }
});
