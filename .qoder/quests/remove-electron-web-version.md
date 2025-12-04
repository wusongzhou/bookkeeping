# 去除 Electron，改为纯 Web 版本 - 技术方案

## 一、变更背景

### 当前问题
- Electron 及其依赖（better-sqlite3、electron-builder 等）因网络问题无法安装成功
- Electron 增加了项目复杂度，但目前并不需要桌面应用特性
- 原需求说明中已规划云端同步功能，Web 版本完全满足需求

### 变更目标
- 去除所有 Electron 相关代码和依赖
- 将数据存储从 Electron SQLite 迁移到 Web 端可用的存储方案
- 保持现有 UI 组件和业务逻辑不变
- 为后续云端同步功能做好准备

## 二、技术方案对比

### 方案一：使用 IndexedDB（推荐）

**优点**：
- 浏览器原生支持，无需额外依赖
- 支持大量数据存储（至少 50MB，通常更多）
- 支持索引和复杂查询
- 异步 API，不阻塞主线程
- 数据持久化，关闭浏览器后保留

**缺点**：
- API 相对复杂，需要封装
- 事务模型需要适应

**适用场景**：
- 需要存储大量物品数据
- 需要支持复杂查询（按状态筛选、搜索等）
- 为后续云端同步打基础

### 方案二：使用 LocalStorage

**优点**：
- API 简单，易于使用
- 同步读写，代码直观

**缺点**：
- 存储容量限制（5-10MB）
- 只能存储字符串，需要 JSON 序列化
- 同步操作可能阻塞主线程
- 不支持复杂查询

**适用场景**：
- 数据量较小
- 查询需求简单

### 最终选择：IndexedDB

考虑到：
1. 物品管理应用的数据量可能随时间增长
2. 需要支持筛选、搜索等查询功能
3. 与未来云端同步的数据结构一致性
4. 可以使用 Dexie.js 库简化 IndexedDB 操作

**推荐使用 IndexedDB + Dexie.js**

## 三、需要变更的内容

### 3.1 依赖包变更

**移除的依赖**：
- electron
- electron-builder
- electron-rebuild
- better-sqlite3
- @types/better-sqlite3
- concurrently
- cross-env
- wait-on

**新增的依赖**：
- dexie（IndexedDB 封装库）
- @types/dexie（TypeScript 类型）

### 3.2 文件删除清单

需要删除的文件和目录：
- `/electron/` 整个目录
  - `electron/main.ts`
  - `electron/preload.ts`
  - `electron/database/sqlite.ts`
  - `electron/ipc/db-handlers.ts`
- `tsconfig.electron.json`
- `global.d.ts`（Electron API 类型声明）

### 3.3 需要修改的文件

| 文件路径 | 修改内容 |
|---------|---------|
| `package.json` | 移除 Electron 相关依赖和脚本，简化构建流程 |
| `lib/hooks/use-electron.ts` | 重命名为 `use-storage.ts`，替换为 IndexedDB 实现 |
| `lib/store/item-store.ts` | 更新数据持久化调用方式 |
| `app/page.tsx` | 更新数据加载逻辑（如有必要） |
| `next.config.ts` | 移除 Electron 相关配置 |

### 3.4 需要新建的文件

| 文件路径 | 用途 |
|---------|------|
| `lib/db/indexeddb.ts` | IndexedDB 数据库初始化和配置 |
| `lib/db/item-repository.ts` | 物品数据的 CRUD 操作封装 |

## 四、数据层设计

### 4.1 IndexedDB 数据库结构

**数据库名称**：`bookkeeping-db`

**版本**：1

**对象存储（Object Store）**：

#### items 表

| 字段名 | 类型 | 索引 | 说明 |
|-------|------|------|------|
| id | number | 主键（自增） | 本地唯一标识 |
| remoteId | string | 可选 | 云端记录 ID |
| name | string | 索引 | 物品名称 |
| purchasedAt | string | 索引 | 购买日期（ISO 格式） |
| priceCents | number | - | 购买价格（分） |
| remark | string | - | 备注 |
| archived | boolean | 索引 | 是否归档 |
| archivedAt | string | 可选 | 归档时间 |
| archivedDailyPriceCents | number | 可选 | 归档时的日均价格 |
| syncStatus | number | 索引 | 同步状态（为云端同步预留） |
| lastSyncedAt | string | 可选 | 最后同步时间 |
| createdAt | string | - | 创建时间 |
| updatedAt | string | 索引 | 更新时间 |

**索引说明**：
- `name`：支持按名称搜索
- `archived`：支持筛选已归档/进行中
- `updatedAt`：支持增量同步查询
- `syncStatus`：支持查询待同步记录

### 4.2 数据访问层接口

提供统一的数据访问接口，与原 Electron 版本保持一致：

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getAllItems` | filter?: ItemFilter | Promise\<Item[]\> | 获取所有物品 |
| `getItemById` | id: number | Promise\<Item \| null\> | 获取单个物品 |
| `createItem` | data: CreateItemDTO | Promise\<Item\> | 创建物品 |
| `updateItem` | id: number, data: UpdateItemDTO | Promise\<Item\> | 更新物品 |
| `deleteItem` | id: number | Promise\<void\> | 删除物品 |
| `archiveItem` | id: number | Promise\<Item\> | 归档物品 |
| `unarchiveItem` | id: number | Promise\<Item\> | 取消归档 |
| `searchItems` | keyword: string | Promise\<Item[]\> | 搜索物品 |

## 五、实现步骤

### 步骤 1：安装新依赖

更新 package.json，添加 Dexie.js 依赖，移除 Electron 相关依赖。

### 步骤 2：创建 IndexedDB 数据库层

创建 `lib/db/indexeddb.ts`，使用 Dexie 初始化数据库和表结构。

### 步骤 3：实现数据访问层

创建 `lib/db/item-repository.ts`，封装所有物品相关的数据库操作。

### 步骤 4：替换数据访问 Hook

将 `lib/hooks/use-electron.ts` 重命名为 `use-storage.ts`，替换为调用 IndexedDB 数据访问层。

### 步骤 5：更新状态管理

修改 `lib/store/item-store.ts`，确保与新的数据访问接口兼容。

### 步骤 6：清理 Electron 相关文件

删除所有 Electron 相关文件和配置。

### 步骤 7：简化构建脚本

更新 package.json 的 scripts 部分，移除 Electron 构建脚本。

### 步骤 8：测试验证

验证所有功能正常：
- 物品的增删改查
- 归档/取消归档
- 搜索和筛选
- 数据持久化（刷新页面后数据保留）

## 六、构建和部署

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000 即可使用完整功能（包括数据持久化）。

### 生产环境构建

```bash
npm run build
npm run start
```

或直接部署到 Vercel、Netlify 等平台。

### 静态导出（可选）

如需纯静态部署：

```bash
npm run build
```

配置 Next.js 的静态导出选项，生成的静态文件可部署到任何静态托管服务。

## 七、数据迁移方案（针对现有用户）

如果已经有用户在使用 Electron 版本：

### 导出功能

在 Electron 版本中添加导出功能：
- 导出格式：JSON
- 导出内容：所有物品数据
- 导出位置：用户选择的本地文件

### 导入功能

在 Web 版本中添加导入功能：
- 支持导入 JSON 格式数据
- 数据验证和格式转换
- 批量写入 IndexedDB

### 导入流程

用户操作流程：
1. 在 Electron 版本中导出数据为 JSON 文件
2. 访问 Web 版本
3. 使用导入功能上传 JSON 文件
4. 系统自动迁移数据到 IndexedDB

## 八、后续云端同步准备

### 数据模型兼容性

IndexedDB 的数据结构已包含云端同步所需字段：
- `remoteId`：云端记录 ID
- `syncStatus`：同步状态标记
- `lastSyncedAt`：最后同步时间

### 同步策略

Web 版本使用 IndexedDB 后，云端同步实现更加简单：
1. 本地 IndexedDB 作为离线数据源
2. Next.js API Routes 作为后端 API
3. 云端使用 SQLite 或 PostgreSQL
4. 实现双向同步逻辑

### 渐进式实现

1. **第一阶段**（当前）：纯本地 IndexedDB 存储
2. **第二阶段**：添加 Next.js API Routes 后端
3. **第三阶段**：实现云端同步功能
4. **第四阶段**：添加多设备数据共享

## 九、风险和注意事项

### 浏览器兼容性

IndexedDB 支持情况：
- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+

基本覆盖所有现代浏览器，风险较低。

### 数据安全性

浏览器数据存储的注意事项：
- 用户清除浏览器数据会导致数据丢失
- 建议定期提醒用户备份数据
- 提供数据导出功能
- 云端同步是最佳保障方案

### 存储容量限制

IndexedDB 存储限制：
- 大多数浏览器至少支持 50MB
- Chrome 可用空间的 60%
- Firefox 可用空间的 50%

对于物品管理应用，存储容量完全够用。

### 隐私模式

在浏览器隐私模式下：
- 数据仍可正常读写
- 关闭隐私窗口后数据会被清除
- 需在 UI 上提示用户

## 十、优势总结

### 相比 Electron 版本的优势

| 方面 | Electron 版本 | Web 版本 |
|------|--------------|----------|
| 安装依赖 | 需要 native 模块，易出错 | 纯 JS 依赖，稳定可靠 |
| 应用体积 | 100MB+ | 几 MB |
| 启动速度 | 较慢 | 快速 |
| 跨平台 | 需要分别打包 | 一次构建，全平台访问 |
| 更新部署 | 需要用户下载安装 | 刷新即更新 |
| 开发体验 | 需要同时调试两个进程 | 标准 Web 开发流程 |
| 云端同步 | 需要额外实现通信 | 直接调用后端 API |

### 符合原需求设计

根据原需求说明文档：
- 原本就规划使用 Next.js + Capacitor 架构
- Web 端为主，移动端通过 Capacitor 封装
- Electron 并不在原计划内
- 去除 Electron 更符合原始架构设计

## 十一、总结

去除 Electron 改为纯 Web 版本是**正确且必要**的决策：

**必要性**：
- 解决当前 Electron 依赖安装失败的问题
- 降低项目复杂度和维护成本
- 提升开发效率和用户体验

**可行性**：
- IndexedDB 提供完整的本地存储能力
- 现有 UI 组件和业务逻辑无需大改
- 数据访问接口保持一致
- 迁移工作量小，风险可控

**收益**：
- 更符合原需求说明的技术架构
- 为云端同步功能铺平道路
- 降低应用体积和启动时间
- 支持即时更新和部署

建议立即执行此变更方案。
