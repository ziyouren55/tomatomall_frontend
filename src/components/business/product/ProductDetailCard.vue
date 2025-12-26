<template>
  <div class="product-detail-card">
    <div class="product-layout">
      <!-- 左侧商品图片 -->
      <div class="product-image-section">
        <div class="main-image">
          <img :src="product.cover" :alt="product.title" />
        <div v-if="props.product?.priority" :class="['detail-location-badge', props.product.priority]">
          {{ props.product.priority === 'same_school' ? '同校' : props.product.priority === 'same_city' ? '同城' : '其他' }}
        </div>
        </div>
        <!-- 缩略图列表（可选） -->
        <div class="thumbnail-list">
          <div class="thumbnail active">
            <img :src="product.cover" :alt="product.title" />
          </div>
          <div class="thumbnail">
            <img :src="product.cover" :alt="product.title" />
          </div>
          <div class="thumbnail">
            <img :src="product.cover" :alt="product.title" />
          </div>
        </div>
      </div>

      <!-- 右侧商品信息 -->
      <div class="product-info-section">
        <!-- 商品名称 -->
        <div class="product-title">
          <h1>{{ product.title }}</h1>
        </div>
        <div class="merchant-mini" v-if="props.product?.storeId || props.product?.store?.id" style="margin-top:8px;">
          <UserMiniCard :storeId="props.product?.storeId" :size="36" :showName="true" />
        </div>

        <!-- 商品价格 -->
        <div class="product-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ formatPrice(product.price) }}</span>
          <span class="price-decimal">.{{ getPriceDecimal(product.price) }}</span>
        </div>

        <!-- 库存信息 -->
        <div class="product-stock">
          <span class="stock-label">库存：</span>
          <span class="stock-value" :class="{ 'out-of-stock': isOutOfStock }">
            {{ isOutOfStock ? '缺货' : `${getAvailableStock()}件` }}
          </span>
        </div>
        <div class="product-rating">
          <div class="rating-stars">
            <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= Math.floor((product.rate || 0) / 2) }">
              ★
            </span>
          </div>
          <span class="rating-score">{{ product.rate || 0 }}/10分</span>
          <span class="rating-count">(1024条评价)</span>
        </div>

        <!-- 商品描述 -->
        <div class="product-description">
          <h3>商品描述</h3>
          <p>{{ product.description }}</p>
        </div>

        <!-- 商品详细说明 -->
        <div class="product-detail">
          <h3>商品详情</h3>
          <div class="detail-content" v-html="product.detail"></div>
        </div>

        <!-- 操作按钮 -->
        <div class="product-actions">
          <div class="quantity-selector">
            <label>数量：</label>
            <div class="quantity-controls">
              <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
              <span class="quantity">{{ quantity }}</span>
              <button @click="increaseQuantity" :disabled="quantity >= maxQuantity || isOutOfStock">+</button>
            </div>
            <span class="stock-hint" v-if="!isOutOfStock">
              (库存{{ getAvailableStock() }}件)
            </span>
          </div>
          
          <div class="action-buttons">
            <button 
              class="btn btn-cart" 
              @click="addToCart"
              :disabled="isOutOfStock || (loadingActions?.addToCart || false)"
              :class="{ 'loading': loadingActions?.addToCart || false }"
            >
              <span v-if="loadingActions?.addToCart">加入中...</span>
              <span v-else-if="isOutOfStock">缺货</span>
              <span v-else-if="props.cartItem">更新购物车 ({{ props.cartItem.quantity }}+{{ quantity }})</span>
              <span v-else>加入购物车</span>
            </button>
            <button
              class="btn btn-store"
              @click="goToStore"
              :disabled="!props.product?.storeId && !props.product?.store?.id"
            >
              前往店铺
            </button>
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { Stockpile, CartItem } from '@/types/api'
import type { Product } from '@/types/api'
import UserMiniCard from '@/components/common/UserMiniCard.vue'

// 接收商品数据和相关状态
const props = defineProps<{
  product: Product
  stockpile?: Stockpile | null
  loadingActions?: {
    addToCart?: boolean
  }
  cartItem?: CartItem | null
}>()

// 定义事件
const emit = defineEmits<{
  'add-to-cart': [quantity: number]
}>()

// 商品数量
const quantity = ref(1)
const maxQuantity = computed(() => {
  console.log('计算最大购买数量:', props.stockpile);
  
  // 根据StockpileVO结构获取库存数据
  const stockpileData = props.stockpile?.data || props.stockpile;
  
  if (stockpileData) {
    // 可用库存 = 总库存(amount) - 冻结库存(frozen)
    const availableStock = 
      typeof stockpileData.amount === 'number' && 
      typeof stockpileData.frozen === 'number' ? 
      stockpileData.amount - stockpileData.frozen : 0;
    
    return Math.max(1, availableStock);
  }
  
  return 1;
})

// 检查库存是否充足
const isOutOfStock = computed(() => {
  console.log('库存检查:', props.stockpile);
  // 检查stockpile是否为null或undefined
  if (!props.stockpile) return true;
  
  // 检查是否有错误码
  if (props.stockpile.code && props.stockpile.code !== '200') {
    console.log('库存API返回错误:', props.stockpile);
    return true;
  }
  
  // 根据StockpileVO结构获取库存数据
  const stockpileData = props.stockpile.data || props.stockpile;
  
  // 检查amount和frozen字段
  if (stockpileData) {
    // 可用库存 = 总库存(amount) - 冻结库存(frozen)
    const availableStock = 
      typeof stockpileData.amount === 'number' && 
      typeof stockpileData.frozen === 'number' ? 
      stockpileData.amount - stockpileData.frozen : 0;
    
    console.log('可用库存:', availableStock);
    return availableStock <= 0;
  }
  
  return true;
})

// 格式化价格（整数部分）
const formatPrice = (price: number) => {
  return Math.floor(price).toLocaleString()
}

// 获取价格小数部分
const getPriceDecimal = (price: number) => {
  const decimal = (price % 1).toFixed(2).substring(2)
  return decimal
}

// 增加数量
const increaseQuantity = () => {
  console.log('增加前数量:', quantity.value);
  console.log('最大数量:', maxQuantity.value);
  console.log('库存数量:', props.stockpile?.quantity);
  
  if (quantity.value < maxQuantity.value) {
    quantity.value++;
    console.log('增加后数量:', quantity.value);
  } else {
    ElMessage.warning(`最多只能购买${maxQuantity.value}件`);
  }
}

// 减少数量
const decreaseQuantity = () => {
  console.log('减少前数量:', quantity.value);
  if (quantity.value > 1) {
    quantity.value--;
    console.log('减少后数量:', quantity.value);
  }
}

// 加入购物车
const addToCart = () => {
  if (isOutOfStock.value) {
    ElMessage.warning('商品库存不足');
    return;
  }
  
  if (quantity.value > maxQuantity.value) {
    ElMessage.warning(`库存不足，最多只能购买${maxQuantity.value}件`);
    quantity.value = maxQuantity.value; // 自动调整为最大可购买数量
    return;
  }
  
  emit('add-to-cart', quantity.value);
}

// 跳转到店铺详情
const router = useRouter()
const goToStore = () => {
  const storeId = props.product?.storeId || props.product?.store?.id
  if (!storeId) {
    ElMessage.warning('未找到所属店铺')
    return
  }
  router.push(`/stores/${storeId}`)
}

 

// 计算可用库存
const getAvailableStock = () => {
  const stockpileData = props.stockpile?.data || props.stockpile;
  
  if (stockpileData && 
      typeof stockpileData.amount === 'number' && 
      typeof stockpileData.frozen === 'number') {
    return Math.max(0, stockpileData.amount - stockpileData.frozen);
  }
  
  return 0;
}

// 监听库存变化，调整数量
watch(() => getAvailableStock(), (newAvailableStock) => {
  if (newAvailableStock !== undefined && quantity.value > newAvailableStock && newAvailableStock > 0) {
    quantity.value = Math.min(quantity.value, newAvailableStock)
  }
}, { immediate: true })
</script>

<style scoped>
.product-detail-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.product-layout {
  display: flex;
  min-height: 600px;
}

/* 左侧图片区域 */
.product-image-section {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.main-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.main-image img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
}

.detail-location-badge {
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 6px 10px;
  border-radius: 14px;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
  z-index: 6;
}
.detail-location-badge.same_school { background: #28a745; }
.detail-location-badge.same_city   { background: #007bff; }
.detail-location-badge.other       { background: rgba(0,0,0,0.6); }

.thumbnail-list {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s;
}

.thumbnail.active {
  border-color: #ff6b35;
}

.thumbnail:hover {
  border-color: #ff6b35;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右侧信息区域 */
.product-info-section {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-title h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin: 0;
}

.product-price {
  display: flex;
  align-items: baseline;
  color: #ff6b35;
  font-weight: bold;
}

.price-symbol {
  font-size: 20px;
}

.price-value {
  font-size: 32px;
  margin: 0 2px;
}

.price-decimal {
  font-size: 20px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 18px;
  color: #ddd;
  transition: color 0.3s;
}

.star.filled {
  color: #ffd700;
}

.rating-score {
  font-weight: 600;
  color: #333;
}

.rating-count {
  color: #666;
  font-size: 14px;
}

.product-description,
.product-detail {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.product-description h3,
.product-detail h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.product-description p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.detail-content {
  color: #666;
  line-height: 1.6;
}

.detail-content h3 {
  color: #333;
  font-size: 14px;
  margin: 16px 0 8px 0;
}

.detail-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.detail-content li {
  margin: 4px 0;
}

.detail-content p {
  margin: 8px 0;
}

.product-actions {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.quantity-selector label {
  font-weight: 500;
  color: #333;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-controls button {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.quantity-controls button:hover:not(:disabled) {
  background: #e0e0e0;
}

.quantity-controls button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.quantity {
  min-width: 40px;
  text-align: center;
  font-weight: 500;
  padding: 0 8px;
}

.stock-hint {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cart {
  background: #fff;
  color: #ff6b35;
  border: 2px solid #ff6b35;
}

.btn-cart:hover {
  background: #ff6b35;
  color: white;
}

.btn-store {
  background: #ff6b35;
  color: white;
  border: none;
}

.btn-store:hover {
  background: #e55a2b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-layout {
    flex-direction: column;
  }
  
  .product-image-section,
  .product-info-section {
    flex: none;
    padding: 20px;
  }
  
  .product-title h1 {
    font-size: 20px;
  }
  
  .price-value {
    font-size: 28px;
  }
}
</style>