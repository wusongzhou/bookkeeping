/**
 * 标签操作 Hook
 */

import { useCallback } from 'react';
import { api } from '../api/client';
import type { Tag, CreateTagDTO, UpdateTagDTO } from '../types';

/**
 * 使用标签数据的 Hook
 */
export function useTags() {
  const getAllTags = useCallback(async (): Promise<Tag[]> => {
    try {
      const response = await api.tags.getAll();
      return response.data || [];
    } catch (error) {
      console.error('获取标签列表失败:', error);
      throw error;
    }
  }, []);

  const getTagById = useCallback(async (id: number): Promise<Tag | null> => {
    try {
      const response = await api.tags.getById(id);
      return response.data || null;
    } catch (error) {
      console.error('获取标签详情失败:', error);
      return null;
    }
  }, []);

  const createTag = useCallback(async (data: CreateTagDTO): Promise<Tag> => {
    try {
      const response = await api.tags.create(data);
      if (!response.data) {
        throw new Error('创建标签失败');
      }
      return response.data;
    } catch (error) {
      console.error('创建标签失败:', error);
      throw error;
    }
  }, []);

  const updateTag = useCallback(async (id: number, data: UpdateTagDTO): Promise<Tag> => {
    try {
      const response = await api.tags.update(id, data);
      if (!response.data) {
        throw new Error('更新标签失败');
      }
      return response.data;
    } catch (error) {
      console.error('更新标签失败:', error);
      throw error;
    }
  }, []);

  const deleteTag = useCallback(async (id: number): Promise<void> => {
    try {
      await api.tags.delete(id);
    } catch (error) {
      console.error('删除标签失败:', error);
      throw error;
    }
  }, []);

  const getItemTags = useCallback(async (itemId: number): Promise<Tag[]> => {
    try {
      const response = await api.tags.getItemTags(itemId);
      return response.data || [];
    } catch (error) {
      console.error('获取物品标签失败:', error);
      throw error;
    }
  }, []);

  const setItemTags = useCallback(async (itemId: number, tagIds: number[]): Promise<Tag[]> => {
    try {
      const response = await api.tags.setItemTags(itemId, tagIds);
      return response.data || [];
    } catch (error) {
      console.error('设置物品标签失败:', error);
      throw error;
    }
  }, []);

  return {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    getItemTags,
    setItemTags,
  };
}
