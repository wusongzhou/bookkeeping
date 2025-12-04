/**
 * 物品数据操作 Hook
 * 使用云端 API 进行数据持久化
 */

import { useCallback } from 'react';
import { api } from '../api/client';
import type { Item, CreateItemDTO, UpdateItemDTO, ItemFilter } from '../types';

/**
 * 使用物品数据的 Hook
 */
export function useItems() {
  const getAllItems = useCallback(async (filter?: ItemFilter): Promise<Item[]> => {
    try {
      const response = await api.items.getAll(filter);
      return response.data || [];
    } catch (error) {
      console.error('获取物品列表失败:', error);
      throw error;
    }
  }, []);

  const getItemById = useCallback(async (id: number): Promise<Item | null> => {
    try {
      const response = await api.items.getById(id);
      return response.data || null;
    } catch (error) {
      console.error('获取物品详情失败:', error);
      return null;
    }
  }, []);

  const createItem = useCallback(async (data: CreateItemDTO): Promise<Item> => {
    try {
      const response = await api.items.create(data);
      if (!response.data) {
        throw new Error('创建物品失败');
      }
      return response.data;
    } catch (error) {
      console.error('创建物品失败:', error);
      throw error;
    }
  }, []);

  const updateItem = useCallback(async (id: number, data: UpdateItemDTO): Promise<Item> => {
    try {
      const response = await api.items.update(id, data);
      if (!response.data) {
        throw new Error('更新物品失败');
      }
      return response.data;
    } catch (error) {
      console.error('更新物品失败:', error);
      throw error;
    }
  }, []);

  const deleteItem = useCallback(async (id: number): Promise<void> => {
    try {
      await api.items.delete(id);
    } catch (error) {
      console.error('删除物品失败:', error);
      throw error;
    }
  }, []);

  const archiveItem = useCallback(async (id: number): Promise<Item> => {
    const item = await getItemById(id);
    if (!item) {
      throw new Error('物品不存在');
    }
    
    const usageDays = Math.max(
      Math.floor((Date.now() - new Date(item.purchased_at).getTime()) / (1000 * 60 * 60 * 24)),
      1
    );
    const archivedDailyPrice = Math.floor(item.price_cents / usageDays);
    
    return updateItem(id, {
      archived: 1,
      archived_at: new Date().toISOString(),
      archived_daily_price_cents: archivedDailyPrice,
    });
  }, [getItemById, updateItem]);

  const unarchiveItem = useCallback(async (id: number): Promise<Item> => {
    return updateItem(id, {
      archived: 0,
      archived_at: null,
      archived_daily_price_cents: null,
    });
  }, [updateItem]);

  return {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    archiveItem,
    unarchiveItem,
  };
}
