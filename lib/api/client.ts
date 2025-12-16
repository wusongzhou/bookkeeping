/**
 * API 客户端
 * 处理所有与后端的 HTTP 请求
 */

import type { Item, ItemFilter, PaginatedResult } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Token 管理
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
}

export function getAuthToken(): string | null {
  if (!authToken && typeof window !== "undefined") {
    authToken = localStorage.getItem("auth_token");
  }
  return authToken;
}

/**
 * 通用请求函数
 */
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "请求失败" }));

    // 如果是 401 未授权错误，清除本地 token
    if (response.status === 401) {
      setAuthToken(null);
    }

    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * API 响应格式
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const api = {
  // 认证相关
  auth: {
    login: async (username: string, password: string) => {
      const response = await request<
        ApiResponse<{ token: string; user: { id: string; username: string } }>
      >("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (response.data?.token) {
        setAuthToken(response.data.token);
      }
      return response;
    },
    logout: () => {
      setAuthToken(null);
    },
  },

  // 物品相关
  items: {
    getAll: async (filter?: ItemFilter) => {
      const params = new URLSearchParams();
      if (filter?.archived !== undefined) {
        params.append("archived", filter.archived.toString());
      }
      if (filter?.search) {
        params.append("search", filter.search);
      }
      if (filter?.page) {
        params.append("page", filter.page.toString());
      }
      if (filter?.pageSize) {
        params.append("pageSize", filter.pageSize.toString());
      }
      const queryString = params.toString();
      const url = `/api/items${queryString ? `?${queryString}` : ""}`;
      return request<ApiResponse<PaginatedResult<Item>>>(url);
    },

    getById: async (id: number) => {
      return request<ApiResponse<Item>>(`/api/items/${id}`);
    },

    create: async (data: {
      name: string;
      purchased_at: string;
      price_cents: number;
      remark?: string;
    }) => {
      return request<ApiResponse<Item>>("/api/items", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    update: async (
      id: number,
      data: {
        name?: string;
        purchased_at?: string;
        price_cents?: number;
        remark?: string;
        archived?: number;
        archived_at?: string | null;
        archived_daily_price_cents?: number | null;
      }
    ) => {
      return request<ApiResponse<Item>>(`/api/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse<{ message: string }>>(`/api/items/${id}`, {
        method: "DELETE",
      });
    },
  },

  // 标签相关
  tags: {
    getAll: async () => {
      return request<ApiResponse<import("../types").Tag[]>>("/api/tags");
    },

    getById: async (id: number) => {
      return request<ApiResponse<import("../types").Tag>>(`/api/tags/${id}`);
    },

    create: async (data: { name: string; color?: string }) => {
      return request<ApiResponse<import("../types").Tag>>("/api/tags", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: { name?: string; color?: string }) => {
      return request<ApiResponse<import("../types").Tag>>(`/api/tags/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse<{ message: string }>>(`/api/tags/${id}`, {
        method: "DELETE",
      });
    },

    getItemTags: async (itemId: number) => {
      return request<ApiResponse<import("../types").Tag[]>>(
        `/api/items/${itemId}/tags`
      );
    },

    setItemTags: async (itemId: number, tagIds: number[]) => {
      return request<ApiResponse<import("../types").Tag[]>>(
        `/api/items/${itemId}/tags`,
        {
          method: "PUT",
          body: JSON.stringify({ tag_ids: tagIds }),
        }
      );
    },
  },
};
