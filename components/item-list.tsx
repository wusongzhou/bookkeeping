/**
 * 物品列表组件
 * 展示物品列表、筛选功能、分页
 */

"use client";

import type { Item, ItemFilter } from "@/lib/types";
import { useItemStore } from "@/lib/store/item-store";
import { ItemCard } from "./item-card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Pagination, PaginationInfo } from "./ui/pagination";

interface ItemListProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onFilterChange: (filter: ItemFilter) => void;
  onPageChange: (page: number) => void;
  onSortChange: () => void;
}

export function ItemList({
  items,
  onItemClick,
  onFilterChange,
  onPageChange,
  onSortChange,
}: ItemListProps) {
  // 从 store 获取当前的 filter 和分页状态
  const { filter, pagination } = useItemStore();
  const activeFilter = filter.archived;
  const searchQuery = filter.search || "";
  const sortOrder = filter.sortOrder || "desc";
  const { page, totalPages, total } = pagination;

  const handleFilterChange = (archived: number | undefined) => {
    onFilterChange({ archived, search: searchQuery || undefined });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ archived: activeFilter, search: search || undefined });
  };

  return (
    <div className="space-y-6">
      {/* 筛选栏 - Notion 风格 */}
      <div className="bg-white dark:bg-[#2F2F2F] border border-[#E9E9E7] dark:border-[#3F3F3F] rounded-lg p-4 shadow-sm">
        {/* 搜索框 */}
        <div className="mb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787774]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
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
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => handleFilterChange(undefined)}
              variant={activeFilter === undefined ? "default" : "outline"}
              size="sm"
            >
              全部
            </Button>
            <Button
              onClick={() => handleFilterChange(0)}
              variant={activeFilter === 0 ? "default" : "outline"}
              size="sm"
            >
              进行中
            </Button>
            <Button
              onClick={() => handleFilterChange(1)}
              variant={activeFilter === 1 ? "default" : "outline"}
              size="sm"
            >
              已归档
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* 排序按钮 */}
            <Button
              onClick={onSortChange}
              variant="ghost"
              size="sm"
              className="text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF] dark:hover:text-[#E6E6E6] dark:hover:bg-[#373737] gap-1.5"
              title={sortOrder === "desc" ? "最新购买在前" : "最早购买在前"}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sortOrder === "desc" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l4-4m-4 4V4"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                )}
              </svg>
              {sortOrder === "desc" ? "新→旧" : "旧→新"}
            </Button>

            {/* 总数显示 */}
            <span className="text-sm text-[#787774] dark:text-[#9B9A97]">
              共 {total} 件物品
            </span>
          </div>
        </div>
      </div>

      {/* 物品列表 */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-[#787774] dark:text-[#9B9A97]">
          <p className="text-base">暂无物品</p>
          <p className="text-sm mt-2">点击上方按钮开始记录你的第一个物品</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => onItemClick(item)}
              />
            ))}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
              <PaginationInfo
                currentPage={page}
                pageSize={pagination.pageSize}
                total={total}
              />
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
