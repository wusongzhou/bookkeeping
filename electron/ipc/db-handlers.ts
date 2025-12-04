/**
 * IPC 数据库操作处理器
 */

import { ipcMain } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import * as db from '../database/sqlite';
import type { CreateItemDTO, UpdateItemDTO, ItemFilter } from '../../lib/types';

export function registerDbHandlers(): void {
  ipcMain.handle('db:getItems', async (_event: IpcMainInvokeEvent, filter?: ItemFilter) => {
    try {
      return db.getAllItems(filter);
    } catch (error) {
      console.error('获取物品列表失败:', error);
      throw error;
    }
  });

  ipcMain.handle('db:getItem', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      return db.getItemById(id);
    } catch (error) {
      console.error('获取物品失败:', error);
      throw error;
    }
  });

  ipcMain.handle('db:createItem', async (_event: IpcMainInvokeEvent, data: CreateItemDTO) => {
    try {
      return db.createItem(data);
    } catch (error) {
      console.error('创建物品失败:', error);
      throw error;
    }
  });

  ipcMain.handle('db:updateItem', async (_event: IpcMainInvokeEvent, id: number, data: UpdateItemDTO) => {
    try {
      return db.updateItem(id, data);
    } catch (error) {
      console.error('更新物品失败:', error);
      throw error;
    }
  });

  ipcMain.handle('db:deleteItem', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      db.deleteItem(id);
      return { success: true };
    } catch (error) {
      console.error('删除物品失败:', error);
      throw error;
    }
  });

  ipcMain.handle('db:archiveItem', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      return db.archiveItem(id);
    } catch (error) {
      console.error('归档物品失败:', error);
      throw error;
    }
  });

  ipcMain.handle('db:unarchiveItem', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      return db.unarchiveItem(id);
    } catch (error) {
      console.error('取消归档失败:', error);
      throw error;
    }
  });

  console.log('IPC 处理器注册完成');
}
