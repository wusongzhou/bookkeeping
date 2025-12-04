/**
 * 物品列表组件
 * 展示物品列表、筛选功能
 */

'use client';

import { useState } from 'react';
import type { Item, ItemFilter } from '@/lib/types';
import { ItemCard } from './item-card';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface ItemListProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onFilterChange: (filter: ItemFilter) => void;
}

export function ItemList({ items, onItemClick, onFilterChange }: ItemListProps) {
  const [activeFilter, setActiveFilter] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (archived: number | undefined) => {
    setActiveFilter(archived);
    onFilterChange({ archived, search: searchQuery || undefined });
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    onFilterChange({ archived: activeFilter, search: search || undefined });
  };

  return (
    <div className="space-y-6">
      {/* 筛选栏 - Notion 风格 */}
      <div className="bg-white dark:bg-[#2F2F2F] border border-[#E9E9E7] dark:border-[#3F3F3F] rounded-lg p-4 shadow-sm">
        {/* 搜索框 */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787774]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="搜索物品名称或备注..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-[#F7F6F3] dark:bg-[#191919] border-[#E9E9E7] dark:border-[#3F3F3F] text-[#37352F] dark:text-[#E6E6E6]"
            />
          </div>
        </div>

        {/* 筛选按钮组 */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleFilterChange(undefined)}
            variant={activeFilter === undefined ? 'default' : 'outline'}
            size="sm"
            className={activeFilter === undefined ? 'bg-[#2383E2] hover:bg-[#1a73d1] dark:bg-[#529CCA] dark:hover:bg-[#4a8ab8]' : 'hover:bg-[#F1F1EF] dark:hover:bg-[#373737]'}
          >
            全部
          </Button>
          <Button
            onClick={() => handleFilterChange(0)}
            variant={activeFilter === 0 ? 'default' : 'outline'}
            size="sm"
            className={activeFilter === 0 ? 'bg-[#2383E2] hover:bg-[#1a73d1] dark:bg-[#529CCA] dark:hover:bg-[#4a8ab8]' : 'hover:bg-[#F1F1EF] dark:hover:bg-[#373737]'}
          >
            进行中
          </Button>
          <Button
            onClick={() => handleFilterChange(1)}
            variant={activeFilter === 1 ? 'default' : 'outline'}
            size="sm"
            className={activeFilter === 1 ? 'bg-[#2383E2] hover:bg-[#1a73d1] dark:bg-[#529CCA] dark:hover:bg-[#4a8ab8]' : 'hover:bg-[#F1F1EF] dark:hover:bg-[#373737]'}
          >
            已归档
          </Button>
        </div>
      </div>

      {/* 物品列表 */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-[#787774] dark:text-[#9B9A97]">
          <p className="text-base">暂无物品</p>
          <p className="text-sm mt-2">点击上方按钮开始记录你的第一个物品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onClick={() => onItemClick(item)} />
          ))}
        </div>
      )}
    </div>
  );
}
