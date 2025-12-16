#!/bin/bash

# 简化版腾讯云镜像推送脚本
# 使用方法: ./push-to-tcr.sh [tag]

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查是否需要使用 sudo
if ! docker ps >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  检测到需要 sudo 权限运行 Docker${NC}"
    DOCKER_CMD="sudo docker"
else
    DOCKER_CMD="docker"
fi

# 配置
TCR_REGISTRY="ccr.ccs.tencentyun.com"
TCR_USERNAME="100020390098"
TCR_NAMESPACE="shidawei"
IMAGE_NAME="bookkeeping"
TAG=${1:-latest}  # 默认 tag 为 latest

FULL_IMAGE="${TCR_REGISTRY}/${TCR_NAMESPACE}/${IMAGE_NAME}:${TAG}"

echo -e "${GREEN}=========================================="
echo "📦 推送镜像到腾讯云"
echo -e "==========================================${NC}"
echo ""
echo "镜像仓库: ${TCR_REGISTRY}"
echo "命名空间: ${TCR_NAMESPACE}"
echo "镜像名称: ${IMAGE_NAME}"
echo "镜像标签: ${TAG}"
echo "完整镜像: ${FULL_IMAGE}"
echo ""

# 步骤 1: 构建镜像
echo -e "${GREEN}🔨 步骤 1/3: 构建 Docker 镜像${NC}"
$DOCKER_CMD build -t ${IMAGE_NAME}:${TAG} .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi

# 获取镜像 ID
IMAGE_ID=$($DOCKER_CMD images -q ${IMAGE_NAME}:${TAG})
echo -e "${GREEN}✅ 构建成功 (Image ID: ${IMAGE_ID})${NC}"
echo ""

# 步骤 2: 登录 TCR
echo -e "${GREEN}🔐 步骤 2/3: 登录腾讯云容器镜像服务${NC}"
echo -e "${YELLOW}请输入密码 (SecretKey):${NC}"
$DOCKER_CMD login ${TCR_REGISTRY} --username=${TCR_USERNAME}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 登录失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 登录成功${NC}"
echo ""

# 步骤 3: 打标签
echo -e "${GREEN}🏷️  步骤 3/3: 打标签并推送镜像${NC}"
$DOCKER_CMD tag ${IMAGE_ID} ${FULL_IMAGE}

# 步骤 4: 推送镜像
echo "推送镜像到腾讯云..."
$DOCKER_CMD push ${FULL_IMAGE}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 推送失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ 推送成功！"
echo -e "==========================================${NC}"
echo ""
echo "镜像地址: ${FULL_IMAGE}"
echo ""
echo "拉取命令:"
echo "  docker pull ${FULL_IMAGE}"
echo ""
echo "部署到服务器:"
echo "  ssh root@your-server 'docker pull ${FULL_IMAGE} && cd /opt/bookkeeping && docker compose down && docker compose up -d'"
echo ""
