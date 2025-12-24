<template>
  <div class="store-detail-page">
    <div class="container">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="store" class="store-card">
        <h1 class="store-name">{{ store.name }}</h1>
        <p class="store-desc">{{ store.description || '暂无店铺描述' }}</p>
        <div class="store-meta">
          <span>店铺ID: {{ store.id }}</span>
          <span v-if="store.merchantId"> · 商家ID: {{ store.merchantId }}</span>
        </div>
        <div class="store-actions">
          <router-link
            v-if="showManageLink"
            :to="`/merchant/stores/${store.id}`"
            class="manage-link"
          >查看管理页</router-link>
        </div>
      </div>
      <div v-else>
        <p>未找到店铺</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import storeApi from '@/api/modules/store'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const store = ref<any | null>(null)
// 从 localStorage 读取当前用户信息（userInfo），用于判断是否显示管理入口
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
    // 当前用户为商家且是该店铺的拥有者
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
    } else {
      throw new Error('店铺不存在')
    }
  } catch (err: any) {
    error.value = err.message || '加载店铺信息失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStore()
})
</script>

<style scoped>
.store-detail-page { min-height: 60vh; padding: 40px 0; background: #f5f5f5; }
.container { max-width: 1000px; margin: 0 auto; background: #fff; padding: 28px; border-radius: 8px; }
.store-name { font-size: 24px; margin: 0 0 8px 0; }
.store-desc { color: #666; margin: 0 0 12px 0; }
.store-meta { color: #999; margin-bottom: 16px; }
.manage-link { display: inline-block; background: #ff6b35; color: #fff; padding: 8px 12px; border-radius: 6px; text-decoration: none; }
</style>


