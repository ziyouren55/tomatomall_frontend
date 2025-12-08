<template>
  <div class="book-review-page">
    <NavigationBar />

    <div class="container">
      <header class="hero">
        <div>
          <p class="eyebrow">书评中心</p>
          <h1>发现好书 · 分享观点</h1>
          <p class="subtitle">快速选择图书并查看对应书评</p>
        </div>
        <router-link class="cta" to="/">返回首页</router-link>
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
            <button class="btn" :disabled="!hasMore || loadingProducts" @click="() => loadMore()">
              {{ loadingProducts ? '加载中...' : hasMore ? '加载更多' : '没有更多了' }}
            </button>
            <p class="hint">已加载 {{ products.length }} 本</p>
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
      pageSize: 24,
      total: 0
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
        this.page = 0;
        this.total = 0;
        this.products = [];
        await this.loadMore(true);
      } catch (error) {
        console.error('加载产品列表失败:', error);
        ElMessage.error('加载图书列表失败');
      } finally {
        this.loadingProducts = false;
      }
    },
    
    async loadMore(reset = false): Promise<void> {
      if (reset) {
        this.page = 0;
        this.products = [];
        this.filteredProducts = [];
      }
      try {
        this.loadingProducts = true;
        const resp = await api.product.getAllProducts(this.page, this.pageSize);
        const data = (resp as any).data;
        const list = Array.isArray(data?.products) ? data.products : [];
        const total = data?.total ?? list.length;
        this.total = total;
        this.page += 1;
        this.products = reset ? list : [...this.products, ...list];
        this.filteredProducts = [...this.products];
      } catch (error) {
        console.error('加载产品列表失败:', error);
        ElMessage.error('加载图书列表失败');
      } finally {
        this.loadingProducts = false;
      }
    },

    searchProducts(): void {
      if (!this.searchKeyword.trim()) {
        this.filteredProducts = [...this.products];
        return;
      }

      const keyword = this.searchKeyword.toLowerCase();
      this.filteredProducts = this.products.filter(product => {
        const name = (product.title || product.name || '').toString().toLowerCase();
        const author = (product.author || '').toString().toLowerCase();
        return name.includes(keyword) || author.includes(keyword);
      });
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
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.page-header h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 2.5em;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 1.1em;
}

.product-selector {
  background: white;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.selector-header {
  margin-bottom: 20px;
}

.selector-header h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.selector-header p {
  margin: 0;
  color: #666;
}

.product-search {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.product-card.active {
  border-color: #007bff;
  background: #e7f3ff;
}

.product-image {
  margin-bottom: 15px;
}

.product-image img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-info h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 14px;
  font-weight: bold;
}

.product-author {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 12px;
}

.product-price {
  margin: 0;
  color: #e74c3c;
  font-weight: bold;
  font-size: 14px;
}

.no-products {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.review-section {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.selected-product-info {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.selected-product-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.selected-product-info p {
  margin: 0;
  color: #666;
}

.no-selection {
  background: white;
  border-radius: 10px;
  padding: 60px 30px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.no-selection-content h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.no-selection-content p {
  margin: 0;
  color: #666;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .product-selector,
  .review-section,
  .no-selection {
    padding: 20px;
  }
  
  .page-header {
    padding: 30px 20px;
  }
  
  .page-header h1 {
    font-size: 2em;
  }
}
</style>