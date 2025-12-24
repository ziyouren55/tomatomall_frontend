<template>
  <div class="public-profile-page">
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
         user.value.id !== currentUser?.id &&
         isMerchant.value // 只有商家才能被顾客发起聊天
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

// 开始聊天
async function startChat() {
  if (!canChat.value) return

  chatLoading.value = true
  try {
    // 找到该商家的店铺（这里简化处理，取第一个店铺）
    if (!stores.value || stores.value.length === 0) {
      ElMessage.warning('该商家暂无店铺，无法发起聊天')
      return
    }

    const storeId = stores.value[0].id

    // 创建或获取聊天会话
    const response = await chatApi.createChatSession({ storeId })
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
  fetchUser()
})
</script>

<style scoped>
.public-profile-page { padding: 24px; min-height: 60vh; }
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
</style>


