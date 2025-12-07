<!-- src/components/ProductList.vue -->
<template>
  <div class="product-list">
    <!-- 搜索结果提示 -->
    <div v-if="searchKeyword && !loading && products.length > 0" class="search-info">
      <p>找到 <strong>{{ total }}</strong> 个相关商品（关键词：<strong>{{ searchKeyword }}</strong>）</p>
    </div>
    <div v-if="loading && currentPage === 0" class="loading">
      <div class="loading-spinner"></div>
      <p>{{ searchKeyword ? '正在搜索商品...' : '正在加载商品...' }}</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="resetAndFetch" class="retry-btn">重试</button>
    </div>
    <div v-else-if="products.length === 0 && !loadingMore" class="no-products">
      <p v-if="searchKeyword">未找到相关商品，请尝试其他关键词</p>
      <p v-else>暂无商品</p>
    </div>
    <div v-else class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card" @click="viewProduct(product.id)"
        @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <div class="product-image-container">
          <img :src="product.cover" :alt="product.title" class="product-image" @error="handleImageError">
          <div class="product-overlay">
            <span class="view-details">查看详情</span>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-title" :title="product.title">{{ product.title }}</h3>
          <div class="product-price">
            <span class="price-symbol">¥</span>
            <span class="price-value">{{ product.price.toFixed(2) }}</span>
          </div>
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
    
    <!-- 加载更多指示器 -->
    <div v-if="loadingMore" class="loading-more">
      <div class="loading-spinner-small"></div>
      <p>加载更多商品...</p>
    </div>
    <div v-if="reachedLimit && products.length > 0" class="limit-reached">
      <p>已显示前 {{ products.length }} 个商品</p>
      <p class="limit-hint">为了更好的浏览体验，我们限制了显示数量。请使用搜索功能查找更多商品。</p>
    </div>
    <div v-else-if="!hasMore && products.length > 0 && !reachedLimit" class="no-more">
      <p>没有更多商品了</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';

export default defineComponent({
  name: 'ProductList',
  props: {
    searchKeyword: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      products: [] as any[],
      loading: true,
      loadingMore: false,
      error: null as string | null,
      currentPage: 0,
      pageSize: 20,
      hasMore: true,
      total: 0,
      maxPages: 2, // 最多加载10页（200个商品），避免无限滚动导致数据过多
      reachedLimit: false // 是否达到上限
    };
  },
  watch: {
    searchKeyword: {
      handler() {
        this.resetAndFetch();
      },
      immediate: false
    }
  },
  mounted() {
    this.fetchProducts();
    // 添加滚动监听
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    // 移除滚动监听
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    resetAndFetch() {
      this.currentPage = 0;
      this.products = [];
      this.hasMore = true;
      this.total = 0;
      this.reachedLimit = false;
      this.fetchProducts();
    },
    async fetchProducts(append = false): Promise<void> {
      // 如果正在加载或没有更多数据，则不加载
      if (this.loadingMore || (!this.hasMore && append) || this.reachedLimit) {
        return;
      }
      
      // 检查是否达到最大页数限制
      if (this.currentPage >= this.maxPages) {
        this.reachedLimit = true;
        this.hasMore = false;
        return;
      }

      if (append) {
        this.loadingMore = true;
      } else {
        this.loading = true;
      }
      this.error = null;

      try {
        let response;
        if (this.searchKeyword && this.searchKeyword.trim()) {
          // 搜索模式：使用搜索接口
          response = await api.product.searchProducts(
            this.searchKeyword.trim(), 
            this.currentPage, 
            this.pageSize
          );
          if (response && response.code === '200' && response.data) {
            const newProducts = Array.isArray(response.data.products) 
              ? response.data.products 
              : [];
            if (append) {
              this.products.push(...newProducts);
            } else {
              this.products = newProducts;
            }
            this.total = response.data.total || 0;
            // 检查是否还有更多数据，同时检查是否达到最大页数限制
            const hasMoreData = newProducts.length === this.pageSize && 
                               this.products.length < this.total;
            const withinLimit = (this.currentPage + 1) < this.maxPages;
            this.hasMore = hasMoreData && withinLimit;
            
            // 如果达到上限但还有数据，标记为达到上限
            if (!withinLimit && hasMoreData) {
              this.reachedLimit = true;
            }
          } else {
            this.error = response?.msg || '搜索商品失败';
          }
        } else {
          // 普通模式：使用分页接口
          response = await api.product.getAllProducts(
            this.currentPage, 
            this.pageSize
          );
          if (response && response.code === '200' && response.data) {
            const newProducts = Array.isArray(response.data.products) 
              ? response.data.products 
              : [];
            if (append) {
              this.products.push(...newProducts);
            } else {
              this.products = newProducts;
            }
            this.total = response.data.total || 0;
            // 检查是否还有更多数据，同时检查是否达到最大页数限制
            const hasMoreData = newProducts.length === this.pageSize && 
                               this.products.length < this.total;
            const withinLimit = (this.currentPage + 1) < this.maxPages;
            this.hasMore = hasMoreData && withinLimit;
            
            // 如果达到上限但还有数据，标记为达到上限
            if (!withinLimit && hasMoreData) {
              this.reachedLimit = true;
            }
          } else {
            this.error = response?.msg || '加载商品失败';
          }
        }
        
        if (this.hasMore) {
          this.currentPage++;
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          this.error = '无法加载商品列表，请检查网络连接';
          console.warn('商品列表API需要登录，但商品列表应该是公开的');
        } else {
          this.error = '网络错误，请稍后重试';
        }
        console.error('获取商品列表失败:', err);
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },
    handleScroll() {
      // 如果达到上限，不再加载
      if (this.reachedLimit) {
        return;
      }
      
      // 滚动到底部时加载更多（距离底部100px时触发）
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 100) {
        this.fetchProducts(true);
      }
    },
    viewProduct(id: string | number): void {
      this.$router.push(`/product/${id}`);
    },
    handleImageError(event: Event): void {
      const target = event.target as HTMLImageElement;
      target.onerror = null;
      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E暂无图片%3C/text%3E%3C/svg%3E';
    },
    onMouseEnter(event: Event): void {
      (event.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
    },
    onMouseLeave(event: Event): void {
      (event.currentTarget as HTMLElement).style.transform = 'translateY(0)';
    }
  }
});
</script>

<style scoped>
.product-list {
  width: 100%;
}

/* 网格布局：一行6个商品 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  padding: 0;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .products-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

/* 商品卡片样式 */
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.product-card:hover {
  border-color: #ff6b35;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.15);
  transform: translateY(-8px);
}

/* 商品图片容器 - 16:9比例 */
.product-image-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  /* 16:9 aspect ratio */
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

/* 图片遮罩层 */
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
  transition: all 0.3s ease;
}

.view-details:hover {
  background-color: white;
  color: #333;
}

/* 商品信息区域 */
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

/* 商品统计信息 */
.product-stats {
  padding: 0 12px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.product-rating {
  display: flex;
  align-items: center;
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

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error {
  text-align: center;
  padding: 60px 20px;
  color: #e53935;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background-color: #45a049;
}

/* 无商品状态 */
.no-products {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

/* 搜索结果提示 */
.search-info {
  margin-bottom: 20px;
  padding: 12px 20px;
  background-color: #f0f7ff;
  border-left: 4px solid #ff6b35;
  border-radius: 4px;
}

.search-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.search-info strong {
  color: #ff6b35;
  font-weight: 600;
}

/* 加载更多样式 */
.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner-small {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.no-more {
  text-align: center;
  padding: 30px 20px;
  color: #999;
  font-size: 14px;
}

/* 达到上限提示 */
.limit-reached {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #fff5f2 0%, #ffe0d6 100%);
  border-radius: 8px;
  margin-top: 20px;
  border: 2px solid #ff6b35;
}

.limit-reached p {
  margin: 8px 0;
  color: #333;
  font-size: 14px;
}

.limit-reached p:first-child {
  font-weight: 600;
  color: #ff6b35;
  font-size: 16px;
}

.limit-hint {
  color: #666 !important;
  font-size: 13px !important;
  margin-top: 12px !important;
}
</style>