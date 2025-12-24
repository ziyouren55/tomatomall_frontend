<template>
  <div class="index-container">
    <!-- 轮播图/横幅区域（可选） -->
    <div class="banner-section">
      <div class="banner-content">
        <h1 class="banner-title">欢迎来到番茄书城</h1>
        <p class="banner-subtitle">精选好书，品质阅读</p>
      </div>
    </div>
    
    <!-- 商品列表区域 -->
    <div class="products-section">
      <div class="section-header">
        <h2 class="section-title">
          {{ searchKeyword ? '搜索结果' : (currentTab === 'hot' ? '热门商品' : '附近推荐') }}
        </h2>
      </div>

      <!-- 如果在搜索模式，隐藏切换，直接显示搜索结果 -->
      <div v-if="!searchKeyword" class="tab-bar">
        <button :class="['tab-btn', { active: currentTab === 'hot' }]" @click="switchTab('hot')">
          热门
        </button>
        <button :class="['tab-btn', { active: currentTab === 'nearby' }]" @click="switchTab('nearby')">
          附近推荐
        </button>
      </div>

      <div class="tab-content">
        <ProductList v-if="searchKeyword || currentTab === 'hot'" :searchKeyword="searchKeyword" />
        <NearbyRecommendations v-if="!searchKeyword && currentTab === 'nearby'" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ProductList from '@/components/business/product/ProductList.vue'
import NearbyRecommendations from '@/components/business/product/NearbyRecommendations.vue'

export default defineComponent({
  name: 'IndexPage',
  components: {
    ProductList,
    NearbyRecommendations
  },
  data() {
    return {
      currentTab: 'hot'
    };
  },
  computed: {
    searchKeyword(): string {
      const search = this.$route.query.search
      return typeof search === 'string' ? search : ''
    }
  },
  methods: {
    switchTab(tab: string) {
      this.currentTab = tab;
    }
  }
});
</script>

<style scoped>
.index-container {
  width: 100%;
  background-color: #f5f5f5;
}

/* 横幅区域 */
.banner-section {
  width: 100%;
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  margin-bottom: 30px;
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
}

.banner-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.banner-subtitle {
  font-size: 20px;
  margin: 0;
  opacity: 0.95;
}

/* 商品区域 */
.products-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
  padding: 0 0 12px 0;
  border-bottom: 2px solid #ff6b35;
  display: inline-block;
}

.tab-bar {
  margin: 12px 0 18px;
  display: flex;
  gap: 8px;
}
.tab-btn {
  background: white;
  border: 1px solid #eee;
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  color: #666;
}
.tab-btn.active {
  background: #ff6b35;
  color: white;
  border-color: #ff6b35;
}
</style>
