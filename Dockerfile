# ============================================
# 构建阶段 - 编译 Next.js 和原生依赖
# ============================================
FROM node:20-slim AS builder

WORKDIR /app

# 配置 Debian 使用阿里云镜像源
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources

# 安装编译依赖（better-sqlite3 需要从源码编译）
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 配置 npm 使用淘宝镜像
RUN echo "registry=https://registry.npmmirror.com/" > /root/.npmrc

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# 复制源代码并构建
COPY . .
RUN npm run build


# ============================================
# 运行阶段 - 最小化生产镜像
# ============================================
FROM node:20-slim AS runner

WORKDIR /app

# 配置 Debian 使用阿里云镜像源
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制 Next.js 构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 从构建阶段直接复制 better-sqlite3 原生模块（确保 Node.js 版本一致）
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

# 创建数据目录并设置权限（Docker Volume 会保留这些权限）
RUN mkdir -p /app/data && \
    chown -R nextjs:nodejs /app/data

# 切换到非特权用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 环境变量
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# 启动应用
CMD ["node", "server.js"]
