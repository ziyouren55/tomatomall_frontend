<template>
  <div class="product-detail-page">
    <div class="container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载商品详情...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <h3>加载失败</h3>
          <p>{{ error }}</p>
          <button @click="fetchProductDetail" class="retry-btn">重试</button>
        </div>
      </div>

      <!-- 商品详情与书评 -->
      <template v-else-if="product">
      <ProductDetailCard
        :product="product"
        :stockpile="stockpile"
        :loading-actions="loadingActions"
        :cart-item="cartItem"
        @add-to-cart="handleAddToCart"
      />

        <section class="product-review-container">
          <div class="section-header">
            <h2>书评</h2>
            <router-link :to="`/bookcomment?productId=${product.id}`" class="more-link">去书评中心</router-link>
          </div>
          <BookCommentList v-if="product?.id" :product-id="product.id" />
        </section>
      </template>

      <!-- 商品不存在 -->
      <div v-else class="not-found-container">
        <h3>商品不存在</h3>
        <p>抱歉，找不到该商品信息</p>
        <router-link to="/" class="back-home-btn">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProductDetailCard from '@/components/business/product/ProductDetailCard.vue'
import BookCommentList from '@/components/business/review/BookCommentList.vue'
import api from '@/api'
import type { Stockpile, CartItem } from '@/types/api'
import type { Product } from '@/types/api'
import type { AxiosError } from 'axios'

const route = useRoute()
const router = useRouter()

// 响应式数据
const product = ref<Product | null>(null)
const stockpile = ref<Stockpile | null>(null)
const loading = ref<boolean>(true)
const error = ref<string>('')
const loadingActions = ref<{
  addToCart: boolean
}>({
  addToCart: false
})
const cartItem = ref<CartItem | null>(null) // 存储购物车中的商品信息
let unwatchRoute: (() => void) | null = null // 路由监听器

// 获取商品详情
const fetchProductDetail = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = ''

    const productId = route.params.id
    if (!productId) {
      throw new Error('商品ID不能为空')
    }

    // 处理productId可能是string或string[]的情况
    const productIdStr = Array.isArray(productId) ? productId[0] : productId
    const productIdNum = parseInt(productIdStr, 10)
    if (isNaN(productIdNum as number)) {
      throw new Error('商品ID格式错误')
    }

    // 先获取商品详情（必需）
    const productResponse = await api.product.getProductById(productIdNum)
    if (!productResponse.data) {
      throw new Error('商品不存在')
    }

    product.value = productResponse.data
    if (product.value && !product.value.id && productIdNum) {
      // 确保商品对象有id字段
      product.value.id = productIdNum as number
    }

    console.log('获取到的商品信息:', product.value)

    // 并行获取库存信息和购物车信息（可选，失败不影响商品显示）
    try {
      const [stockpileResponse, cartResponse] = await Promise.allSettled([
        api.product.getProductStockpile(productIdNum),
        api.cart.getCartItems()
      ])

      // 处理库存信息
      if (stockpileResponse.status === 'fulfilled' && stockpileResponse.value.data) {
        stockpile.value = stockpileResponse.value.data
      } else {
        console.warn('获取库存信息失败:', stockpileResponse.status === 'rejected' ? stockpileResponse.reason : '无数据')
        stockpile.value = null
      }

      // 处理购物车信息
      if (cartResponse.status === 'fulfilled' && cartResponse.value && cartResponse.value.code === '200' && cartResponse.value.data) {
        const items = Array.isArray(cartResponse.value.data) ? cartResponse.value.data : []
        const productIdStr = String(productIdNum)
        // 比较时统一转为字符串，避免 item.productId 为 number / string 不一致导致匹配失败
        const foundItem = items.find((item: CartItem) => String(item.productId) === productIdStr && item.state === 'SHOW')
        if (foundItem) {
          cartItem.value = foundItem
          console.log('商品已在购物车中:', foundItem)
        } else {
          cartItem.value = null
        }
      } else {
        cartItem.value = null
      }
    } catch (cartError) {
      console.warn('获取购物车信息失败:', cartError)
      cartItem.value = null
    }

  } catch (err: unknown) {
    console.error('获取商品详情失败:', err)
    const axiosError = err as AxiosError
    if (axiosError.response?.status === 404) {
      error.value = '商品不存在'
    } else if (axiosError.response?.status === 401) {
      error.value = '请先登录'
      // 可以重定向到登录页
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = (err as Error).message || '网络错误，请检查您的网络连接'
    }
  } finally {
    loading.value = false
  }
}

// 处理加入购物车（在前端确保购物车中该商品总数量不超过可用库存）
const handleAddToCart = async (quantity: number) => {
  try {
    loadingActions.value.addToCart = true

    // 获取商品ID，确保它存在
    if (!product.value) {
      throw new Error('商品信息不存在')
    }

    const productId = product.value.id || route.params.id
    if (!productId) {
      throw new Error('商品ID不能为空')
    }

    // 处理productId可能是string或string[]的情况
    const productIdStr = Array.isArray(productId) ? productId[0] : String(productId)
    const productIdNum = typeof productIdStr === 'string' ? parseInt(productIdStr, 10) : productIdStr
    if (isNaN(productIdNum as number)) {
      throw new Error('商品ID格式错误')
    }

    console.log('添加到购物车的商品:', product.value)
    console.log('商品ID:', productIdNum)
    console.log('数量:', quantity)

    // 计算可用库存（总量 - 冻结）
    const stockpileData = stockpile.value?.data || stockpile.value
    const availableStock = stockpileData && typeof stockpileData.amount === 'number' && typeof stockpileData.frozen === 'number'
      ? Math.max(0, stockpileData.amount - stockpileData.frozen)
      : 0

    if (availableStock <= 0) {
      ElMessage.warning('商品库存不足')
      return
    }

    let response

    // 如果商品已在购物车中，计算合并后的总数量并限制为可用库存
    if (cartItem.value && cartItem.value.state === 'SHOW') {
      const existingQuantity = Number(cartItem.value.quantity || 0)
      const requestedTotal = existingQuantity + quantity
      const cartItemIdNum = parseInt(String(cartItem.value.cartItemId), 10)

      if (requestedTotal <= availableStock) {
        // 在可用库存内，直接更新为合计数量
        console.log('更新购物车项，新数量:', requestedTotal)
        response = await api.cart.updateCartItemQuantity(cartItemIdNum, requestedTotal)
      } else {
        // 超出库存：提示并将数量更新为可用库存（如果已有数量已经 >= 可用库存则不做更新）
        if (existingQuantity >= availableStock) {
          ElMessage.warning(`库存不足，购物车中已达到库存上限(${availableStock}件)`)
          return
        }
        ElMessage.warning(`库存不足，已为您将购物车数量调整为库存上限 ${availableStock} 件`)
        console.log('更新购物车项，新数量（调整为库存上限）:', availableStock)
        response = await api.cart.updateCartItemQuantity(cartItemIdNum, availableStock)
      }

      if (response && response.code === '200') {
        ElMessage({
          type: 'success',
          message: '购物车数量已更新'
        })
      }
    } else {
      // 不在购物车中，先检查请求数量是否超过可用库存
      if (quantity > availableStock) {
        ElMessage.warning(`库存不足，最多只能购买 ${availableStock} 件`)
        return
      }
      response = await api.cart.addToCart(productIdNum, quantity)

      if (response && response.code === '200') {
        ElMessage({
          type: 'success',
          message: '商品已加入购物车'
        })
      }
    }

    // 检查响应状态并刷新数据
    if (response && response.code === '200') {
      await fetchProductDetail()
    } else {
      throw new Error(response?.msg || '添加购物车失败')
    }

  } catch (err: unknown) {
    console.error('加入购物车失败:', err)

    const axiosError = err as AxiosError
    let errorMessage = '加入购物车失败'
    if (axiosError.response?.status === 401) {
      errorMessage = '请先登录'
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else if (axiosError.response?.status === 400) {
      errorMessage = (axiosError.response.data as any)?.message || '库存不足'
    } else if ((err as Error).message) {
      errorMessage = (err as Error).message
    }

    ElMessage({
      type: 'error',
      message: errorMessage
    })
  } finally {
    loadingActions.value.addToCart = false
  }
}

// 页面挂载时获取数据
onMounted(() => {
  fetchProductDetail()

  // 监听路由变化，如果商品ID改变则重新获取数据
  unwatchRoute = route.params.id !== undefined ?
    watch(() => route.params.id, (newId, oldId) => {
      if (newId !== oldId) {
        fetchProductDetail()
      }
    }) : null
})

onUnmounted(() => {
  if (unwatchRoute) {
    unwatchRoute()
  }
})
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 60px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 加载状态样式 */
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-message {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.error-message h3 {
  color: #e74c3c;
  font-size: 20px;
  margin: 0 0 12px 0;
}

.error-message p {
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.5;
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

/* 商品不存在样式 */
.not-found-container {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.not-found-container h3 {
  color: #666;
  font-size: 20px;
  margin: 0 0 12px 0;
}

.not-found-container p {
  color: #999;
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
</style>
