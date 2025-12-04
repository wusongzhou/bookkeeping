/**
 * 物品数据模型定义
 * 根据需求文档设计的数据结构
 */

/**
 * 物品完整信息
 */
export interface Item {
  id: number;                        // 本地主键，自增
  remote_id?: string | null;          // 云端记录 ID（UUID）
  name: string;                       // 物品名称
  purchased_at: string;               // 购买日期（ISO 日期字符串 YYYY-MM-DD）
  price_cents: number;                // 购买价格（以"分"为单位）
  remark?: string;                    // 备注
  archived: number;                   // 是否归档（0=否，1=是）
  archived_at?: string | null;        // 归档时间（ISO 字符串，未归档则为 null）
  archived_daily_price_cents?: number | null;  // 归档时锁定的日均价格（分）
  sync_status: number;                // 同步状态：0=未同步，1=已同步，2=待更新，3=待删除
  last_synced_at?: string | null;     // 最近一次同步成功时间（ISO 字符串）
  created_at: string;                 // 记录创建时间（ISO 字符串）
  updated_at: string;                 // 最近更新时间（ISO 字符串）
  version?: number;                   // 版本号，用于冲突解决
  is_deleted?: number;                // 软删除标记（0=正常，1=已删除）
}

/**
 * 创建物品时的 DTO
 */
export interface CreateItemDTO {
  name: string;                       // 物品名称（必填）
  purchased_at: string;               // 购买日期（必填，YYYY-MM-DD）
  price_cents: number;                // 购买价格（必填，分）
  remark?: string;                    // 备注（可选）
}

/**
 * 更新物品时的 DTO
 */
export interface UpdateItemDTO {
  name?: string;                      // 物品名称
  purchased_at?: string;              // 购买日期
  price_cents?: number;               // 购买价格（分）
  remark?: string;                    // 备注
  archived?: number;                  // 归档状态
  archived_at?: string | null;        // 归档时间
  archived_daily_price_cents?: number | null; // 归档日均价格
}

/**
 * 同步状态枚举
 */
export enum SyncStatus {
  NOT_SYNCED = 0,    // 未同步
  SYNCED = 1,        // 已同步
  PENDING_UPDATE = 2, // 待更新
  PENDING_DELETE = 3  // 待删除
}

/**
 * 归档状态枚举
 */
export enum ArchivedStatus {
  ACTIVE = 0,        // 进行中
  ARCHIVED = 1       // 已归档
}

/**
 * 同步结果
 */
export interface SyncResult {
  success: boolean;
  uploaded: number;     // 上传到云端的记录数
  downloaded: number;   // 从云端下载的记录数
  conflicts: number;    // 冲突数量
  message?: string;     // 结果消息
}

/**
 * 物品筛选条件
 */
export interface ItemFilter {
  archived?: number;    // 归档状态筛选
  search?: string;      // 搜索关键词
}

/**
 * 物品统计信息（用于列表展示）
 */
export interface ItemWithStats extends Item {
  usage_days: number;           // 使用天数
  daily_price_cents: number;    // 日均价格（分）
}
