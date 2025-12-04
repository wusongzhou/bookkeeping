/**
 * 标签相关类型定义
 */

/**
 * 标签数据模型
 */
export interface Tag {
  id: number;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

/**
 * 创建标签DTO
 */
export interface CreateTagDTO {
  name: string;
  color?: string;
}

/**
 * 更新标签DTO
 */
export interface UpdateTagDTO {
  name?: string;
  color?: string;
}

/**
 * 物品-标签关联
 */
export interface ItemTag {
  id: number;
  item_id: number;
  tag_id: number;
  created_at: string;
}

/**
 * 带标签的物品
 */
export interface ItemWithTags {
  id: number;
  user_id: string;
  name: string;
  purchased_at: string;
  price_cents: number;
  remark: string;
  archived: number;
  archived_at: string | null;
  archived_daily_price_cents: number | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}
