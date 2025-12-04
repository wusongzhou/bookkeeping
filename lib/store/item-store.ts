/**
 * 物品状态管理
 * 使用 Zustand 管理物品列表和 UI 状态
 */

import { create, StateCreator } from 'zustand';
import type { Item, ItemFilter } from '../types';

interface ItemStore {
  items: Item[];
  filter: ItemFilter;
  selectedItem: Item | null;
  isFormOpen: boolean;
  editingItem: Item | null;
  isDetailOpen: boolean;
  
  // 设置物品列表
  setItems: (items: Item[]) => void;
  
  // 添加物品
  addItem: (item: Item) => void;
  
  // 更新物品
  updateItem: (id: number, item: Item) => void;
  
  // 删除物品
  removeItem: (id: number) => void;
  
  // 设置筛选条件
  setFilter: (filter: ItemFilter) => void;
  
  // 选择物品（查看详情）
  selectItem: (item: Item | null) => void;
  
  // 打开/关闭表单
  openForm: (item?: Item) => void;
  closeForm: () => void;
  
  // 打开/关闭详情
  openDetail: (item: Item) => void;
  closeDetail: () => void;
  
  // 获取筛选后的物品列表
  getFilteredItems: () => Item[];
}

export const useItemStore = create<ItemStore>((set, get) => ({
  items: [],
  filter: {},
  selectedItem: null,
  isFormOpen: false,
  editingItem: null,
  isDetailOpen: false,
  
  setItems: (items: Item[]) => set({ items }),
  
  addItem: (item: Item) => set((state) => ({ 
    items: [item, ...state.items] 
  })),
  
  updateItem: (id: number, item: Item) => set((state) => ({
    items: state.items.map((i) => (i.id === id ? item : i))
  })),
  
  removeItem: (id: number) => set((state) => ({
    items: state.items.filter((i) => i.id !== id)
  })),
  
  setFilter: (filter: ItemFilter) => set({ filter }),
  
  selectItem: (item: Item | null) => set({ selectedItem: item }),
  
  openForm: (item?: Item) => set({ 
    isFormOpen: true, 
    editingItem: item || null 
  }),
  
  closeForm: () => set({ 
    isFormOpen: false, 
    editingItem: null 
  }),
  
  openDetail: (item: Item) => set({ 
    isDetailOpen: true, 
    selectedItem: item 
  }),
  
  closeDetail: () => set({ 
    isDetailOpen: false, 
    selectedItem: null 
  }),
  
  getFilteredItems: () => {
    const { items, filter } = get();
    let filtered = items.filter(item => !item.is_deleted);
    
    // 按归档状态筛选
    if (filter.archived !== undefined) {
      filtered = filtered.filter(item => item.archived === filter.archived);
    }
    
    // 按搜索关键词筛选
    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search) ||
        (item.remark && item.remark.toLowerCase().includes(search))
      );
    }
    
    return filtered;
  }
}));
