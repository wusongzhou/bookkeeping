/**
 * 物品详情组件
 * 展示物品详细信息和操作按钮
 */

"use client";

import { useState, useEffect } from "react";
import type { Item, Tag } from "@/lib/types";
import {
  centsToYuan,
  getItemDailyPrice,
  getItemUsageDays,
} from "@/lib/utils/item-utils";
import { format, parseISO } from "date-fns";
import { useTags } from "@/lib/hooks/use-tags";
import { TagBadge } from "./tag-badge";

interface ItemDetailProps {
  item: Item;
  onEdit: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ItemDetail({
  item,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onClose,
}: ItemDetailProps) {
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
        console.error("加载物品标签失败:", error);
      }
    };
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "yyyy年MM月dd日");
    } catch {
      return dateStr;
    }
  };

  const handleDelete = () => {
    if (confirm(`确定要删除物品「${item.name}」吗？此操作不可恢复。`)) {
      onDelete();
    }
  };

  const handleArchiveToggle = () => {
    if (isArchived) {
      if (confirm(`确定要取消归档「${item.name}」吗？日均价格将重新计算。`)) {
        onUnarchive();
      }
    } else {
      if (confirm(`确定要归档「${item.name}」吗？日均价格将被锁定。`)) {
        onArchive();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#2F2F2F] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E9E9E7] dark:border-[#3F3F3F]">
        {/* 头部 */}
        <div className="sticky top-0 bg-white dark:bg-[#2F2F2F] border-b border-[#E9E9E7] dark:border-[#3F3F3F] p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-[#37352F] dark:text-[#E6E6E6] mb-2">
                {item.name}
              </h2>
              {isArchived && (
                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-[#E9E9E7] dark:bg-[#3F3F3F] text-[#787774] dark:text-[#9B9A97] rounded">
                  已归档
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-[#787774] hover:text-[#37352F] dark:text-[#9B9A97] dark:hover:text-[#E6E6E6] transition-colors p-1 hover:bg-[#F1F1EF] dark:hover:bg-[#373737] rounded"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#37352F] dark:text-[#E6E6E6]">
              基本信息
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#787774] dark:text-[#9B9A97] mb-1.5">
                  购买日期
                </p>
                <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E6E6]">
                  {formatDate(item.purchased_at)}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#787774] dark:text-[#9B9A97] mb-1.5">
                  购买价格
                </p>
                <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E6E6]">
                  ¥{centsToYuan(item.price_cents)}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#787774] dark:text-[#9B9A97] mb-1.5">
                  使用天数
                </p>
                <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E6E6]">
                  {usageDays} 天{isArchived && " (归档时)"}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#787774] dark:text-[#9B9A97] mb-1.5">
                  日均成本
                </p>
                <p className="text-sm font-medium text-[#2383E2] dark:text-[#529CCA]">
                  ¥{centsToYuan(dailyPriceCents)} / 天
                </p>
              </div>

              {isArchived && item.archived_at && (
                <div className="col-span-2">
                  <p className="text-sm text-[#787774] dark:text-[#9B9A97] mb-1.5">
                    归档时间
                  </p>
                  <p className="text-sm font-medium text-[#37352F] dark:text-[#E6E6E6]">
                    {formatDate(item.archived_at)}
                  </p>
                </div>
              )}
            </div>

            {item.remark && (
              <div>
                <p className="text-sm text-[#787774] dark:text-[#9B9A97] mb-1.5">
                  备注
                </p>
                <p className="text-sm text-[#37352F] dark:text-[#E6E6E6] bg-[#F7F6F3] dark:bg-[#191919] rounded-md p-3 border border-[#E9E9E7] dark:border-[#3F3F3F]">
                  {item.remark}
                </p>
              </div>
            )}

            {tags.length > 0 && (
              <div>
                <p className="text-sm text-[#787774] dark:text-[#9B9A97] mb-2">
                  标签
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} size="md" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="pt-4 border-t border-[#E9E9E7] dark:border-[#3F3F3F]">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-white dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E6E6E6] border border-[#E9E9E7] dark:border-[#3F3F3F] rounded-md hover:bg-[#F1F1EF] dark:hover:bg-[#373737] transition-all font-medium text-sm"
              >
                编辑
              </button>

              <button
                onClick={handleArchiveToggle}
                className="px-4 py-2 bg-white dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E6E6E6] border border-[#E9E9E7] dark:border-[#3F3F3F] rounded-md hover:bg-[#F1F1EF] dark:hover:bg-[#373737] transition-all font-medium text-sm"
              >
                {isArchived ? "取消归档" : "归档"}
              </button>

              <button
                onClick={handleDelete}
                className="col-span-2 px-4 py-2 bg-white dark:bg-[#2F2F2F] text-red-600 dark:text-red-400 border border-[#E9E9E7] dark:border-[#3F3F3F] rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-medium text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
