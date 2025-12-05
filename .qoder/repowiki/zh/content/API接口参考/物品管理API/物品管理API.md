# 物品管理API详细文档

<cite>
**本文档引用的文件**
- [app/api/items/route.ts](file://app/api/items/route.ts)
- [app/api/items/[id]/route.ts](file://app/api/items/[id]/route.ts)
- [lib/types/item.ts](file://lib/types/item.ts)
- [lib/db/repository.ts](file://lib/db/repository.ts)
- [lib/utils/item-utils.ts](file://lib/utils/item-utils.ts)
- [lib/hooks/use-items.ts](file://lib/hooks/use-items.ts)
- [lib/api/client.ts](file://lib/api/client.ts)
- [lib/store/item-store.ts](file://lib/store/item-store.ts)
- [lib/db/sqlite.ts](file://lib/db/sqlite.ts)
- [components/item-list.tsx](file://components/item-list.tsx)
- [components/item-form.tsx](file://components/item-form.tsx)
- [README.md](file://README.md)
</cite>

## 目录
1. [简介](#简介)
2. [API架构概览](#api架构概览)
3. [认证机制](#认证机制)
4. [物品数据模型](#物品数据模型)
5. [核心API接口](#核心api接口)
6. [物品生命周期管理](#物品生命周期管理)
7. [归档状态处理](#归档状态处理)
8. [使用天数和日均价格计算](#使用天数和日均价格计算)
9. [错误处理和状态码](#错误处理和状态码)
10. [完整curl命令示例](#完整curl命令示例)
11. [前端集成指南](#前端集成指南)
12. [最佳实践建议](#最佳实践建议)

## 简介

物品管理API是一个基于Next.js的RESTful API系统，专门用于管理个人物品的成本信息。该系统提供了完整的物品生命周期管理功能，包括创建、查询、更新、删除以及归档操作。API采用单用户模式设计，使用JWT进行身份认证，并通过SQLite数据库进行数据持久化。

### 核心功能特性

- **物品信息管理**：支持物品名称、购买日期、价格、备注等基本信息
- **自动成本计算**：自动计算使用天数和日均成本
- **归档功能**：支持物品归档和退役，锁定最终成本
- **筛选和搜索**：支持按归档状态和关键词进行筛选
- **数据持久化**：使用SQLite数据库确保数据不丢失

## API架构概览

```mermaid
graph TB
subgraph "客户端层"
WebApp[Web应用]
MobileApp[移动端应用]
end
subgraph "API网关层"
AuthMiddleware[认证中间件]
APIRoutes[Next.js API路由]
end
subgraph "业务逻辑层"
ItemController[物品控制器]
ItemService[物品服务]
Utils[工具函数]
end
subgraph "数据访问层"
Repository[仓储层]
SQLite[(SQLite数据库)]
end
WebApp --> AuthMiddleware
MobileApp --> AuthMiddleware
AuthMiddleware --> APIRoutes
APIRoutes --> ItemController
ItemController --> ItemService
ItemService --> Utils
ItemService --> Repository
Repository --> SQLite
```

**图表来源**
- [app/api/items/route.ts](file://app/api/items/route.ts#L1-L75)
- [lib/db/repository.ts](file://lib/db/repository.ts#L1-L156)
- [lib/db/sqlite.ts](file://lib/db/sqlite.ts#L1-L109)

## 认证机制

系统采用JWT（JSON Web Token）进行身份认证，所有需要访问用户数据的API接口都需要在请求头中包含有效的认证令牌。

### 认证流程

```mermaid
sequenceDiagram
participant Client as 客户端
participant API as API服务器
participant Auth as 认证服务
participant DB as 数据库
Client->>API : POST /api/auth/login
API->>Auth : 验证用户名密码
Auth->>DB : 查询用户信息
DB-->>Auth : 返回用户数据
Auth-->>API : 生成JWT令牌
API-->>Client : 返回令牌
Client->>API : API请求 + Authorization : Bearer <token>
API->>Auth : 验证JWT令牌
Auth-->>API : 验证成功
API-->>Client : 返回API响应
```

**图表来源**
- [lib/auth/middleware.ts](file://lib/auth/middleware.ts#L1-L33)
- [lib/api/client.ts](file://lib/api/client.ts#L1-L121)

### 认证头部格式

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**节来源**
- [lib/auth/middleware.ts](file://lib/auth/middleware.ts#L1-L33)

## 物品数据模型

### Item接口定义

物品数据模型包含了完整的物品信息，支持归档状态和成本计算。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 主键，自增 |
| name | string | 是 | 物品名称 |
| purchased_at | string | 是 | 购买日期（ISO 8601格式：YYYY-MM-DD） |
| price_cents | number | 是 | 购买价格（以分为单位，非负整数） |
| remark | string | 否 | 备注信息 |
| archived | number | 是 | 归档状态（0=未归档，1=已归档） |
| archived_at | string \| null | 否 | 归档时间（ISO 8601格式） |
| archived_daily_price_cents | number \| null | 否 | 归档时的日均价格（分） |
| created_at | string | 是 | 创建时间（ISO 8601格式） |
| updated_at | string | 是 | 更新时间（ISO 8601格式） |

### CreateItemDTO接口

创建物品时使用的数据传输对象。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 物品名称 |
| purchased_at | string | 是 | 购买日期（YYYY-MM-DD） |
| price_cents | number | 是 | 购买价格（分） |
| remark | string | 否 | 备注（可选） |

### UpdateItemDTO接口

更新物品时使用的数据传输对象。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 物品名称 |
| purchased_at | string | 否 | 购买日期 |
| price_cents | number | 否 | 购买价格（分） |
| remark | string | 否 | 备注 |
| archived | number | 否 | 归档状态 |
| archived_at | string \| null | 否 | 归档时间 |
| archived_daily_price_cents | number \| null | 否 | 归档日均价格 |

**节来源**
- [lib/types/item.ts](file://lib/types/item.ts#L1-L94)

## 核心API接口

### 1. 获取物品列表

**GET** `/api/items`

获取所有物品列表，支持按归档状态筛选。

#### 查询参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| archived | number | 归档状态筛选：0=未归档，1=已归档，默认返回全部 |

#### 请求示例

```bash
# 获取所有物品
curl -X GET "http://localhost:3000/api/items" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取已归档物品
curl -X GET "http://localhost:3000/api/items?archived=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 响应格式

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "MacBook Pro",
      "purchased_at": "2024-01-01",
      "price_cents": 120000,
      "remark": "工作用电脑",
      "archived": 0,
      "archived_at": null,
      "archived_daily_price_cents": null,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 2. 创建新物品

**POST** `/api/items`

创建新的物品记录。

#### 请求体结构

```json
{
  "name": "iPhone 15 Pro",
  "purchased_at": "2024-03-15",
  "price_cents": 89900,
  "remark": "最新款手机"
}
```

#### 请求验证规则

- `name`：必填，字符串类型，不能为空
- `purchased_at`：必填，日期格式（YYYY-MM-DD）
- `price_cents`：必填，非负整数
- `remark`：可选，字符串类型

#### 响应格式

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "iPhone 15 Pro",
    "purchased_at": "2024-03-15",
    "price_cents": 89900,
    "remark": "最新款手机",
    "archived": 0,
    "archived_at": null,
    "archived_daily_price_cents": null,
    "created_at": "2024-03-15T14:30:00Z",
    "updated_at": "2024-03-15T14:30:00Z"
  }
}
```

### 3. 获取单个物品

**GET** `/api/items/:id`

根据ID获取指定的物品详情。

#### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 物品ID |

#### 请求示例

```bash
curl -X GET "http://localhost:3000/api/items/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 响应格式

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "MacBook Pro",
    "purchased_at": "2024-01-01",
    "price_cents": 120000,
    "remark": "工作用电脑",
    "archived": 0,
    "archived_at": null,
    "archived_daily_price_cents": null,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

### 4. 更新物品

**PUT** `/api/items/:id`

更新指定ID的物品信息。

#### 请求体结构

```json
{
  "name": "更新后的名称",
  "purchased_at": "2024-01-01",
  "price_cents": 125000,
  "remark": "更新后的备注",
  "archived": 1,
  "archived_at": "2024-12-31T23:59:59Z",
  "archived_daily_price_cents": 100
}
```

#### 更新规则

- 只更新请求体中提供的字段
- `archived`字段控制物品是否归档
- `archived_at`和`archived_daily_price_cents`通常配合使用

### 5. 删除物品

**DELETE** `/api/items/:id`

删除指定ID的物品。

#### 请求示例

```bash
curl -X DELETE "http://localhost:3000/api/items/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 响应格式

```json
{
  "success": true,
  "message": "删除成功"
}
```

**节来源**
- [app/api/items/route.ts](file://app/api/items/route.ts#L1-L75)
- [app/api/items/[id]/route.ts](file://app/api/items/[id]/route.ts#L1-L134)

## 物品生命周期管理

### 物品创建流程

```mermaid
flowchart TD
Start([开始创建物品]) --> ValidateInput["验证输入参数"]
ValidateInput --> InputValid{"输入有效?"}
InputValid --> |否| ReturnError["返回错误信息"]
InputValid --> |是| CreateItem["创建物品记录"]
CreateItem --> SetDefaults["设置默认值"]
SetDefaults --> CalculateDates["计算创建/更新时间"]
CalculateDates --> SaveToDB["保存到数据库"]
SaveToDB --> ReturnSuccess["返回成功响应"]
ReturnError --> End([结束])
ReturnSuccess --> End
```

**图表来源**
- [app/api/items/route.ts](file://app/api/items/route.ts#L34-L74)
- [lib/db/repository.ts](file://lib/db/repository.ts#L37-L63)

### 物品更新流程

```mermaid
flowchart TD
Start([开始更新物品]) --> ValidateID["验证物品ID"]
ValidateID --> IDValid{"ID有效?"}
IDValid --> |否| ReturnIDError["返回ID错误"]
IDValid --> |是| ParseBody["解析请求体"]
ParseBody --> BuildSQL["构建动态SQL"]
BuildSQL --> ExecuteUpdate["执行更新"]
ExecuteUpdate --> CheckChanges{"是否有变更?"}
CheckChanges --> |否| ReturnNotFoundError["返回未找到"]
CheckChanges --> |是| FetchUpdated["获取更新后数据"]
FetchUpdated --> ReturnSuccess["返回成功响应"]
ReturnIDError --> End([结束])
ReturnNotFoundError --> End
ReturnSuccess --> End
```

**图表来源**
- [app/api/items/[id]/route.ts](file://app/api/items/[id]/route.ts#L50-L95)
- [lib/db/repository.ts](file://lib/db/repository.ts#L69-L121)

### 物品删除流程

```mermaid
flowchart TD
Start([开始删除物品]) --> ValidateID["验证物品ID"]
ValidateID --> IDValid{"ID有效?"}
IDValid --> |否| ReturnIDError["返回ID错误"]
IDValid --> |是| DeleteRecord["删除数据库记录"]
DeleteRecord --> CheckResult{"删除成功?"}
CheckResult --> |否| ReturnNotFoundError["返回未找到"]
CheckResult --> |是| ReturnSuccess["返回删除成功"]
ReturnIDError --> End([结束])
ReturnNotFoundError --> End
ReturnSuccess --> End
```

**图表来源**
- [app/api/items/[id]/route.ts](file://app/api/items/[id]/route.ts#L99-L133)
- [lib/db/repository.ts](file://lib/db/repository.ts#L127-L131)

**节来源**
- [lib/db/repository.ts](file://lib/db/repository.ts#L1-L156)

## 归档状态处理

### 归档状态定义

系统使用数字字段表示物品的归档状态：

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 0 | ACTIVE | 物品正常使用中 |
| 1 | ARCHIVED | 物品已归档，成本已锁定 |

### 归档操作流程

```mermaid
sequenceDiagram
participant Client as 客户端
participant API as API服务
participant Utils as 工具函数
participant DB as 数据库
Client->>API : 请求归档物品
API->>Utils : 计算使用天数
Utils-->>API : 返回使用天数
API->>Utils : 计算日均价格
Utils-->>API : 返回日均价格
API->>DB : 更新物品归档状态
DB-->>API : 更新成功
API-->>Client : 返回归档结果
```

**图表来源**
- [lib/hooks/use-items.ts](file://lib/hooks/use-items.ts#L69-L85)
- [lib/utils/item-utils.ts](file://lib/utils/item-utils.ts#L1-L74)

### 归档状态转换

#### 从活跃到归档

当物品被归档时，系统会自动计算以下信息：

1. **使用天数**：从购买日期到归档日期的天数
2. **日均价格**：总价格除以使用天数
3. **归档时间**：当前时间戳
4. **锁定价格**：归档时的日均价格

#### 从归档到活跃

取消归档时，系统会重置以下字段：

- `archived`：设为0
- `archived_at`：设为null
- `archived_daily_price_cents`：设为null

### 归档状态查询

```bash
# 获取未归档物品
curl -X GET "http://localhost:3000/api/items?archived=0" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取已归档物品
curl -X GET "http://localhost:3000/api/items?archived=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**节来源**
- [lib/utils/item-utils.ts](file://lib/utils/item-utils.ts#L1-L74)
- [lib/hooks/use-items.ts](file://lib/hooks/use-items.ts#L69-L104)

## 使用天数和日均价格计算

### 计算公式

系统提供了完整的成本计算功能，基于物品的购买信息自动计算使用成本。

#### 使用天数计算

```typescript
function calculateUsageDays(purchasedAt: string, archivedAt?: string | null): number {
  const startDate = parseISO(purchasedAt);
  const endDate = archivedAt ? parseISO(archivedAt) : new Date();
  const days = differenceInDays(endDate, startDate);
  return Math.max(days, 1); // 至少1天
}
```

#### 日均价格计算

```typescript
function calculateDailyPriceCents(priceCents: number, usageDays: number): number {
  const days = Math.max(usageDays, 1);
  return Math.floor(priceCents / days);
}
```

### 成本计算流程

```mermaid
flowchart TD
Start([开始成本计算]) --> GetPurchaseInfo["获取购买信息"]
GetPurchaseInfo --> CheckArchived{"是否已归档?"}
CheckArchived --> |是| UseArchivedPrice["使用归档日均价格"]
CheckArchived --> |否| CalcUsageDays["计算使用天数"]
CalcUsageDays --> CalcDailyPrice["计算日均价格"]
CalcDailyPrice --> ReturnCurrentPrice["返回当前日均价格"]
UseArchivedPrice --> ReturnArchivedPrice["返回归档价格"]
ReturnCurrentPrice --> End([结束])
ReturnArchivedPrice --> End
```

**图表来源**
- [lib/utils/item-utils.ts](file://lib/utils/item-utils.ts#L6-L74)

### 成本计算示例

假设有一个物品：

- 购买日期：2024-01-01
- 购买价格：1200元（120000分）
- 归档日期：2024-12-31

**计算过程**：
1. 使用天数 = 365天
2. 日均价格 = 120000分 ÷ 365天 ≈ 328分/天

**节来源**
- [lib/utils/item-utils.ts](file://lib/utils/item-utils.ts#L1-L74)

## 错误处理和状态码

### HTTP状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功，返回数据 |
| 201 | Created | 创建成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或认证失败 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建） |
| 500 | Internal Server Error | 服务器内部错误 |

### 错误响应格式

```json
{
  "error": "错误描述信息",
  "details": {
    "field": "具体出错的字段",
    "expected": "期望的格式或值",
    "received": "实际接收到的值"
  }
}
```

### 常见错误场景

#### 1. 认证相关错误

```json
{
  "error": "未提供认证令牌",
  "status": 401
}
```

```json
{
  "error": "认证令牌无效或已过期",
  "status": 401
}
```

#### 2. 参数验证错误

```json
{
  "error": "缺少必填字段：name, purchased_at, price_cents",
  "status": 400
}
```

```json
{
  "error": "价格必须为非负数",
  "status": 400
}
```

#### 3. 资源操作错误

```json
{
  "error": "物品不存在",
  "status": 404
}
```

```json
{
  "error": "物品名称已存在",
  "status": 409
}
```

### 错误处理流程

```mermaid
flowchart TD
Request[接收请求] --> ValidateAuth["验证认证"]
ValidateAuth --> AuthValid{"认证有效?"}
AuthValid --> |否| ReturnAuthError["返回认证错误"]
AuthValid --> |是| ValidateParams["验证参数"]
ValidateParams --> ParamsValid{"参数有效?"}
ParamsValid --> |否| ReturnParamError["返回参数错误"]
ParamsValid --> |是| ProcessRequest["处理请求"]
ProcessRequest --> ProcessSuccess{"处理成功?"}
ProcessSuccess --> |否| ReturnServerError["返回服务器错误"]
ProcessSuccess --> |是| ReturnSuccess["返回成功响应"]
ReturnAuthError --> End([结束])
ReturnParamError --> End
ReturnServerError --> End
ReturnSuccess --> End
```

**图表来源**
- [app/api/items/route.ts](file://app/api/items/route.ts#L10-L74)
- [app/api/items/[id]/route.ts](file://app/api/items/[id]/route.ts#L13-L133)

**节来源**
- [app/api/items/route.ts](file://app/api/items/route.ts#L10-L74)
- [app/api/items/[id]/route.ts](file://app/api/items/[id]/route.ts#L13-L133)

## 完整curl命令示例

### 1. 获取物品列表

```bash
# 获取所有物品
curl -X GET "http://localhost:3000/api/items" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 获取未归档物品
curl -X GET "http://localhost:3000/api/items?archived=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 获取已归档物品
curl -X GET "http://localhost:3000/api/items?archived=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. 创建新物品

```bash
# 创建基本物品
curl -X POST "http://localhost:3000/api/items" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dell XPS 13",
    "purchased_at": "2024-02-15",
    "price_cents": 99900,
    "remark": "开发用笔记本"
  }'

# 创建带备注的物品
curl -X POST "http://localhost:3000/api/items" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kindle Paperwhite",
    "purchased_at": "2024-03-01",
    "price_cents": 8990,
    "remark": "阅读专用电子书"
  }'
```

### 3. 获取单个物品详情

```bash
# 获取ID为1的物品详情
curl -X GET "http://localhost:3000/api/items/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. 更新物品信息

```bash
# 更新物品基本信息
curl -X PUT "http://localhost:3000/api/items/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dell XPS 13 (升级版)",
    "purchased_at": "2024-02-15",
    "price_cents": 109900,
    "remark": "升级配置，开发用笔记本"
  }'

# 归档物品
curl -X PUT "http://localhost:3000/api/items/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "archived": 1,
    "archived_at": "2024-12-31T23:59:59Z",
    "archived_daily_price_cents": 300
  }'
```

### 5. 删除物品

```bash
# 删除ID为1的物品
curl -X DELETE "http://localhost:3000/api/items/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. 批量操作示例

```bash
# 创建多个物品
ITEMS=(
  '{"name":"MacBook Air","purchased_at":"2024-01-10","price_cents":79900,"remark":"轻薄本"}'
  '{"name":"Surface Laptop","purchased_at":"2024-02-20","price_cents":84900,"remark":"微软产品"}'
  '{"name":"ThinkPad X1","purchased_at":"2024-03-15","price_cents":99900,"remark":"商务本"}'
)

for item in "${ITEMS[@]}"; do
  curl -X POST "http://localhost:3000/api/items" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$item"
done
```

## 前端集成指南

### 使用API客户端

系统提供了完整的API客户端封装，便于前端集成。

#### 基本使用方法

```typescript
import { api } from '@/lib/api/client';

// 获取物品列表
const items = await api.items.getAll();

// 获取单个物品
const item = await api.items.getById(1);

// 创建物品
const newItem = await api.items.create({
  name: '新物品',
  purchased_at: '2024-01-01',
  price_cents: 10000,
  remark: '测试物品'
});

// 更新物品
const updatedItem = await api.items.update(1, {
  name: '更新后的名称',
  price_cents: 12000
});

// 删除物品
await api.items.delete(1);
```

#### 使用React Hook

```typescript
import { useItems } from '@/lib/hooks/use-items';

const ItemManagement = () => {
  const { 
    getAllItems, 
    createItem, 
    updateItem, 
    deleteItem,
    archiveItem,
    unarchiveItem 
  } = useItems();

  // 获取物品列表
  const loadItems = async () => {
    const items = await getAllItems({ archived: 0 });
    console.log('物品列表:', items);
  };

  // 创建物品
  const handleCreateItem = async (data) => {
    try {
      const newItem = await createItem(data);
      console.log('创建成功:', newItem);
    } catch (error) {
      console.error('创建失败:', error);
    }
  };

  // 归档物品
  const handleArchiveItem = async (itemId) => {
    try {
      const archivedItem = await archiveItem(itemId);
      console.log('归档成功:', archivedItem);
    } catch (error) {
      console.error('归档失败:', error);
    }
  };
};
```

### 前端组件集成

#### 物品列表组件

```typescript
// 使用示例
<ItemList
  items={items}
  onItemClick={(item) => openItemDetail(item)}
  onFilterChange={(filter) => applyFilter(filter)}
/>
```

#### 物品表单组件

```typescript
// 使用示例
<ItemForm
  item={editingItem}
  onSubmit={handleFormSubmit}
  onCancel={closeForm}
/>
```

**节来源**
- [lib/api/client.ts](file://lib/api/client.ts#L1-L121)
- [lib/hooks/use-items.ts](file://lib/hooks/use-items.ts#L1-L106)
- [components/item-list.tsx](file://components/item-list.tsx#L1-L99)
- [components/item-form.tsx](file://components/item-form.tsx#L1-L216)

## 最佳实践建议

### 1. 数据验证

- 在客户端进行基础验证，减少无效请求
- 服务器端始终进行完整验证
- 使用TypeScript确保类型安全

### 2. 性能优化

- 合理使用归档功能，避免查询过多历史数据
- 对频繁查询的接口考虑缓存策略
- 使用适当的筛选条件减少数据传输

### 3. 错误处理

- 实现优雅的错误提示和重试机制
- 记录详细的错误日志便于调试
- 提供有意义的错误信息给用户

### 4. 安全考虑

- 严格验证所有输入参数
- 使用HTTPS保护数据传输
- 定期轮换认证令牌

### 5. 数据管理

- 定期备份数据库
- 监控存储空间使用情况
- 实施合理的数据保留策略

### 6. 用户体验

- 提供实时的反馈信息
- 支持批量操作功能
- 实现离线数据同步能力

通过遵循这些最佳实践，可以确保物品管理系统的稳定性和用户体验。