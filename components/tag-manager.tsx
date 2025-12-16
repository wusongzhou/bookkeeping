/**
 * 标签管理组件
 * 用于统一管理所有标签的创建和删除
 */

"use client";

import { useState, useEffect } from "react";
import { useTags } from "@/lib/hooks/use-tags";
import type { Tag } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TagManagerProps {
  open: boolean;
  onClose: () => void;
}

export function TagManager({ open, onClose }: TagManagerProps) {
  const tagsApi = useTags();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 加载所有标签
  useEffect(() => {
    if (open) {
      loadTags();
    }
  }, [open]);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const allTags = await tagsApi.getAllTags();
      setTags(allTags);
    } catch (error) {
      console.error("加载标签失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新标签
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await tagsApi.createTag({
        name: newTagName.trim(),
        color: newTagColor,
      });
      setTags([newTag, ...tags]);
      setNewTagName("");
      setNewTagColor("#3B82F6");
      setIsCreating(false);
    } catch (error) {
      console.error("创建标签失败:", error);
      alert("创建标签失败，请重试");
    }
  };

  // 删除标签
  const handleDeleteTag = async (tagId: number) => {
    if (
      !confirm(
        "确定要删除这个标签吗？删除后，所有使用该标签的物品将失去此标签。"
      )
    ) {
      return;
    }

    setDeletingId(tagId);
    try {
      await tagsApi.deleteTag(tagId);
      setTags(tags.filter((t) => t.id !== tagId));
    } catch (error) {
      console.error("删除标签失败:", error);
      alert("删除标签失败，请重试");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-[#2F2F2F] border-[#E9E9E7] dark:border-[#3F3F3F]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#37352F] dark:text-[#E6E6E6]">
            标签管理
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 创建新标签 */}
          {!isCreating ? (
            <Button
              onClick={() => setIsCreating(true)}
              variant="outline"
              className="w-full"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              创建新标签
            </Button>
          ) : (
            <div className="p-4 border border-[#E9E9E7] dark:border-[#3F3F3F] rounded-lg space-y-3 bg-[#F7F6F3] dark:bg-[#191919]">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#37352F] dark:text-[#E6E6E6] mb-1">
                    标签名称
                  </label>
                  <Input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="例如：电子产品"
                    className="bg-white dark:bg-[#2F2F2F]"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#37352F] dark:text-[#E6E6E6] mb-1">
                    颜色
                  </label>
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-full h-9 border border-[#E9E9E7] dark:border-[#3F3F3F] rounded-md cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  size="sm"
                >
                  创建
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false);
                    setNewTagName("");
                    setNewTagColor("#3B82F6");
                  }}
                  variant="outline"
                  size="sm"
                >
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 标签列表 */}
          <div className="border border-[#E9E9E7] dark:border-[#3F3F3F] rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-[#F7F6F3] dark:bg-[#191919] border-b border-[#E9E9E7] dark:border-[#3F3F3F]">
              <span className="text-sm font-medium text-[#37352F] dark:text-[#E6E6E6]">
                所有标签 ({tags.length})
              </span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-[#787774] dark:text-[#9B9A97]">
                加载中...
              </div>
            ) : tags.length === 0 ? (
              <div className="p-8 text-center text-[#787774] dark:text-[#9B9A97]">
                暂无标签，点击上方按钮创建
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between px-4 py-3 border-b border-[#E9E9E7] dark:border-[#3F3F3F] last:border-b-0 hover:bg-[#F7F6F3] dark:hover:bg-[#373737]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-[#37352F] dark:text-[#E6E6E6]">
                        {tag.name}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleDeleteTag(tag.id)}
                      disabled={deletingId === tag.id}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2"
                    >
                      {deletingId === tag.id ? (
                        <span className="text-xs">删除中...</span>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
