/**
 * 分页组件
 * 支持页码显示、首页末页、省略号
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 显示的页码按钮数量（不包括首页末页），默认 5 */
  siblingCount?: number;
  /** 是否显示首页末页按钮 */
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 2,
  showFirstLast = true,
  className,
}: PaginationProps) {
  // 生成页码数组
  const generatePages = React.useMemo(() => {
    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];

    if (totalPages <= 1) return pages;

    // 总是显示第一页
    pages.push(1);

    // 计算中间页码的范围
    const leftSibling = Math.max(2, currentPage - siblingCount);
    const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);

    // 左侧省略号
    if (leftSibling > 2) {
      pages.push("ellipsis-start");
    } else if (leftSibling === 2) {
      pages.push(2);
    }

    // 中间页码
    for (
      let i = Math.max(2, leftSibling);
      i <= Math.min(totalPages - 1, rightSibling);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // 右侧省略号
    if (rightSibling < totalPages - 1) {
      pages.push("ellipsis-end");
    } else if (
      rightSibling === totalPages - 1 &&
      !pages.includes(totalPages - 1)
    ) {
      pages.push(totalPages - 1);
    }

    // 总是显示最后一页（如果大于1）
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, siblingCount]);

  if (totalPages <= 1) {
    return null;
  }

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="分页导航"
    >
      {/* 首页按钮 */}
      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev}
          className="h-8 w-8 p-0"
          aria-label="首页"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </Button>
      )}

      {/* 上一页按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className="h-8 w-8 p-0"
        aria-label="上一页"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Button>

      {/* 页码按钮 */}
      <div className="flex items-center gap-1">
        {generatePages.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <span
                key={page}
                className="flex h-8 w-8 items-center justify-center text-[#787774] dark:text-[#9B9A97]"
              >
                ···
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <Button
              key={page}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                "h-8 w-8 p-0 font-medium",
                isActive && "pointer-events-none"
              )}
              aria-label={`第 ${page} 页`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* 下一页按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="h-8 w-8 p-0"
        aria-label="下一页"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>

      {/* 末页按钮 */}
      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className="h-8 w-8 p-0"
          aria-label="末页"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </Button>
      )}
    </nav>
  );
}

/** 分页信息显示组件 */
interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  total: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  pageSize,
  total,
  className,
}: PaginationInfoProps) {
  const start = Math.min((currentPage - 1) * pageSize + 1, total);
  const end = Math.min(currentPage * pageSize, total);

  if (total === 0) {
    return null;
  }

  return (
    <p className={cn("text-sm text-[#787774] dark:text-[#9B9A97]", className)}>
      显示 {start}-{end} 条，共 {total} 条
    </p>
  );
}
