/**
 * 主页面
 * 物品成本管理系统
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useItemStore } from "@/lib/store/item-store";
import { useItems } from "@/lib/hooks/use-items";
import { useTags } from "@/lib/hooks/use-tags";
import { ItemList } from "@/components/item-list";
import { ItemForm } from "@/components/item-form";
import { ItemDetail } from "@/components/item-detail";
import { LoginModal, useAuth } from "@/components/login-modal";
import { UserSettings } from "@/components/user-settings";
import { Button } from "@/components/ui/button";
import type { CreateItemDTO, UpdateItemDTO, ItemFilter } from "@/lib/types";

export default function Home() {
  const { isAuthenticated, isChecking, logout, setIsAuthenticated } = useAuth();
  const itemsApi = useItems();
  const tagsApi = useTags();
  const {
    items,
    setItems,
    filter,
    pagination,
    setPagination,
    setFilter,
    setPage,
    addItem,
    updateItem,
    removeItem,
    isFormOpen,
    editingItem,
    openForm,
    closeForm,
    selectedItem,
    openDetail,
    closeDetail,
  } = useItemStore();

  const [loading, setLoading] = useState(false);
  const [editingItemTagIds, setEditingItemTagIds] = useState<number[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 加载数据函数
  const loadItems = useCallback(
    async (currentFilter: ItemFilter, page: number) => {
      setLoading(true);
      try {
        const result = await itemsApi.getAllItems({
          ...currentFilter,
          page,
          pageSize: pagination.pageSize,
        });
        setItems(result.items);
        setPagination({
          page: result.page,
          total: result.total,
          totalPages: result.totalPages,
        });
      } catch (error) {
        console.error("加载数据失败:", error);
        if (error instanceof Error && error.message.includes("认证")) {
          setIsAuthenticated(false);
        } else {
          alert("加载数据失败，请重试");
        }
      } finally {
        setLoading(false);
      }
    },
    [itemsApi, pagination.pageSize, setItems, setPagination, setIsAuthenticated]
  );

  // 初始化：加载数据（仅在认证成功后执行）
  useEffect(() => {
    if (!isAuthenticated || isChecking) {
      return;
    }
    loadItems(filter, pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isChecking]);

  // 处理筛选变化
  const handleFilterChange = useCallback(
    (newFilter: ItemFilter) => {
      setFilter(newFilter);
      // 筛选变化时从第一页开始
      loadItems(newFilter, 1);
    },
    [setFilter, loadItems]
  );

  // 处理翻页
  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page);
      loadItems(filter, page);
    },
    [setPage, filter, loadItems]
  );

  // 创建或更新物品
  const handleSubmit = async (data: CreateItemDTO, tagIds: number[]) => {
    try {
      if (editingItem) {
        // 更新
        const updated = await itemsApi.updateItem(
          editingItem.id,
          data as UpdateItemDTO
        );
        // 更新标签
        await tagsApi.setItemTags(editingItem.id, tagIds);
        updateItem(editingItem.id, updated);
      } else {
        // 创建
        const created = await itemsApi.createItem(data);
        // 设置标签
        if (tagIds.length > 0) {
          await tagsApi.setItemTags(created.id, tagIds);
        }
        // 创建后重新加载当前页
        loadItems(filter, pagination.page);
      }
      closeForm();
    } catch (error) {
      console.error("保存失败:", error);
      throw error;
    }
  };

  // 归档物品
  const handleArchive = async () => {
    if (!selectedItem) return;
    try {
      const archived = await itemsApi.archiveItem(selectedItem.id);
      updateItem(selectedItem.id, archived);
      closeDetail();
    } catch (error) {
      console.error("归档失败:", error);
      alert("归档失败，请重试");
    }
  };

  // 取消归档
  const handleUnarchive = async () => {
    if (!selectedItem) return;
    try {
      const unarchived = await itemsApi.unarchiveItem(selectedItem.id);
      updateItem(selectedItem.id, unarchived);
      closeDetail();
    } catch (error) {
      console.error("取消归档失败:", error);
      alert("取消归档失败，请重试");
    }
  };

  // 删除物品
  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await itemsApi.deleteItem(selectedItem.id);
      removeItem(selectedItem.id);
      closeDetail();
      // 删除后重新加载当前页
      loadItems(filter, pagination.page);
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败，请重试");
    }
  };

  // 编辑物品
  const handleEdit = async () => {
    if (selectedItem) {
      // 加载物品的标签
      try {
        const tags = await tagsApi.getItemTags(selectedItem.id);
        setEditingItemTagIds(tags.map((t) => t.id));
      } catch (error) {
        console.error("加载物品标签失败:", error);
        setEditingItemTagIds([]);
      }
      closeDetail();
      openForm(selectedItem);
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F6F3] dark:bg-[#191919]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-[#2383E2] dark:border-[#529CCA] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#787774] dark:text-[#9B9A97] text-base">
            加载中...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F6F3] dark:bg-[#191919]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-[#2383E2] dark:border-[#529CCA] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#787774] dark:text-[#9B9A97] text-base">
            加载中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] dark:bg-[#191919]">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* 顶部标题栏 - Notion 风格 */}
        <div className="mb-10 pb-8 border-b border-[#E9E9E7] dark:border-[#3F3F3F]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-semibold text-[#37352F] dark:text-[#E6E6E6] mb-2">
                物品成本管理
              </h1>
              <p className="text-[#787774] dark:text-[#9B9A97] text-sm">
                记录每一件物品的使用成本，让花费更有意义
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setSettingsOpen(true)}
                variant="ghost"
                size="sm"
                className="text-[#787774] hover:bg-[#F1F1EF] dark:hover:bg-[#373737]"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                设置
              </Button>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-[#787774] hover:bg-[#F1F1EF] dark:hover:bg-[#373737]"
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>

        {/* 新建按钮 - Notion 风格 */}
        <div className="mb-6">
          <Button
            onClick={() => openForm()}
            size="lg"
            className="bg-[#2383E2] hover:bg-[#1a73d1] dark:bg-[#529CCA] dark:hover:bg-[#4a8ab8] text-white shadow-sm"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新建物品
          </Button>
        </div>

        {/* 物品列表 */}
        <ItemList
          items={items}
          onItemClick={openDetail}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
        />
      </div>

      {/* 表单弹窗 */}
      {isFormOpen && (
        <ItemForm
          item={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => {
            setEditingItemTagIds([]);
            closeForm();
          }}
          initialTagIds={editingItem ? editingItemTagIds : []}
        />
      )}

      {/* 详情弹窗 */}
      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onUnarchive={handleUnarchive}
          onDelete={handleDelete}
          onClose={closeDetail}
        />
      )}

      {/* 设置弹窗 */}
      <UserSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
