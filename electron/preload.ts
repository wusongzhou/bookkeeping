/**
 * Electron Preload Script
 * 通过 contextBridge 暴露安全的 API 给 Renderer 进程
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { Item, CreateItemDTO, UpdateItemDTO, ItemFilter } from '../lib/types';

// 定义暴露给 Renderer 的 API
const api = {
  // 获取所有物品
  getItems: (filter?: ItemFilter): Promise<Item[]> => {
    return ipcRenderer.invoke('db:getItems', filter);
  },

  // 获取单个物品
  getItem: (id: number): Promise<Item | null> => {
    return ipcRenderer.invoke('db:getItem', id);
  },

  // 创建物品
  createItem: (data: CreateItemDTO): Promise<Item> => {
    return ipcRenderer.invoke('db:createItem', data);
  },

  // 更新物品
  updateItem: (id: number, data: UpdateItemDTO): Promise<Item> => {
    return ipcRenderer.invoke('db:updateItem', id, data);
  },

  // 删除物品
  deleteItem: (id: number): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('db:deleteItem', id);
  },

  // 归档物品
  archiveItem: (id: number): Promise<Item> => {
    return ipcRenderer.invoke('db:archiveItem', id);
  },

  // 取消归档
  unarchiveItem: (id: number): Promise<Item> => {
    return ipcRenderer.invoke('db:unarchiveItem', id);
  },
};

// 暴露 API 到 window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', api);

// TypeScript 类型定义
export type ElectronAPI = typeof api;
