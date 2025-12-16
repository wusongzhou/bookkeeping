/**
 * 物品状态管理
 * 使用 Zustand 管理物品列表和 UI 状态
 */

import { create } from "zustand";
import type { Item, ItemFilter } from "../types";

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ItemStore {
  items: Item[];
  filter: ItemFilter;
  pagination: PaginationState;
  selectedItem: Item | null;
  isFormOpen: boolean;
  editingItem: Item | null;
  isDetailOpen: boolean;

  // 设置物品列表
  setItems: (items: Item[]) => void;

  // 设置分页信息
  setPagination: (pagination: Partial<PaginationState>) => void;

  // 添加物品
  addItem: (item: Item) => void;

  // 更新物品
  updateItem: (id: number, item: Item) => void;

  // 删除物品
  removeItem: (id: number) => void;

  // 设置筛选条件
  setFilter: (filter: ItemFilter) => void;

  // 设置页码
  setPage: (page: number) => void;

  // 选择物品（查看详情）
  selectItem: (item: Item | null) => void;

  // 打开/关闭表单
  openForm: (item?: Item) => void;
  closeForm: () => void;

  // 打开/关闭详情
  openDetail: (item: Item) => void;
  closeDetail: () => void;
}

export const useItemStore = create<ItemStore>((set, get) => ({
  items: [],
  filter: {},
  pagination: {
    page: 1,
    pageSize: 9,
    total: 0,
    totalPages: 0,
  },
  selectedItem: null,
  isFormOpen: false,
  editingItem: null,
  isDetailOpen: false,

  setItems: (items: Item[]) => set({ items }),

  setPagination: (pagination: Partial<PaginationState>) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  addItem: (item: Item) =>
    set((state) => ({
      items: [item, ...state.items],
      pagination: { ...state.pagination, total: state.pagination.total + 1 },
    })),

  updateItem: (id: number, item: Item) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? item : i)),
    })),

  removeItem: (id: number) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      pagination: {
        ...state.pagination,
        total: Math.max(0, state.pagination.total - 1),
      },
    })),

  setFilter: (filter: ItemFilter) =>
    set((state) => ({
      filter,
      // 切换筛选条件时重置到第一页
      pagination: { ...state.pagination, page: 1 },
    })),

  setPage: (page: number) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),

  selectItem: (item: Item | null) => set({ selectedItem: item }),

  openForm: (item?: Item) =>
    set({
      isFormOpen: true,
      editingItem: item || null,
    }),

  closeForm: () =>
    set({
      isFormOpen: false,
      editingItem: null,
    }),

  openDetail: (item: Item) =>
    set({
      isDetailOpen: true,
      selectedItem: item,
    }),

  closeDetail: () =>
    set({
      isDetailOpen: false,
      selectedItem: null,
    }),
}));
