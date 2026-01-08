<template>
  <div class="notifications-page">
    <!-- 顶部装饰背景 -->
    <div class="page-header-bg"></div>

    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-main">
            <h1 class="page-title">
              <el-icon><Bell /></el-icon>
              消息中心
            </h1>
            <div class="page-subtitle">及时了解您的订单、商品和系统通知</div>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <div class="stat-number">{{ totalCount }}</div>
              <div class="stat-label">总消息</div>
            </div>
            <div class="stat-item">
              <div class="stat-number unread-count">{{ unreadCount }}</div>
              <div class="stat-label">未读消息</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="actions-bar">
        <div class="actions-left">
          <el-input
            v-model="searchText"
            placeholder="搜索消息内容..."
            prefix-icon="Search"
            size="large"
            class="search-input"
            clearable
          />
        </div>
        <div class="actions-right">
          <el-button
            type="primary"
            size="large"
            @click="load"
            :loading="loading"
            class="refresh-btn"
          >
            <el-icon><RefreshRight /></el-icon>
            刷新
          </el-button>
          <el-button
            type="success"
            size="large"
            @click="markAllRead"
            :disabled="unreadCount === 0"
            class="mark-read-btn"
          >
            <el-icon><Check /></el-icon>
            全部标为已读
          </el-button>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-area">
        <!-- 加载状态 -->
        <div v-if="loading && items.length === 0" class="loading-section">
          <div class="loading-container">
            <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
            <p class="loading-text">正在加载消息...</p>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-else-if="filteredItems.length" class="notifications-section">
          <div class="section-header">
            <h3 class="section-title">
              <el-icon><List /></el-icon>
              消息列表
              <span class="message-count">({{ filteredItems.length }})</span>
            </h3>
            <div class="filter-tabs">
              <el-radio-group v-model="filterType" size="small">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="unread">未读</el-radio-button>
                <el-radio-button value="read">已读</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div class="notifications-list">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="notification-card"
              :class="{ unread: !item.readFlag, read: item.readFlag }"
              @click="open(item)"
            >
              <!-- 未读指示器 -->
              <div v-if="!item.readFlag" class="unread-indicator">
                <div class="unread-dot"></div>
              </div>

              <!-- 消息图标 -->
              <div class="notification-icon">
                <el-icon :size="24">
                  <component :is="getNotificationIcon(item.type)" />
                </el-icon>
              </div>

              <!-- 消息内容 -->
              <div class="notification-content">
                <div class="notification-header">
                  <div class="notification-type">
                    <el-tag :type="getTypeColor(item.type)" size="small">
                      {{ getTypeLabel(item.type) }}
                    </el-tag>
                  </div>
                  <div class="notification-time">{{ formatTime(item.createdAt) }}</div>
                </div>

                <div class="notification-body">
                  <component
                    v-if="getComponent(item.type)"
                    :is="getComponent(item.type)"
                    :payload="item.__payload"
                    @open="open(item)"
                  />
                  <div v-else class="notification-text" v-html="formatPayload(item)"></div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="notification-actions">
                <el-button
                  v-if="!item.readFlag"
                  type="link"
                  size="small"
                  @click.stop="markAsRead(item)"
                  class="mark-read-action"
                >
                  <el-icon><Check /></el-icon>
                  标为已读
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-section">
          <div class="empty-container">
            <el-icon class="empty-icon" :size="80">
              <component :is="filterType === 'unread' ? Bell : Message" />
            </el-icon>
            <h3 class="empty-title">
              {{ getEmptyTitle() }}
            </h3>
            <p class="empty-description">
              {{ getEmptyDescription() }}
            </p>
            <el-button
              v-if="filterType !== 'all'"
              type="primary"
              @click="filterType = 'all'"
              class="empty-action-btn"
            >
              查看全部消息
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Bell,
  RefreshRight,
  Check,
  List,
  Loading,
  Message
} from '@element-plus/icons-vue'
import api from '@/api'
import type { Notification } from '@/types/api'
import { getNotificationComponent } from '@/services/notificationComponentRegistry'
import { handleNotificationClickShared } from '@/utils/notificationClickHandler'

const items = ref<Notification[]>([])
const loading = ref(false)
const searchText = ref('')
const filterType = ref<'all' | 'unread' | 'read'>('all')

// 计算属性
const totalCount = computed(() => items.value.length)
const unreadCount = computed(() => items.value.filter(item => !item.readFlag).length)

const filteredItems = computed(() => {
  let filtered = items.value

  // 根据筛选类型过滤
  if (filterType.value === 'unread') {
    filtered = filtered.filter(item => !item.readFlag)
  } else if (filterType.value === 'read') {
    filtered = filtered.filter(item => item.readFlag)
  }

  // 根据搜索文本过滤
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(item => {
      const payload = formatPayload(item).toLowerCase()
      const type = item.type?.toLowerCase() || ''
      return payload.includes(search) || type.includes(search)
    })
  }

  return filtered
})

const load = async () => {
  loading.value = true
  try {
    const res = await api.notification.getNotifications(0, 50)
    const body = (res as any) && (res as any).data ? (res as any).data : null
    // backend may return various shapes; normalize to an array of items
    let arr = []
    if (!body) arr = []
    else if (Array.isArray(body.data)) arr = body.data
    else if (body.data && Array.isArray(body.data.data)) arr = body.data.data
    else if (body.data && Array.isArray(body.data.content)) arr = body.data.content
    else if (Array.isArray((body as any).content)) arr = (body as any).content
    else arr = []

    // parse payload JSON string if necessary
    items.value = arr.map((it: any) => {
      try {
        if (it.payload && typeof it.payload === 'string') {
          it.__payload = JSON.parse(it.payload)
        } else {
          it.__payload = it.payload || {}
        }
      } catch (e) {
        it.__payload = {}
      }
      return it
    })
  } catch (e) {
    console.warn('load notifications failed', e)
    items.value = []
    ElMessage.error('加载消息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const formatPayload = (it: Notification) => {
  const p = (it as any).__payload || {}
  // fallback formatter for unknown types (stringify small object)
  // fallback: stringify small object
  try {
    const s = typeof p === 'string' ? p : JSON.stringify(p)
    return s.length > 200 ? s.slice(0, 200) + '...' : s
  } catch (e) {
    return ''
  }
}

const formatTime = (ts: any) => {
  try {
    const d = ts ? new Date(ts) : new Date()
    return d.toLocaleString()
  } catch (e) {
    return ts as string
  }
}

const open = async (it: Notification) => {
  if (!it) return
  // mark read via bulk API
  try {
    await api.notification.markRead([it.id])
    it.readFlag = true
    // notify nav to refresh badge (delta -1)
    try { window.dispatchEvent(new CustomEvent('notificationChanged', { detail: { delta: -1 } })) } catch (e) {}
  } catch (e) {
    console.warn('mark read failed', e)
  }

  // delegate navigation to shared handler; skip mark/badge because already handled above
  try {
    await handleNotificationClickShared(it, { skipMarkAndBadge: true })
    } catch (e) {}
}

const markAllRead = async () => {
  try {
    // compute how many were unread
    const unreadBefore = items.value.filter(i => !i.readFlag).length
    await api.notification.markAllRead()
    // optimistic UI
    items.value = items.value.map(i => ({ ...i, readFlag: true }))
    // notify nav (delta negative of unreadBefore)
    try { window.dispatchEvent(new CustomEvent('notificationChanged', { detail: { delta: -unreadBefore } })) } catch (e) {}
    ElMessage.success(`已将 ${unreadBefore} 条消息标为已读`)
  } catch (e) {
    console.warn('mark all read failed', e)
    ElMessage.error('标记全部已读失败，请稍后重试')
  }
}

onMounted(() => {
  load()
})

// 获取消息类型对应的图标
const getNotificationIcon = (type?: string) => {
  const iconMap: Record<string, any> = {
    'ORDER_UPDATE': 'Box',
    'PAYMENT_SUCCESS': 'Money',
    'SHIPMENT_UPDATE': 'Truck',
    'REVIEW_RECEIVED': 'Star',
    'SYSTEM_NOTIFICATION': 'InfoFilled',
    'CHAT_MESSAGE': 'ChatDotRound',
    'COUPON_RECEIVED': 'Present',
    'PRODUCT_UPDATE': 'ShoppingBag'
  }
  return iconMap[type || ''] || 'Bell'
}

// 获取消息类型标签
const getTypeLabel = (type?: string) => {
  const labelMap: Record<string, string> = {
    'ORDER_UPDATE': '订单更新',
    'PAYMENT_SUCCESS': '支付成功',
    'SHIPMENT_UPDATE': '发货通知',
    'REVIEW_RECEIVED': '新评价',
    'SYSTEM_NOTIFICATION': '系统通知',
    'CHAT_MESSAGE': '聊天消息',
    'COUPON_RECEIVED': '优惠券',
    'PRODUCT_UPDATE': '商品更新'
  }
  return labelMap[type || ''] || type || '未知类型'
}

// 获取类型标签颜色
const getTypeColor = (type?: string) => {
  const colorMap: Record<string, string> = {
    'ORDER_UPDATE': 'primary',
    'PAYMENT_SUCCESS': 'success',
    'SHIPMENT_UPDATE': 'warning',
    'REVIEW_RECEIVED': 'info',
    'SYSTEM_NOTIFICATION': 'danger',
    'CHAT_MESSAGE': 'primary',
    'COUPON_RECEIVED': 'success',
    'PRODUCT_UPDATE': 'warning'
  }
  return colorMap[type || ''] || 'info'
}

// 获取空状态标题
const getEmptyTitle = () => {
  if (searchText.value.trim()) {
    return '未找到相关消息'
  }
  switch (filterType.value) {
    case 'unread':
      return '暂无未读消息'
    case 'read':
      return '暂无已读消息'
    default:
      return '暂无消息'
  }
}

// 获取空状态描述
const getEmptyDescription = () => {
  if (searchText.value.trim()) {
    return '尝试调整搜索关键词或清除搜索条件'
  }
  switch (filterType.value) {
    case 'unread':
      return '太棒了！您已读完所有消息'
    case 'read':
      return '还没有已读的消息记录'
    default:
      return '当有新消息时，它们会显示在这里'
  }
}

// 单个标为已读
const markAsRead = async (item: Notification) => {
  try {
    await api.notification.markRead([item.id])
    item.readFlag = true
    // 通知导航栏刷新徽章
    try {
      window.dispatchEvent(new CustomEvent('notificationChanged', { detail: { delta: -1 } }))
    } catch (e) {}
    ElMessage.success('消息已标为已读')
  } catch (e) {
    console.warn('mark read failed', e)
    ElMessage.error('标记已读失败')
  }
}

// expose helper for template to lookup components
const getComponent = (type?: string) => {
  return getNotificationComponent(type ?? '')
}
</script>

<style scoped>
/* 页面容器 */
.notifications-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-main {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
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

.header-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.unread-count {
  color: #ff5722;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

/* 操作栏 */
.actions-bar {
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.actions-left {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

.actions-right {
  display: flex;
  gap: 16px;
}

.refresh-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.mark-read-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border: none;
  transition: all 0.3s ease;
}

.mark-read-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #388E3C 0%, #2E7D32 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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

/* 消息区域 */
.notifications-section {
  padding: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.message-count {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

/* 消息列表 */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid #e9ecef;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.notification-card.unread {
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  border-color: #ff5722;
}

.notification-card.read {
  opacity: 0.8;
}

/* 未读指示器 */
.unread-indicator {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #ff5722;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

/* 消息图标 */
.notification-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #667eea;
  opacity: 0.7;
}

/* 消息内容 */
.notification-content {
  margin-right: 60px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-body {
  color: #333;
  line-height: 1.6;
}

.notification-text {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

/* 消息操作 */
.notification-actions {
  position: absolute;
  bottom: 16px;
  right: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notification-card:hover .notification-actions {
  opacity: 1;
}

.mark-read-action {
  color: #4CAF50;
  font-size: 12px;
}

.mark-read-action:hover {
  color: #388E3C;
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

.empty-action-btn {
  margin-top: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.empty-action-btn:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Element Plus 样式覆盖 */
:deep(.el-input__wrapper) {
  border-radius: 25px;
  box-shadow: 0 0 0 1px #e0e0e0 inset;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #667eea inset;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-tag) {
  font-weight: 500;
}

:deep(.el-radio-group) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.el-radio-button__inner) {
  border-radius: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
    padding: 24px 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .header-stats {
    justify-content: center;
    gap: 24px;
  }

  .actions-bar {
    flex-direction: column;
    gap: 16px;
    padding: 20px 16px;
  }

  .actions-left {
    max-width: none;
  }

  .actions-right {
    justify-content: center;
  }

  .notifications-section {
    padding: 20px 16px;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .notification-card {
    padding: 16px;
  }

  .notification-content {
    margin-right: 0;
  }

  .notification-icon {
    position: static;
    margin-top: 12px;
    text-align: center;
  }

  .notification-actions {
    position: static;
    margin-top: 12px;
    opacity: 1;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }

  .header-stats {
    flex-direction: column;
    gap: 16px;
  }

  .stat-number {
    font-size: 24px;
  }

  .actions-right {
    flex-direction: column;
    width: 100%;
  }

  .refresh-btn,
  .mark-read-btn {
    width: 100%;
  }

  .filter-tabs {
    width: 100%;
  }

  .empty-section {
    padding: 60px 20px;
  }
}
</style>


