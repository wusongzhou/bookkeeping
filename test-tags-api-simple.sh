#!/bin/bash

# 标签API测试脚本
# 使用方法: bash test-tags-api.sh

BASE_URL="http://localhost:3000"
TOKEN=""

echo "=========================================="
echo "🧪 标签功能 API 测试"
echo "=========================================="
echo ""

# 1. 登录获取 Token
echo "📝 步骤 1: 登录获取 Token"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "登录响应: ${LOGIN_RESPONSE}"
TOKEN=$(echo ${LOGIN_RESPONSE} | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，无法获取 Token"
  exit 1
fi

echo "✅ 登录成功，Token: ${TOKEN:0:20}..."
echo ""

# 2. 获取所有标签（初始应该为空）
echo "📝 步骤 2: 获取所有标签（初始状态）"
curl -s -X GET "${BASE_URL}/api/tags" \
  -H "Authorization: Bearer ${TOKEN}" 
echo ""

# 3. 创建第一个标签
echo "📝 步骤 3: 创建标签 - 电子产品"
TAG1_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/tags" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"电子产品","color":"#3B82F6"}')

echo ${TAG1_RESPONSE} 
TAG1_ID=$(echo ${TAG1_RESPONSE} | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
echo "✅ 创建成功，标签 ID: ${TAG1_ID}"
echo ""

# 4. 创建第二个标签
echo "📝 步骤 4: 创建标签 - 家居用品"
TAG2_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/tags" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"家居用品","color":"#10B981"}')

echo ${TAG2_RESPONSE} 
TAG2_ID=$(echo ${TAG2_RESPONSE} | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
echo "✅ 创建成功，标签 ID: ${TAG2_ID}"
echo ""

# 5. 创建第三个标签
echo "📝 步骤 5: 创建标签 - 工作学习"
TAG3_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/tags" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"工作学习","color":"#F59E0B"}')

echo ${TAG3_RESPONSE} 
TAG3_ID=$(echo ${TAG3_RESPONSE} | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
echo "✅ 创建成功，标签 ID: ${TAG3_ID}"
echo ""

# 6. 获取所有标签
echo "📝 步骤 6: 获取所有标签"
curl -s -X GET "${BASE_URL}/api/tags" \
  -H "Authorization: Bearer ${TOKEN}" 
echo ""

# 7. 获取单个标签
echo "📝 步骤 7: 获取单个标签（ID: ${TAG1_ID}）"
curl -s -X GET "${BASE_URL}/api/tags/${TAG1_ID}" \
  -H "Authorization: Bearer ${TOKEN}" 
echo ""

# 8. 更新标签
echo "📝 步骤 8: 更新标签（ID: ${TAG1_ID}）- 修改颜色"
curl -s -X PUT "${BASE_URL}/api/tags/${TAG1_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"color":"#EF4444"}' 
echo ""

# 9. 创建一个物品用于测试标签关联
echo "📝 步骤 9: 创建测试物品"
ITEM_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/items" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"测试笔记本电脑",
    "purchased_at":"2024-01-01",
    "price_cents":500000,
    "remark":"用于测试标签功能"
  }')

echo ${ITEM_RESPONSE} 
ITEM_ID=$(echo ${ITEM_RESPONSE} | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
echo "✅ 创建成功，物品 ID: ${ITEM_ID}"
echo ""

# 10. 为物品设置标签
echo "📝 步骤 10: 为物品设置标签（物品 ID: ${ITEM_ID}）"
curl -s -X PUT "${BASE_URL}/api/items/${ITEM_ID}/tags" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"tag_ids\":[${TAG1_ID},${TAG3_ID}]}" 
echo ""

# 11. 获取物品的标签
echo "📝 步骤 11: 获取物品的标签（物品 ID: ${ITEM_ID}）"
curl -s -X GET "${BASE_URL}/api/items/${ITEM_ID}/tags" \
  -H "Authorization: Bearer ${TOKEN}" 
echo ""

# 12. 删除一个标签
echo "📝 步骤 12: 删除标签（ID: ${TAG2_ID}）"
curl -s -X DELETE "${BASE_URL}/api/tags/${TAG2_ID}" \
  -H "Authorization: Bearer ${TOKEN}" 
echo ""

# 13. 再次获取所有标签，验证删除成功
echo "📝 步骤 13: 验证标签删除 - 获取所有标签"
curl -s -X GET "${BASE_URL}/api/tags" \
  -H "Authorization: Bearer ${TOKEN}" 
echo ""

# 14. 测试错误场景 - 创建重名标签
echo "📝 步骤 14: 测试错误场景 - 创建重名标签"
curl -s -X POST "${BASE_URL}/api/tags" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"电子产品","color":"#3B82F6"}' 
echo ""

# 15. 测试错误场景 - 无效的颜色格式
echo "📝 步骤 15: 测试错误场景 - 无效的颜色格式"
curl -s -X POST "${BASE_URL}/api/tags" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试标签","color":"invalid"}' 
echo ""

echo "=========================================="
echo "✅ 测试完成！"
echo "=========================================="
