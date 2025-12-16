/**
 * 物品表单组件
 * 用于新建和编辑物品
 */

"use client";

import { useState, useEffect } from "react";
import type { Item, CreateItemDTO } from "@/lib/types";
import {
  yuanToCents,
  centsToYuan,
  formatDateToISO,
} from "@/lib/utils/item-utils";
import { TagSelector } from "./tag-selector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DatePicker } from "./ui/date-picker";

interface ItemFormProps {
  item?: Item | null;
  onSubmit: (data: CreateItemDTO, tagIds: number[]) => Promise<void>;
  onCancel: () => void;
  initialTagIds?: number[];
}

export function ItemForm({
  item,
  onSubmit,
  onCancel,
  initialTagIds = [],
}: ItemFormProps) {
  const [name, setName] = useState("");
  const [purchasedAt, setPurchasedAt] = useState("");
  const [priceYuan, setPriceYuan] = useState("");
  const [remark, setRemark] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initialTagIds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 编辑时填充表单
  useEffect(() => {
    if (item) {
      setName(item.name);
      setPurchasedAt(item.purchased_at);
      setPriceYuan(centsToYuan(item.price_cents));
      setRemark(item.remark || "");
    } else {
      // 新建时清空
      setName("");
      setPurchasedAt(formatDateToISO(new Date()));
      setPriceYuan("");
      setRemark("");
      setSelectedTagIds(initialTagIds);
    }
    setErrors({});
  }, [item, initialTagIds]);

  // 表单验证
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "物品名称不能为空";
    }

    if (!purchasedAt) {
      newErrors.purchasedAt = "购买日期不能为空";
    } else {
      const date = new Date(purchasedAt);
      if (date > new Date()) {
        newErrors.purchasedAt = "购买日期不能晚于当前日期";
      }
    }

    if (!priceYuan.trim()) {
      newErrors.priceYuan = "购买价格不能为空";
    } else {
      const price = parseFloat(priceYuan);
      if (isNaN(price) || price < 0) {
        newErrors.priceYuan = "请输入有效的价格";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data: CreateItemDTO = {
        name: name.trim(),
        purchased_at: purchasedAt,
        price_cents: yuanToCents(parseFloat(priceYuan)),
        remark: remark.trim() || undefined,
      };

      await onSubmit(data, selectedTagIds);
    } catch (error) {
      console.error("提交表单失败:", error);
      alert("操作失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#2F2F2F] border-[#E9E9E7] dark:border-[#3F3F3F]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#37352F] dark:text-[#E6E6E6]">
            {item ? "编辑物品" : "新建物品"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 物品名称 */}
          <div>
            <Label
              htmlFor="name"
              className="text-[#37352F] dark:text-[#E6E6E6]"
            >
              物品名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 bg-[#F7F6F3] dark:bg-[#191919] border-[#E9E9E7] dark:border-[#3F3F3F] text-[#37352F] dark:text-[#E6E6E6]"
              placeholder="例如：MacBook Pro"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1.5">{errors.name}</p>
            )}
          </div>

          {/* 购买日期 */}
          <div>
            <Label
              htmlFor="purchasedAt"
              className="text-[#37352F] dark:text-[#E6E6E6]"
            >
              购买日期 <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1.5">
              <DatePicker
                value={purchasedAt}
                onChange={setPurchasedAt}
                maxDate={new Date()}
                placeholder="选择购买日期"
              />
            </div>
            {errors.purchasedAt && (
              <p className="text-red-500 text-sm mt-1.5">
                {errors.purchasedAt}
              </p>
            )}
          </div>

          {/* 购买价格 */}
          <div>
            <Label
              htmlFor="priceYuan"
              className="text-[#37352F] dark:text-[#E6E6E6]"
            >
              购买价格（元）<span className="text-red-500">*</span>
            </Label>
            <Input
              id="priceYuan"
              type="number"
              step="0.01"
              min="0"
              value={priceYuan}
              onChange={(e) => setPriceYuan(e.target.value)}
              className="mt-1.5 bg-[#F7F6F3] dark:bg-[#191919] border-[#E9E9E7] dark:border-[#3F3F3F] text-[#37352F] dark:text-[#E6E6E6]"
              placeholder="例如：1200.00"
            />
            {errors.priceYuan && (
              <p className="text-red-500 text-sm mt-1.5">{errors.priceYuan}</p>
            )}
          </div>

          {/* 备注 */}
          <div>
            <Label
              htmlFor="remark"
              className="text-[#37352F] dark:text-[#E6E6E6]"
            >
              备注（可选）
            </Label>
            <textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              className="mt-1.5 w-full px-3 py-2 border border-[#E9E9E7] dark:border-[#3F3F3F] rounded-md bg-[#F7F6F3] dark:bg-[#191919] text-[#37352F] dark:text-[#E6E6E6] text-sm transition-all placeholder:text-[#787774] dark:placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2] dark:focus:ring-[#529CCA] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="可以添加一些说明..."
            />
          </div>

          {/* 标签 */}
          <div>
            <Label className="text-[#37352F] dark:text-[#E6E6E6] mb-2 block">
              标签（可选）
            </Label>
            <TagSelector
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
            />
          </div>

          {/* 按钮组 */}
          <DialogFooter className="pt-4 gap-3">
            <Button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              variant="outline"
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#2383E2] hover:bg-[#1a73d1] dark:bg-[#529CCA] dark:hover:bg-[#4a8ab8]"
            >
              {isSubmitting ? "提交中..." : item ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
