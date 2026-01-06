<template>
  <div class="public-profile-page">
    <!-- 返回按钮 -->
    <div class="back-button-wrapper">
      <BackButton text="返回" fallback-path="/" />
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="profile-card">
      <div class="profile-header">
        <img :src="user.avatar || defaultAvatar" :alt="user.name" class="avatar" />
        <div class="user-meta">
          <h2>{{ user.name }}</h2>
          <p class="username">@{{ user.username }}</p>
          <span class="role">{{ roleLabel }}</span>
          <p v-if="user.location">所在地：{{ user.location }}</p>
        </div>
        <div class="profile-actions" v-if="canChat">
          <el-button type="primary" @click="startChat" :loading="chatLoading">
            <el-icon><ChatDotRound /></el-icon>
            聊天
          </el-button>
        </div>
      </div>

      <section v-if="isMerchant" class="merchant-section">
        <h3>店铺与商品</h3>
        <div v-if="storesLoading">加载店铺...</div>
        <div v-else>
          <div v-if="stores.length === 0">该商家暂无店铺</div>
          <div v-for="s in stores" :key="s.id" class="store-block">
            <h4>{{ s.name }}</h4>
            <p class="store-desc">{{ s.description || '暂无店铺描述' }}</p>
            <div class="products-list">
              <template v-if="productsByStore[s.id]?.length">
                <div
                  v-for="p in productsByStore[s.id]"
                  :key="p.id"
                  class="product-item"
                >
                  <ProductCard
                    :product="p"
                    @view="handleViewProduct"
                  />
                </div>
              </template>
              <div v-else class="no-products">暂无商品</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 顾客信息区域 -->
      <section v-if="!isMerchant" class="customer-section">
        <h3>用户资料</h3>
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-label">注册时间：</span>
            <span class="stat-value">{{ user.registerTime ? formatDate(user.registerTime) : '未知' }}</span>
          </div>
          <div class="stat-item" v-if="user.location">
            <span class="stat-label">所在地：</span>
            <span class="stat-value">{{ user.location }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">用户角色：</span>
            <span class="stat-value">{{ roleLabel }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound } from '@element-plus/icons-vue'
import api from '@/api'
import storeApi from '@/api/modules/store'
import productApi from '@/api/modules/product'
import chatApi from '@/api/modules/chat'
import { getRoleLabel as getRoleLabelUtil } from '@/utils/constants'
import store from '@/store'
import ProductCard from '@/components/business/product/ProductCard.vue'
import BackButton from '@/components/common/BackButton.vue'

const route = useRoute()
const router = useRouter()
// 使用store
const usernameParam = String(route.params.username || '')

const loading = ref(true)
const error = ref('')
const user: any = ref({})
const defaultAvatar = 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2'

const chatLoading = ref(false)

const isMerchant = computed(() => (user.value?.role || '').toUpperCase() === 'MERCHANT')
const roleLabel = computed(() => getRoleLabelUtil(user.value?.role))

// 判断是否可以聊天（不能和自己聊天）
const canChat = computed(() => {
  const currentUser = store.state.user.userInfo
  const isLoggedIn = !!store.state.user.token
  return isLoggedIn &&
         user.value?.id &&
         user.value.id !== currentUser?.id // 不能和自己聊天，允许双向聊天
})

const stores = ref<any[]>([])
const storesLoading = ref(false)
const productsByStore = ref<Record<number, any[]>>({})

async function fetchUser() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.user.getUserDetails(usernameParam)
    if (res && res.code === '200' && res.data) {
      user.value = res.data
      if (isMerchant.value) {
        await fetchStoresAndProducts(user.value.id)
      }
    } else {
      error.value = res?.msg || '未找到用户'
    }
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function fetchStoresAndProducts(merchantId: number) {
  storesLoading.value = true
  try {
    const sres = await storeApi.getStoresByMerchantId(merchantId)
    if (sres && sres.code === '200' && Array.isArray(sres.data)) {
      stores.value = sres.data
      await Promise.all(stores.value.map(async (s: any) => {
        try {
          const pres = await productApi.getProductsByStore(s.id, 0, 12)
          productsByStore.value[s.id] = pres && pres.code === '200' && pres.data && Array.isArray(pres.data.products)
            ? pres.data.products
            : []
        } catch {
          productsByStore.value[s.id] = []
        }
      }))
    } else {
      stores.value = []
    }
  } catch (e) {
    stores.value = []
  } finally {
    storesLoading.value = false
  }
}

function handleViewProduct(productId: number) {
  router.push(`/product/${productId}`)
}

// 格式化日期
function formatDate(dateStr: string): string {
  if (!dateStr) return '未知'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return '未知'
  }
}

// 开始聊天
async function startChat() {
  if (!canChat.value) return

  chatLoading.value = true
  try {
    // 使用新的用户间聊天API，支持任意用户间的聊天
    const response = await chatApi.createChatSessionWithUser({ 
      targetUserId: user.value.id 
    })

    if (response && response.code === '200' && response.data) {
      // 跳转到聊天页面，并传递会话ID
      router.push({
        path: '/chat',
        query: { sessionId: response.data.id }
      })
      ElMessage.success('已打开聊天窗口')
    } else {
      ElMessage.error(response?.msg || '创建聊天会话失败')
    }
  } catch (error: any) {
    console.error('发起聊天失败:', error)
    ElMessage.error(error?.response?.data?.msg || '发起聊天失败，请稍后重试')
  } finally {
    chatLoading.value = false
  }
}

onMounted(() => {
  fetchUser()
})
</script>

<style scoped>
.public-profile-page { padding: 24px; min-height: 60vh; }

.back-button-wrapper {
  max-width: 1000px;
  margin: 0 auto 16px;
}

.profile-card { max-width: 1000px; margin: 0 auto; background:#fff; padding:20px; border-radius:8px }
.profile-header { display:flex; gap:16px; align-items:center; justify-content: space-between; }
.avatar { width:96px; height:96px; object-fit:cover; border-radius:8px }
.user-meta h2 { margin:0; }
.username { color:#666 }
.merchant-section { margin-top:20px }
.store-block { margin-bottom:18px; padding:12px; border:1px solid #eee; border-radius:6px }
.products-list {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
/* 限制子项高度，防止长标题撑高卡片（参考 ProductList 的布局行为） */
.products-list .product-item {
  height: 320px;
  overflow: hidden;
  display: block;
  align-self: start;
}

/* 让内部的 ProductCard 充满父容器并使用列布局（使用 deep 选择器作用于子组件根元素） */
.products-list .product-item :deep(.product-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.products-list .product-item :deep(.product-image-container) {
  flex: 0 0 auto;
}
.products-list .product-item :deep(.product-info) {
  flex: 1 1 auto;
  overflow: hidden;
}

.customer-section {
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.customer-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.stat-label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.stat-value {
  color: #333;
}
</style>


