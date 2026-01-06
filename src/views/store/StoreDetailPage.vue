<template>
  <div class="store-detail-page">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-button-wrapper">
        <BackButton text="返回" fallback-path="/" />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载店铺信息...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ error }}</p>
        <button @click="fetchStore" class="retry-btn">重试</button>
      </div>

      <!-- 店铺信息 -->
      <div v-else-if="store" class="store-content">
        <!-- 店铺头部 -->
        <div class="store-header">
          <div class="store-avatar">
            <div class="avatar-placeholder">
              {{ store.name ? store.name.charAt(0) : '店' }}
            </div>
          </div>
          <div class="store-info">
            <h1 class="store-name">{{ store.name }}</h1>
            <p class="store-description">{{ store.description || '这家店铺还没有添加描述' }}</p>
            <div class="store-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                创建于 {{ store.createTime ? formatDate(store.createTime) : '未知' }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {{ store.status === 'ACTIVE' ? '营业中' : '已关闭' }}
              </span>
            </div>
          </div>
          <div class="store-actions">
            <router-link
              v-if="showManageLink"
              :to="`/merchant/stores/${store.id}`"
              class="btn btn-manage"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              管理店铺
            </router-link>
            <button class="btn btn-contact" @click="contactMerchant">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              联系商家
            </button>
          </div>
        </div>

        <!-- 店铺商品列表 -->
        <div class="store-products">
          <div class="section-header">
            <h2>店铺商品</h2>
            <div class="product-count">共 {{ products.length }} 件商品</div>
          </div>
          
          <div v-if="loadingProducts" class="loading-products">
            <div class="loading-spinner small"></div>
            <p>正在加载商品...</p>
          </div>

          <div v-else-if="products.length === 0" class="no-products">
            <div class="empty-icon">📦</div>
            <p>该店铺暂无商品</p>
          </div>

          <div v-else class="products-grid">
            <div
              v-for="product in products"
              :key="product.id"
              class="product-card"
              @click="viewProduct(product.id)"
            >
              <div class="product-image-container">
                <img :src="getImageUrl(product.cover)" :alt="product.title" class="product-image" @error="handleImageError" />
                <div class="product-overlay">
                  <span class="view-details">查看详情</span>
                </div>
              </div>
              <div class="product-info">
                <h3 class="product-title" :title="product.title">{{ product.title }}</h3>
                <div class="product-price">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ formatPrice(product.price) }}</span>
                </div>
                <div class="product-stats">
                  <div class="product-rating" v-if="product.rate">
                    <span class="stars">
                      <span v-for="n in 5" :key="n" :class="['star', { filled: n <= Math.round(product.rate / 2) }]">★</span>
                    </span>
                    <span class="rate-text">{{ product.rate }}</span>
                  </div>
                  <div class="product-sales" v-if="product.salesCount">
                    <span class="sales-text">{{ product.salesCount }}人购买</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 未找到店铺 -->
      <div v-else class="not-found">
        <div class="not-found-icon">🏪</div>
        <p>未找到该店铺</p>
        <router-link to="/" class="back-home-btn">返回首页</router-link>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import storeApi from '@/api/modules/store'
import chatApi from '@/api/modules/chat'
import api from '@/api'
import { getImageUrl } from '@/utils/image'
import BackButton from '@/components/common/BackButton.vue'
import type { Product } from '@/types/api'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const store = ref<any | null>(null)
const products = ref<Product[]>([])
const loadingProducts = ref(false)

// 从 localStorage 读取当前用户信息
const rawUserInfo = localStorage.getItem('userInfo')
let parsedUserInfo: any = null
try {
  parsedUserInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null
} catch (e) {
  console.warn('无法解析 userInfo:', e)
  parsedUserInfo = null
}

const showManageLink = computed(() => {
  if (!store.value || !parsedUserInfo) return false
  const role = parsedUserInfo.role || parsedUserInfo?.userRole || ''
  if (role === 'ADMIN' || role === 'ADMINISTRATOR') return true
  if (role === 'MERCHANT') {
    const currentUserId = parsedUserInfo.id || parsedUserInfo.userId || parsedUserInfo.accountId
    return String(currentUserId) === String(store.value.merchantId)
  }
  return false
})

const fetchStore = async () => {
  loading.value = true
  error.value = ''
  try {
    const idParam = route.params.id
    const id = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(String(idParam), 10)
    if (isNaN(id)) {
      throw new Error('店铺ID格式错误')
    }
    const res = await storeApi.getStoreById(id)
    if (res && res.data) {
      store.value = res.data
      // 加载店铺商品
      await fetchStoreProducts(id)
    } else {
      throw new Error('店铺不存在')
    }
  } catch (err: any) {
    error.value = err.message || '加载店铺信息失败'
  } finally {
    loading.value = false
  }
}

const fetchStoreProducts = async (storeId: number) => {
  loadingProducts.value = true
  try {
    const response = await api.product.getProductsByStore(storeId)
    if (response && response.code === '200' && response.data) {
      // response.data 是 SearchResult 对象，包含 products 数组
      products.value = response.data.products || []
    }
  } catch (err) {
    console.error('加载店铺商品失败:', err)
  } finally {
    loadingProducts.value = false
  }
}

const viewProduct = (productId: number) => {
  router.push(`/product/${productId}`)
}

const formatPrice = (price: number) => {
  return (typeof price === 'number' ? price.toFixed(2) : '0.00')
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '未知'
  }
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.onerror = null
  target.src = ''
}

const contactMerchant = async () => {
  if (!store.value) {
    ElMessage.error('店铺信息加载失败')
    return
  }

  // 检查用户是否登录
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录后再联系商家')
    router.push('/login')
    return
  }

  try {
    // 创建或获取与该店铺的聊天会话
    const response = await chatApi.createChatSession({ storeId: store.value.id })
    
    if (response && response.code === '200' && response.data) {
      // 跳转到聊天页面，并传递会话ID
      router.push({
        path: '/chat',
        query: { sessionId: response.data.id.toString() }
      })
    } else {
      ElMessage.error('创建会话失败，请稍后重试')
    }
  } catch (error: any) {
    console.error('联系商家失败:', error)
    ElMessage.error(error.message || '联系商家失败，请稍后重试')
  }
}

onMounted(() => {
  fetchStore()
})
</script>


<style scoped>
.store-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 60px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-button-wrapper {
  margin-bottom: 16px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-spinner.small {
  width: 30px;
  height: 30px;
  border-width: 3px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p,
.loading-products p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  color: #e74c3c;
  font-size: 16px;
  margin: 0 0 20px 0;
}

.retry-btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background: #e55a2b;
}

/* 店铺内容 */
.store-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 店铺头部 */
.store-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
  color: white;
}

.store-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.store-info {
  flex: 1;
}

.store-name {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.store-description {
  font-size: 16px;
  margin: 0 0 16px 0;
  opacity: 0.9;
  line-height: 1.5;
}

.store-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
  opacity: 0.85;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item svg {
  width: 16px;
  height: 16px;
}

.store-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  border: none;
  white-space: nowrap;
}

.btn svg {
  width: 16px;
  height: 16px;
}

.btn-manage {
  background: white;
  color: #ff6b35;
}

.btn-manage:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-contact {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-contact:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 店铺商品 */
.store-products {
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

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.product-count {
  color: #666;
  font-size: 14px;
}

.loading-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.no-products {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-products p {
  font-size: 16px;
  margin: 0;
}

/* 商品网格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.product-card:hover {
  border-color: #ff6b35;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.15);
  transform: translateY(-8px);
}

.product-image-container {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
  background-color: #f8f8f8;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.view-details {
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border: 2px solid white;
  border-radius: 20px;
}

.product-info {
  padding: 12px;
}

.product-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.product-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.price-symbol {
  font-size: 12px;
  color: #ff6b35;
  font-weight: 500;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
  color: #ff6b35;
  margin-left: 1px;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.stars {
  color: #ddd;
  margin-right: 4px;
  font-size: 10px;
}

.star.filled {
  color: #ffc107;
}

.rate-text {
  color: #666;
  font-size: 11px;
}

.sales-text {
  color: #999;
  font-size: 11px;
}

/* 未找到店铺 */
.not-found {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.not-found-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.not-found p {
  color: #666;
  font-size: 18px;
  margin: 0 0 24px 0;
}

.back-home-btn {
  display: inline-block;
  background: #ff6b35;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.back-home-btn:hover {
  background: #e55a2b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .store-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .store-actions {
    width: 100%;
  }

  .btn {
    width: 100%;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style>
