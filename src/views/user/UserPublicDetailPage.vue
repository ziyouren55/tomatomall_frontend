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
import api from '@/api'
import storeApi from '@/api/modules/store'
import productApi from '@/api/modules/product'
import { getRoleLabel as getRoleLabelUtil } from '@/utils/constants'
import ProductCard from '@/components/business/product/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const usernameParam = String(route.params.username || '')

const loading = ref(true)
const error = ref('')
const user: any = ref({})
const defaultAvatar = 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2'

const isMerchant = computed(() => (user.value?.role || '').toUpperCase() === 'MERCHANT')
const roleLabel = computed(() => getRoleLabelUtil(user.value?.role))

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

onMounted(() => {
  fetchUser()
})
</script>

<style scoped>
.public-profile-page { padding: 24px; min-height: 60vh; }
.profile-card { max-width: 1000px; margin: 0 auto; background:#fff; padding:20px; border-radius:8px }
.profile-header { display:flex; gap:16px; align-items:center; }
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


