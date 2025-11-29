<template>
  <div class="book-review-page">
    <NavigationBar />
    
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>书评中心</h1>
        <p class="subtitle">分享您的阅读感悟，发现优质书评</p>
      </div>
      
      <!-- 产品选择器 -->
      <div class="product-selector">
        <div class="selector-header">
          <h3>选择图书</h3>
          <p>选择您要查看或发布书评的图书</p>
        </div>
        
        <div class="product-search">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索图书名称..."
            @input="searchProducts"
            class="search-input"
          />
        </div>
        
        <div class="products-grid">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="product-card"
            :class="{ active: selectedProductId === product.id }"
            @click="selectProduct(product.id)"
          >
            <div class="product-image">
              <img 
                :src="product.imageUrl || '/api/placeholder/100/120'" 
                :alt="product.name"
                @error="handleImageError"
              />
            </div>
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <p class="product-author">{{ product.author || '未知作者' }}</p>
              <p class="product-price">¥{{ product.price }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="filteredProducts.length === 0 && !loadingProducts" class="no-products">
          暂无图书数据
        </div>
        
        <div v-if="loadingProducts" class="loading">
          正在加载图书列表...
        </div>
      </div>
      
      <!-- 书评区域 -->
      <div v-if="selectedProductId" class="review-section">
        <div class="selected-product-info">
          <h3>《{{ selectedProduct?.name }}》的书评</h3>
          <p v-if="selectedProduct?.author">作者：{{ selectedProduct.author }}</p>
        </div>
        
        <BookReviewList :product-id="selectedProductId" :key="selectedProductId" />
      </div>
      
      <div v-else class="no-selection">
        <div class="no-selection-content">
          <h3>请选择图书</h3>
          <p>选择一本图书来查看或发布书评</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavigationBar from '@/components/NavigationBar.vue';
import BookReviewList from '@/components/BookCommentList.vue';
import { ProductService } from '@/api/services';
import logoUrl from '@/assets/logo.svg';

export default {
  name: 'BookReviewPage',
  components: {
    NavigationBar,
    BookReviewList
  },
  data() {
    return {
      products: [],
      filteredProducts: [],
      selectedProductId: null,
      searchKeyword: '',
      loadingProducts: false,
      logoUrl: logoUrl
    };
  },
  computed: {
    selectedProduct() {
      return this.products.find(p => p.id === this.selectedProductId);
    }
  },
  mounted() {
    this.loadProducts();
    
    // 从路由参数中获取预选的产品ID
    if (this.$route.query.productId) {
      this.selectedProductId = parseInt(this.$route.query.productId);
    }
  },
  methods: {
    async loadProducts() {
      this.loadingProducts = true;
      try {
        const response = await ProductService.getAllProducts();
        this.products = response.data || [];
        this.filteredProducts = [...this.products];
      } catch (error) {
        console.error('加载产品列表失败:', error);
        this.$message?.error('加载图书列表失败');
      } finally {
        this.loadingProducts = false;
      }
    },
    
    searchProducts() {
      if (!this.searchKeyword.trim()) {
        this.filteredProducts = [...this.products];
        return;
      }
      
      const keyword = this.searchKeyword.toLowerCase();
      this.filteredProducts = this.products.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        (product.author && product.author.toLowerCase().includes(keyword))
      );
    },
    
    selectProduct(productId) {
      this.selectedProductId = productId;
      
      // 更新URL参数
      this.$router.replace({
        query: { ...this.$route.query, productId }
      });
    },
    
    handleImageError(event) {
      // 防止无限循环触发error事件
      event.target.onerror = null;
      // 使用本地logo.svg作为替代图片
      event.target.src = this.logoUrl;
    }
  }
};
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