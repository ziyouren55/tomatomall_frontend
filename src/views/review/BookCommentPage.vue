<template>
  <div class="book-review-page">
    <NavigationBar />
    
    <div class="container">
      <header class="hero">
        <div class="hero-text">
          <p class="eyebrow">书评中心</p>
          <h1>发现好书 · 分享观点</h1>
          <p class="subtitle">选择图书，查看并发布对应的书评</p>
      </div>
        <div class="hero-actions">
          <router-link class="cta ghost" to="/">返回首页</router-link>
        </div>
      </header>
        
      <div class="main-grid">
        <!-- 左侧：书评列表 -->
        <section class="panel review-panel">
          <div class="panel-head">
            <div>
            <h3 v-if="selectedProduct">《{{ selectedProduct?.title || selectedProduct?.name }}》的书评</h3>
            <h3 v-else>请选择图书</h3>
              <p class="hint" v-if="selectedProduct?.author">作者：{{ selectedProduct?.author }}</p>
              <p class="hint" v-else>点击右侧列表选择图书查看书评</p>
            </div>
            <router-link v-if="selectedProductId" :to="`/bookcomment?productId=${selectedProductId}`" class="more-link">在书评中心打开</router-link>
          </div>
          <div class="review-body">
            <BookReviewList v-if="selectedProductId" :product-id="selectedProductId" :key="selectedProductId" />
            <div v-else class="empty-state">
              <h4>未选择图书</h4>
              <p>请从右侧选择图书后查看书评</p>
            </div>
          </div>
        </section>

        <!-- 右侧：图书选择 -->
        <section class="panel selector-panel">
          <div class="panel-head">
            <div>
              <h3>选择图书</h3>
              <p class="hint">点击卡片以查看该书书评</p>
            </div>
            <div class="search-box">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索图书名称..."
            @input="searchProducts"
          />
            </div>
        </div>
        
          <div class="products-grid" :class="{ loading: loadingProducts }">
            <div v-if="loadingProducts" class="loading">正在加载图书列表...</div>
            <template v-else>
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="product-card"
            :class="{ active: selectedProductId === product.id }"
            @click="selectProduct(product.id)"
          >
            <div class="product-image">
              <img 
                    :src="product.cover || product.imageUrl || placeholderImg"
                    :alt="product.title || product.name"
                @error="handleImageError"
              />
            </div>
            <div class="product-info">
                  <h4>{{ product.title || product.name }}</h4>
              <p class="product-author">{{ product.author || '未知作者' }}</p>
                  <p class="product-price" v-if="product.price">¥{{ product.price }}</p>
                </div>
            </div>
              <div v-if="filteredProducts.length === 0" class="no-products">暂无图书数据</div>
            </template>
        </div>
        
          <div class="selector-actions">
            <div class="pagination">
              <button class="btn ghost" :disabled="page === 0 || loadingProducts" @click="fetchPage(page - 1)">
                上一页
              </button>
              <span class="page-text">第 {{ page + 1 }} / {{ totalPages }} 页</span>
              <button class="btn" :disabled="page + 1 >= totalPages || loadingProducts" @click="fetchPage(page + 1)">
                下一页
              </button>
        </div>
            <p class="hint">共 {{ total }} 本</p>
        </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ElMessage } from 'element-plus'
import NavigationBar from '@/components/business/NavigationBar.vue';
import BookReviewList from '@/components/business/review/BookCommentList.vue';
import api from '@/api';

export default defineComponent({
  name: 'BookReviewPage',
  components: {
    NavigationBar,
    BookReviewList
  },
  data() {
    return {
      products: [] as any[],
      filteredProducts: [] as any[],
      selectedProductId: null as number | null,
      searchKeyword: '',
      loadingProducts: false,
      placeholderImg: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23f2f3f5"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E暂无图片%3C/text%3E%3C/svg%3E',
      page: 0,
      pageSize: 12,
      total: 0,
      totalPages: 1,
      searchMode: false,
      currentKeyword: ''
    };
  },
  computed: {
    selectedProduct(): any {
      return this.products.find(p => p.id === this.selectedProductId);
    },
    hasMore(): boolean {
      return this.products.length < this.total;
    }
  },
  mounted() {
    this.loadProducts();
    
    // 从路由参数中获取预选的产品ID
    const productId = this.$route.query.productId
    if (productId) {
      const id = Array.isArray(productId) ? productId[0] : productId
      this.selectedProductId = parseInt(id as string, 10);
    }
  },
  methods: {
    async loadProducts(): Promise<void> {
      this.loadingProducts = true;
      try {
        this.searchMode = false;
        this.currentKeyword = '';
        await this.fetchPage(0);
      } catch (error) {
        console.error('加载产品列表失败:', error);
        ElMessage.error('加载图书列表失败');
      } finally {
        this.loadingProducts = false;
      }
    },
    
    async fetchPage(targetPage: number): Promise<void> {
      this.page = targetPage;
      try {
        this.loadingProducts = true;
        const keyword = this.searchKeyword.trim();
        const isSearching = keyword.length > 0;
        const resp = isSearching
          ? await api.product.searchProducts(keyword, this.page, this.pageSize)
          : await api.product.getAllProducts(this.page, this.pageSize);

        const data = (resp as any).data;
        const list = Array.isArray(data?.products) ? data.products : [];
        const total = data?.total ?? list.length;
        this.searchMode = isSearching;
        this.currentKeyword = keyword;
        this.total = total;
        this.totalPages = data?.totalPages ?? Math.max(1, Math.ceil(total / this.pageSize));
        this.products = list;
        this.filteredProducts = [...this.products];
      } catch (error) {
        console.error('加载产品列表失败:', error);
        ElMessage.error('加载图书列表失败');
      } finally {
        this.loadingProducts = false;
      }
    },
    
    searchProducts(): void {
      const keyword = this.searchKeyword.trim();
      if (!keyword) {
        // 退出搜索模式，恢复已加载列表
        this.searchMode = false;
        this.currentKeyword = '';
        this.fetchPage(0);
        return;
      }
      // 搜索直接拉取远端数据（全量搜索，分页）
      this.fetchPage(0);
    },
    
    selectProduct(productId: number): void {
      this.selectedProductId = productId;
      
      // 更新URL参数
      this.$router.replace({
        query: { ...this.$route.query, productId }
      });
    },
    
    handleImageError(event: any): void {
      // 防止无限循环触发error事件
      event.target.onerror = null;
      // 使用占位符图片
      event.target.src = this.placeholderImg;
    }
  }
});
</script>

<style scoped>
.book-review-page {
  min-height: 100vh;
  background: #f6f7fb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #f97316, #ef4444);
  border-radius: 12px;
  color: #fff;
}

.hero-text h1 {
  margin: 4px 0 8px 0;
  font-size: 28px;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: #f3f4f6;
  font-size: 14px;
}

.eyebrow {
  letter-spacing: 2px;
  font-size: 12px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.main-grid {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 20px;
}

.panel {
  background: white;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-head h3 {
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.hint {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 12px;
}

.search-box input {
  width: 220px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 8px;
  min-height: 240px;
  grid-auto-rows: 200px;
}

.product-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.product-card.active {
  border-color: #2563eb;
  background: #eef2ff;
}

.product-image {
  margin-bottom: 8px;
  flex: 0 0 auto;
}

.product-image img {
  width: 68px;
  height: 86px;
  object-fit: cover;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-info h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-author {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  margin: 0 0 2px 0;
  color: #e74c3c;
  font-weight: bold;
  font-size: 12px;
}

.no-products {
  text-align: center;
  padding: 24px;
  color: #666;
}

.loading {
  text-align: center;
  padding: 24px;
  color: #666;
}

.review-body {
  margin-top: 12px;
}

.empty-state {
  text-align: center;
  padding: 30px 10px;
  color: #666;
}

.more-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
}

.more-link:hover {
  text-decoration: underline;
}

.selector-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-text {
  font-size: 13px;
  color: #6b7280;
}

.btn {
  padding: 10px 16px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.btn:not(:disabled):hover {
  background: #1d4ed8;
}

.cta {
  padding: 10px 14px;
  background: #fff;
  color: #ef4444;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

.cta.ghost {
  background: rgba(255,255,255,0.16);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.25);
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  .hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .main-grid {
    grid-template-columns: 1fr;
  }
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>