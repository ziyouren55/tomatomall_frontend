<template>
  <div class="merchant-order-page">
    <!-- 顶部装饰背景 -->
    <div class="page-header-bg"></div>

    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <el-icon><DocumentChecked /></el-icon>
            订单详情（商家视图）
          </h1>
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>商家中心</el-breadcrumb-item>
              <el-breadcrumb-item>订单管理</el-breadcrumb-item>
              <el-breadcrumb-item>订单详情</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="!order" class="loading-section">
        <div class="loading-container">
          <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
          <p class="loading-text">正在加载订单详情...</p>
        </div>
      </div>

      <!-- 主要内容 -->
      <template v-else>
        <!-- 订单基本信息卡片 -->
        <div class="order-info-card">
          <div class="card-header">
            <h3>
              <el-icon><InfoFilled /></el-icon>
              订单信息
            </h3>
          </div>
          <div class="card-content">
            <div class="order-basic-info">
              <div class="info-row">
                <div class="info-item">
                  <div class="info-label">
                    <el-icon><Ticket /></el-icon>
                    订单号
                  </div>
                  <div class="info-value">{{ order.orderNo || order.orderId }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">
                    <el-icon><Clock /></el-icon>
                    订单状态
                  </div>
                  <div class="info-value">
                    <el-tag :type="getStatusType(order.status)" size="large">
                      {{ getStatusText(order.status) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 顾客信息卡片 -->
        <div class="customer-card">
          <div class="card-header">
            <h3>
              <el-icon><User /></el-icon>
              买家信息
            </h3>
          </div>
          <div class="card-content">
            <div class="customer-profile">
              <div class="customer-avatar-section">
                <img
                  :src="customerAvatar"
                  :alt="order.name || '顾客'"
                  class="customer-avatar clickable-avatar"
                  @click="navigateToCustomerProfile"
                />
                <div class="customer-details">
                  <div class="customer-name">{{ order.name || '匿名用户' }}</div>
                  <div class="customer-contact">{{ order.phone || '未提供联系方式' }}</div>
                </div>
              </div>
              <div class="customer-actions">
                <el-button
                  type="primary"
                  size="large"
                  @click="startChatWithCustomer"
                  :loading="chatLoading"
                  class="chat-btn"
                >
                  <el-icon><ChatDotRound /></el-icon>
                  联系买家
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 发货操作卡片 -->
        <div v-if="canShip" class="shipping-card">
          <div class="card-header">
            <h3>
              <el-icon><Box /></el-icon>
              发货操作
            </h3>
          </div>
          <div class="card-content">
            <div v-if="!showShip" class="shipping-action">
              <el-button
                type="success"
                size="large"
                @click="showShip = true"
                class="ship-btn"
              >
                <el-icon><Box /></el-icon>
                标记已发货
              </el-button>
              <p class="shipping-tip">确认商品已发货后，点击按钮更新订单状态并填写物流信息</p>
            </div>
            <div v-else class="shipping-form-container">
              <ShippingForm
                :loading="shippingLoading"
                @ship="handleShip"
                @cancel="showShip = false"
              />
            </div>
          </div>
        </div>

        <!-- 商品列表卡片 -->
        <div class="products-card">
          <div class="card-header">
            <h3>
              <el-icon><ShoppingBag /></el-icon>
              商品清单
            </h3>
          </div>
          <div class="card-content">
            <div v-if="order.orderItems && order.orderItems.length" class="products-list">
              <div
                v-for="(item, index) in order.orderItems"
                :key="item.productId"
                class="product-item"
                :class="{ 'last-item': index === order.orderItems.length - 1 }"
              >
                <div class="product-info">
                  <div class="product-title">{{ item.title }}</div>
                  <div class="product-details">
                    <span class="product-quantity">数量：{{ item.quantity }}</span>
                    <span class="product-price">单价：¥{{ item.price }}</span>
                    <span class="product-subtotal">小计：¥{{ item.subtotal }}</span>
                  </div>
                  <div class="product-store">店铺：{{ item.storeName || item.storeId }}</div>
                </div>
              </div>
            </div>
            <div v-else class="empty-products">
              <el-icon class="empty-icon" :size="64"><Box /></el-icon>
              <p class="empty-text">该订单没有属于您的商品</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  DocumentChecked,
  InfoFilled,
  Ticket,
  Clock,
  User,
  Box,
  ShoppingBag,
  Loading
} from '@element-plus/icons-vue'
import api from '@/api'
import chatApi from '@/api/modules/chat'
import ShippingForm from '@/components/business/order/ShippingForm.vue'

const route = useRoute()
const router = useRouter()
const order = ref<any>(null)
const showShip = ref(false)
const shippingLoading = ref(false)
const chatLoading = ref(false)
const defaultAvatar = 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2'

// 用户名映射缓存，避免重复请求
const usernameCache = ref<Record<number, string>>({})

const canShip = computed(() => {
  if (!order.value || !order.value.status) return false
  return order.value.status === 'PAID' || order.value.status === 'SUCCESS'
})

// 顾客头像
const customerAvatar = computed(() => {
  // 这里可以根据顾客ID获取头像，或者使用默认头像
  // 暂时使用默认头像，后续可以通过API获取顾客详情来获取真实头像
  return defaultAvatar
})

// 获取订单状态显示文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'PENDING': '待支付',
    'PAID': '已支付',
    'SHIPPED': '已发货',
    'DELIVERED': '已送达',
    'SUCCESS': '交易成功',
    'CANCELLED': '已取消',
    'REFUNDED': '已退款'
  }
  return statusMap[status] || status
}

// 获取订单状态标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'PENDING': 'warning',
    'PAID': 'info',
    'SHIPPED': 'primary',
    'DELIVERED': 'success',
    'SUCCESS': 'success',
    'CANCELLED': 'danger',
    'REFUNDED': 'danger'
  }
  return typeMap[status] || 'info'
}

const load = async () => {
  const orderId = Number(route.params.orderId)
  try {
    const res = await api.order.getOrderForMerchant(orderId)
    if (res && res.data) order.value = res.data
  } catch (e) {
    console.warn('load merchant order failed', e)
  }
}

// 获取用户ID对应的用户名（带缓存）
async function getUsernameById(userId: number): Promise<string> {
  if (usernameCache.value[userId]) {
    return usernameCache.value[userId]
  }

  try {
    const response = await api.user.getUserById(userId)
    if (response && response.code === '200' && response.data?.username) {
      usernameCache.value[userId] = response.data.username
      return response.data.username
    }
  } catch (error) {
    console.error('获取用户名失败:', error)
  }

  return '' // 返回空字符串表示获取失败
}

// 跳转到顾客的个人详情页
async function navigateToCustomerProfile() {
  if (!order.value || !order.value.userId) {
    ElMessage.error('无法获取顾客信息')
    return
  }

  const username = await getUsernameById(order.value.userId)
  if (username) {
    router.push(`/users/${username}`)
  } else {
    ElMessage.error('无法获取顾客信息')
  }
}

// 开始与顾客聊天
async function startChatWithCustomer() {
  if (!order.value || !order.value.userId) {
    ElMessage.error('无法获取顾客信息')
    return
  }

  chatLoading.value = true
  try {
    const response = await chatApi.createChatSessionWithCustomer({
      customerId: order.value.userId
    })

    if (response && response.code === '200' && response.data) {
      // 跳转到聊天页面，并传递会话ID
      router.push({
        path: '/chat',
        query: { sessionId: response.data.id }
      })
    } else {
      ElMessage.error('创建聊天会话失败')
    }
  } catch (error) {
    console.error('发起聊天失败:', error)
    ElMessage.error('发起聊天失败，请稍后重试')
  } finally {
    chatLoading.value = false
  }
}

onMounted(() => {
  load()
})

const handleShip = async (shipData: { carrier: string; trackingNo: string }) => {
  if (!order.value) return
  const orderId = Number(order.value.orderId)
  try {
    shippingLoading.value = true
    await api.order.shipOrderForMerchant(orderId, shipData)
    showShip.value = false
    // reload order to reflect new status
    await load()
  } catch (e) {
    console.warn('ship failed', e)
  } finally {
    shippingLoading.value = false
  }
}
</script>

<style scoped>
/* 页面容器 */
.merchant-order-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  padding-bottom: 40px;
}

/* 顶部装饰背景 */
.page-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  z-index: 0;
}

/* 页面内容容器 */
.page-container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  background: white;
  border-radius: 16px;
  padding: 32px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.page-title .el-icon {
  color: #667eea;
}

.breadcrumb {
  margin-top: 8px;
}

/* 加载状态 */
.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-container {
  background: white;
  border-radius: 16px;
  padding: 48px 64px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.loading-icon {
  color: #667eea;
  margin-bottom: 16px;
  animation: rotate 1.5s linear infinite;
}

.loading-text {
  font-size: 16px;
  color: #666;
  margin: 0;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 卡片通用样式 */
.order-info-card,
.customer-card,
.shipping-card,
.products-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-info-card:hover,
.customer-card:hover,
.shipping-card:hover,
.products-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px 32px;
  border-bottom: 1px solid #e9ecef;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.card-header .el-icon {
  color: #667eea;
}

.card-content {
  padding: 32px;
}

/* 订单信息 */
.order-basic-info {
  width: 100%;
}

.info-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-label .el-icon {
  color: #667eea;
}

.info-value {
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 500;
}

/* 顾客信息 */
.customer-profile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.customer-avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.customer-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid #f0f0f0;
}

.customer-avatar:hover {
  transform: scale(1.05);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.customer-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.customer-contact {
  font-size: 14px;
  color: #666;
}

.customer-actions {
  display: flex;
  gap: 12px;
}

.chat-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.chat-btn:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 发货操作 */
.shipping-action {
  text-align: center;
}

.ship-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border: none;
  padding: 12px 32px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.ship-btn:hover {
  background: linear-gradient(135deg, #388E3C 0%, #2E7D32 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.ship-btn .el-icon {
  margin-right: 8px;
}

.shipping-tip {
  margin: 16px 0 0 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.shipping-form-container {
  margin-top: 16px;
}

/* 商品列表 */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.product-item {
  padding: 24px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.product-item:hover {
  background: #f8f9fa;
  padding-left: 16px;
  padding-right: 16px;
  border-radius: 8px;
  margin: 0 -16px;
}

.product-item.last-item {
  border-bottom: none;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
}

.product-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.product-quantity {
  color: #667eea;
  font-weight: 500;
}

.product-price,
.product-subtotal {
  color: #ff5722;
  font-weight: 500;
}

.product-store {
  font-size: 13px;
  color: #999;
  font-style: italic;
}

/* 空状态 */
.empty-products {
  text-align: center;
  padding: 48px 0;
}

.empty-icon {
  color: #ccc;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #999;
  margin: 0;
}

/* Element Plus 样式覆盖 */
:deep(.el-tag) {
  font-weight: 500;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .header-content {
    padding: 24px 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .card-content {
    padding: 24px 20px;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .customer-profile {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .customer-avatar-section {
    width: 100%;
  }

  .customer-actions {
    width: 100%;
  }

  .chat-btn {
    width: 100%;
  }

  .product-details {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }

  .card-header {
    padding: 16px 20px;
  }

  .card-header h3 {
    font-size: 16px;
  }

  .card-content {
    padding: 20px 16px;
  }

  .customer-avatar {
    width: 48px;
    height: 48px;
  }

  .customer-name {
    font-size: 16px;
  }
}
</style>


