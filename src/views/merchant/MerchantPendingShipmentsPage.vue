<template>
  <div class="merchant-pending-page">
    <!-- 顶部装饰背景 -->
    <div class="page-header-bg"></div>

    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <el-icon><Management /></el-icon>
            订单管理中心
          </h1>
          <div class="page-subtitle">高效管理您的订单发货流程</div>
        </div>
      </div>

      <!-- 标签页切换 -->
      <div class="tabs-container">
        <div class="tabs-wrapper">
          <div class="tabs">
            <button
              :class="['tab-button', { active: activeTab === 'pending' }]"
              @click="setTab('pending')"
            >
              <el-icon><Clock /></el-icon>
              <span>待发货订单</span>
              <el-badge v-if="activeTab === 'pending' && orders.length > 0" :value="orders.length" class="tab-badge" />
            </button>
            <button
              :class="['tab-button', { active: activeTab === 'processed' }]"
              @click="setTab('processed')"
            >
              <el-icon><Check /></el-icon>
              <span>已处理订单</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-area">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-section">
          <div class="loading-container">
            <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
            <p class="loading-text">正在加载订单数据...</p>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="orders.length === 0" class="empty-section">
          <div class="empty-container">
            <el-icon class="empty-icon" :size="80">
              <component :is="activeTab === 'pending' ? Box : Check" />
            </el-icon>
            <h3 class="empty-title">
              {{ activeTab === 'pending' ? '暂无待发货订单' : '暂无已处理订单' }}
            </h3>
            <p class="empty-description">
              {{ activeTab === 'pending'
                ? '所有订单都已发货，或暂无新订单需要处理'
                : '还没有已处理的订单记录' }}
            </p>
          </div>
        </div>

        <!-- 订单列表 -->
        <div v-else class="orders-section">
          <div class="orders-header">
            <h3 class="section-title">
              <el-icon><List /></el-icon>
              {{ activeTab === 'pending' ? '待发货订单' : '已处理订单' }}
              <span class="order-count">({{ orders.length }})</span>
            </h3>
          </div>

          <div class="orders-list">
            <div
              v-for="order in orders"
              :key="order.orderId"
              class="order-card"
              :class="{ 'urgent': activeTab === 'pending' && isUrgentOrder(order) }"
            >
              <div class="order-header">
                <div class="order-info">
                  <div class="order-id">
                    <el-icon><Document /></el-icon>
                    <span>订单 #{{ order.orderId }}</span>
                  </div>
                  <div class="order-status">
                    <el-tag :type="getStatusType(order.status)" size="small">
                      {{ getStatusText(order.status) }}
                    </el-tag>
                  </div>
                </div>
                <div v-if="activeTab === 'pending'" class="urgent-indicator">
                  <el-icon class="urgent-icon"><Warning /></el-icon>
                  <span class="urgent-text">需要尽快处理</span>
                </div>
              </div>

              <div class="order-content">
                <div class="customer-info">
                  <div class="customer-avatar">
                    <el-icon><User /></el-icon>
                  </div>
                  <div class="customer-details">
                    <div class="customer-name">{{ order.name || '匿名用户' }}</div>
                    <div class="customer-contact">{{ order.phone || '未提供联系方式' }}</div>
                  </div>
                </div>

                <div class="order-summary">
                  <div class="order-date">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ formatDate(order.createTime) }}</span>
                  </div>
                  <div class="order-amount">
                    <el-icon><Money /></el-icon>
                    <span>¥{{ order.totalAmount || '0.00' }}</span>
                  </div>
                </div>
              </div>

              <div class="order-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="goDetail(order.orderId)"
                  class="detail-btn"
                >
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>

                <el-button
                  v-if="activeTab === 'pending'"
                  type="success"
                  size="small"
                  @click="openQuickShip(order.orderId)"
                  class="ship-btn"
                >
                  <el-icon><Box /></el-icon>
                  快速发货
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发货模态框 -->
    <div v-if="showShip" class="modal-overlay" @click="closeQuickShip">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <el-icon><Box /></el-icon>
            快速发货 - 订单 #{{ shipOrderId }}
          </h3>
          <el-button
            type="link"
            size="small"
            @click="closeQuickShip"
            class="close-btn"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="modal-body">
          <ShippingForm
            :loading="shippingLoading"
            @ship="handleShip"
            @cancel="closeQuickShip"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Management,
  Clock,
  Check,
  Box,
  Loading,
  List,
  Document,
  User,
  Calendar,
  Money,
  View,
  Warning,
  Close
} from '@element-plus/icons-vue'
import api from '@/api'
import { useRouter } from 'vue-router'
import ShippingForm from '@/components/business/order/ShippingForm.vue'

const orders = ref<any[]>([])
const loading = ref(true)
const activeTab = ref<'pending'|'processed'>('pending')
const showShip = ref(false)
const shipOrderId = ref<number | null>(null)
const shippingLoading = ref(false)
const router = useRouter()

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

// 判断是否为紧急订单（待发货超过24小时）
const isUrgentOrder = (order: any) => {
  if (!order.createTime) return false
  const orderTime = new Date(order.createTime).getTime()
  const now = new Date().getTime()
  const hoursDiff = (now - orderTime) / (1000 * 60 * 60)
  return hoursDiff > 24
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const load = async () => {
  loading.value = true
  try {
    let res
    if (activeTab.value === 'pending') {
      res = await api.order.getPendingOrdersForMerchant()
    } else {
      res = await api.order.getProcessedOrdersForMerchant()
    }
    if (res && res.data) orders.value = res.data
  } catch (e) {
    console.warn('load orders failed', e)
  } finally {
    loading.value = false
  }
}

const setTab = async (tab: 'pending'|'processed') => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  await load()
}

const goDetail = (orderId: number) => {
  router.push({ path: `/merchant/orders/${orderId}` })
}

const openQuickShip = (orderId: number) => {
  shipOrderId.value = orderId
  showShip.value = true
}

const closeQuickShip = () => {
  showShip.value = false
  shipOrderId.value = null
  shippingLoading.value = false
}

const handleShip = async (shipData: { carrier: string; trackingNo: string }) => {
  if (!shipOrderId.value) return
  try {
    shippingLoading.value = true
    await api.order.shipOrderForMerchant(shipOrderId.value, shipData)
    closeQuickShip()
    await load()
    ElMessage.success('发货成功！订单状态已更新')
  } catch (e) {
    console.warn('quick ship failed', e)
    ElMessage.error('发货失败，请稍后重试')
  } finally {
    shippingLoading.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
/* 页面容器 */
.merchant-pending-page {
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
  max-width: 1200px;
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
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.page-title .el-icon {
  color: #667eea;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* 标签页容器 */
.tabs-container {
  margin-bottom: 32px;
}

.tabs-wrapper {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.tabs {
  display: flex;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-button:hover {
  background: rgba(102, 126, 234, 0.05);
  color: #667eea;
}

.tab-button.active {
  background: white;
  color: #667eea;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px 2px 0 0;
}

.tab-badge {
  margin-left: 8px;
}

/* 内容区域 */
.content-area {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 加载状态 */
.loading-section {
  padding: 80px 40px;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  color: #667eea;
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

/* 空状态 */
.empty-section {
  padding: 80px 40px;
  text-align: center;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  color: #ccc;
}

.empty-title {
  font-size: 20px;
  font-weight: 500;
  color: #666;
  margin: 0;
}

.empty-description {
  font-size: 14px;
  color: #999;
  margin: 0;
  line-height: 1.5;
}

/* 订单区域 */
.orders-section {
  padding: 32px;
}

.orders-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.section-title .el-icon {
  color: #667eea;
}

.order-count {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

/* 订单列表 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.order-card.urgent {
  border-left: 4px solid #ff5722;
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
}

.order-card.urgent:hover {
  border-color: #ff5722;
  box-shadow: 0 8px 25px rgba(255, 87, 34, 0.2);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-id {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.order-id .el-icon {
  color: #667eea;
}

.urgent-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ff5722;
  font-size: 14px;
  font-weight: 500;
}

.urgent-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 订单内容 */
.order-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.customer-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.customer-contact {
  font-size: 14px;
  color: #666;
}

.order-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.order-date,
.order-amount {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.order-amount {
  color: #ff5722;
  font-weight: 500;
}

/* 订单操作 */
.order-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.detail-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.detail-btn:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.ship-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border: none;
  transition: all 0.3s ease;
}

.ship-btn:hover {
  background: linear-gradient(135deg, #388E3C 0%, #2E7D32 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.modal-title .el-icon {
  color: #667eea;
}

.close-btn {
  color: #999;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 32px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
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

:deep(.el-badge__content) {
  background: #ff5722;
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

  .tabs {
    flex-direction: column;
  }

  .tab-button {
    padding: 12px 16px;
    font-size: 14px;
  }

  .orders-section {
    padding: 20px 16px;
  }

  .order-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .order-summary {
    align-items: flex-start;
  }

  .order-actions {
    flex-direction: column;
    width: 100%;
  }

  .detail-btn,
  .ship-btn {
    width: 100%;
  }

  .modal-container {
    width: 95%;
    margin: 20px;
  }

  .modal-header {
    padding: 20px 24px;
  }

  .modal-body {
    padding: 24px 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .customer-info {
    width: 100%;
  }

  .order-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>


