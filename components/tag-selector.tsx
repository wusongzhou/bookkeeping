/**
 * 标签选择器组件
 * 用于在物品表单中选择标签
 */

"use client";

import { useState, useEffect } from "react";
import { useTags } from "@/lib/hooks/use-tags";
import { TagBadge } from "./tag-badge";
import type { Tag } from "@/lib/types";

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const tagsApi = useTags();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");

  // 加载所有标签
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await tagsApi.getAllTags();
        setAllTags(tags);
      } catch (error) {
        console.error("加载标签失败:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 切换标签选择状态
  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
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
      setAllTags([...allTags, newTag]);
      onChange([...selectedTagIds, newTag.id]);
      setNewTagName("");
      setNewTagColor("#3B82F6");
      setIsCreating(false);
    } catch (error) {
      console.error("创建标签失败:", error);
      alert("创建标签失败，请重试");
    }
  };

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));
  const availableTags = allTags.filter(
    (tag) => !selectedTagIds.includes(tag.id)
  );

  if (isLoading) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        加载标签...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 已选择的标签 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={() => toggleTag(tag.id)}
              size="md"
            />
          ))}
        </div>
      )}

      {/* 可选标签列表 */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            选择标签
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="transition-opacity hover:opacity-70"
              >
                <TagBadge tag={tag} size="md" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 创建新标签 */}
      {!isCreating ? (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          + 创建新标签
        </button>
      ) : (
        <div className="p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                标签名称
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="例如：电子产品"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                颜色
              </label>
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-full h-10 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              创建
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewTagName("");
                setNewTagColor("#3B82F6");
              }}
              className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
