/**
 * 业务逻辑工具函数
 * 使用天数计算、日均价格计算、归档逻辑等
 */

import { differenceInDays, parseISO, format } from 'date-fns';
import type { Item } from '../types';

/**
 * 计算使用天数
 */
export function calculateUsageDays(
  purchasedAt: string,
  archivedAt?: string | null
): number {
  const startDate = parseISO(purchasedAt);
  const endDate = archivedAt ? parseISO(archivedAt) : new Date();
  
  const days = differenceInDays(endDate, startDate);
  return Math.max(days, 1); // 至少 1 天
}

/**
 * 计算日均价格（分）
 */
export function calculateDailyPriceCents(
  priceCents: number,
  usageDays: number
): number {
  const days = Math.max(usageDays, 1);
  return Math.floor(priceCents / days);
}

/**
 * 分转元
 */
export function centsToYuan(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * 元转分
 */
export function yuanToCents(yuan: number): number {
  return Math.round(yuan * 100);
}

/**
 * 格式化日期
 */
export function formatDateToISO(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-DD');
}

/**
 * 获取物品日均价格
 */
export function getItemDailyPrice(item: Item): number {
  if (item.archived === 1 && item.archived_daily_price_cents !== null && item.archived_daily_price_cents !== undefined) {
    return item.archived_daily_price_cents;
  }
  
  const usageDays = calculateUsageDays(item.purchased_at, item.archived_at);
  return calculateDailyPriceCents(item.price_cents, usageDays);
}

/**
 * 获取使用天数
 */
export function getItemUsageDays(item: Item): number {
  return calculateUsageDays(item.purchased_at, item.archived_at);
}
