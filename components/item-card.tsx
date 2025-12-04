/**
 * 物品卡片组件
 * 展示单个物品的摘要信息
 */

'use client';

import { useState, useEffect } from 'react';
import type { Item, Tag } from '@/lib/types';
import { centsToYuan, getItemDailyPrice, getItemUsageDays } from '@/lib/utils/item-utils';
import { useTags } from '@/lib/hooks/use-tags';
import { TagBadge } from './tag-badge';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const tagsApi = useTags();
  const [tags, setTags] = useState<Tag[]>([]);
  const usageDays = getItemUsageDays(item);
  const dailyPriceCents = getItemDailyPrice(item);
  const isArchived = item.archived === 1;

  // 加载物品标签
  useEffect(() => {
    const loadTags = async () => {
      try {
        const itemTags = await tagsApi.getItemTags(item.id);
        setTags(itemTags);
      } catch (error) {
        console.error('加载物品标签失败:', error);
      }
    };
    loadTags();
  }, [item.id, tagsApi]);

  return (
    <Card
      onClick={onClick}
      className="hover:shadow-md cursor-pointer transition-all duration-200 hover:bg-[#F1F1EF] dark:hover:bg-[#373737] bg-white dark:bg-[#2F2F2F] border-[#E9E9E7] dark:border-[#3F3F3F]"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-[#37352F] dark:text-[#E6E6E6]">
            {item.name}
          </h3>
          {isArchived && (
            <Badge variant="secondary" className="bg-[#E9E9E7] dark:bg-[#3F3F3F] text-[#787774] dark:text-[#9B9A97]">
              已归档
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-[#787774] dark:text-[#9B9A97]">
        <div className="flex justify-between">
          <span>购买价格：</span>
          <span className="font-medium text-[#37352F] dark:text-[#E6E6E6]">
            ¥{centsToYuan(item.price_cents)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>使用天数：</span>
          <span className="font-medium text-[#37352F] dark:text-[#E6E6E6]">
            {usageDays} 天
          </span>
        </div>

        <div className="flex justify-between">
          <span>日均成本：</span>
          <span className="font-medium text-[#2383E2] dark:text-[#529CCA]">
            ¥{centsToYuan(dailyPriceCents)} / 天
          </span>
        </div>

        {item.remark && (
          <div className="pt-2 border-t border-[#E9E9E7] dark:border-[#3F3F3F] mt-2">
            <p className="text-[#787774] dark:text-[#9B9A97] truncate">
              {item.remark}
            </p>
          </div>
        )}

        {tags.length > 0 && (
          <div className="pt-2 border-t border-[#E9E9E7] dark:border-[#3F3F3F] mt-2">
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <TagBadge key={tag.id} tag={tag} size="sm" />
              ))}
            </div>
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
