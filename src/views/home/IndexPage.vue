<template>
  <div class="index-page">
    <!-- 顶部轮播区域 -->
    <div class="carousel-section">
      <div class="carousel-container">
        <el-carousel height="400px" :interval="5000" arrow="hover">
          <el-carousel-item v-for="(banner, index) in banners" :key="index">
            <div class="carousel-item" :style="{ background: banner.gradient }">
              <div class="carousel-content">
                <h2 class="carousel-title">{{ banner.title }}</h2>
                <p class="carousel-subtitle">{{ banner.subtitle }}</p>
                <el-button
                  type="primary"
                  size="large"
                  round
                  class="carousel-btn"
                  @click="handleBannerAction(banner)"
                >
                  {{ banner.buttonText }}
                </el-button>
              </div>
              <div class="carousel-image">
                <span class="carousel-icon">{{ banner.icon }}</span>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-entry-section">
      <div class="container">
        <div class="quick-entry-grid">
          <div
            v-for="entry in quickEntries"
            :key="entry.name"
            class="quick-entry-item"
            @click="handleQuickEntry(entry.path)"
          >
            <div class="entry-icon" :style="{ background: entry.color }">
              <el-icon :size="32"><component :is="entry.icon" /></el-icon>
            </div>
            <span class="entry-name">{{ entry.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="container">
        <!-- 分类标签栏 -->
        <div class="category-tabs">
          <div class="tabs-wrapper">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="['tab-item', { active: currentTab === tab.key }]"
              @click="switchTab(tab.key)"
            >
              <el-icon><component :is="tab.icon" /></el-icon>
              <span>{{ tab.label }}</span>
            </button>
          </div>
        </div>

        <!-- 商品展示区域 -->
        <div class="products-area">
          <!-- 搜索结果提示 -->
          <div v-if="searchKeyword" class="search-result-header">
            <el-icon class="search-icon"><Search /></el-icon>
            <span class="search-text">搜索 "<strong>{{ searchKeyword }}</strong>" 的结果</span>
            <el-button text @click="clearSearch">清除搜索</el-button>
          </div>

      <div class="tab-content">
        <ProductList v-if="searchKeyword" :searchKeyword="searchKeyword" />
        <HotRecommendations v-if="!searchKeyword && currentTab === 'hot'" />
        <NearbyRecommendations v-if="!searchKeyword && currentTab === 'nearby'" />
      </div>
    </div>
  </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  ShoppingBag, ShoppingCart, User, ChatDotRound,
  TrendCharts, Location, Search, Discount, EditPen
} from '@element-plus/icons-vue'
import ProductList from '@/components/business/product/ProductList.vue'
import NearbyRecommendations from '@/components/business/product/NearbyRecommendations.vue'
import HotRecommendations from '@/components/business/product/HotRecommendations.vue'

export default defineComponent({
  name: 'IndexPage',
  components: {
    ProductList,
    NearbyRecommendations,
    HotRecommendations,
    NearbyRecommendations,
    ShoppingBag, ShoppingCart, User, ChatDotRound,
    TrendCharts, Location, Search, Discount, EditPen
  },
  data() {
    return {
      currentTab: 'hot',
      banners: [
        {
          title: '📚 欢迎来到番茄书城',
          subtitle: '精选好书，品质阅读，开启知识之旅',
          buttonText: '立即探索',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          icon: '📖'
        },
        {
          title: '🎓 学生专享优惠',
          subtitle: '完成学生认证，享受专属折扣',
          buttonText: '去认证',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          icon: '🎒'
        },
        {
          title: '🔥 热门新品上架',
          subtitle: '最新商品，第一时间抢购',
          buttonText: '查看详情',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          icon: '⭐'
        }
      ],
      quickEntries: [
        { name: '购物车', icon: 'ShoppingCart', path: '/cart', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: '个人中心', icon: 'User', path: '/profile', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { name: '我的订单', icon: 'ShoppingBag', path: '/order', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { name: '客服咨询', icon: 'ChatDotRound', path: '/chat', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { name: '优惠券', icon: 'Discount', path: '/coupon-center', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { name: '评论中心', icon: 'EditPen', path: '/bookcomment', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
      ],
      tabs: [
        { key: 'hot', label: '热门推荐', icon: 'TrendCharts' },
        { key: 'nearby', label: '附近商家', icon: 'Location' }
      ]
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
    },
    handleQuickEntry(path: string) {
      this.$router.push(path);
    },
      // 处理轮播按钮动作（例如去认证）
      handleBannerAction(banner: any) {
        if (!banner || !banner.buttonText) return;
        if (banner.buttonText === '去认证') {
          this.$router.push('/user/school-verification');
          return;
        }
        // 默认动作：如果 banner 包含 path，则跳转
        if (banner.path) {
          this.$router.push(banner.path);
        }
      },
    clearSearch() {
      this.$router.push('/');
    }
  }
});
</script>

<style scoped>
/* 页面容器 */
.index-page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 轮播区域 */
.carousel-section {
  background: white;
  padding: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.carousel-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.carousel-item {
  height: 400px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 80px;
  position: relative;
  overflow: hidden;
}

.carousel-content {
  flex: 1;
  color: white;
  z-index: 2;
}

.carousel-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  animation: slideInLeft 0.8s ease-out;
}

.carousel-subtitle {
  font-size: 20px;
  margin: 0 0 32px 0;
  opacity: 0.95;
  animation: slideInLeft 0.8s ease-out 0.2s both;
}

.carousel-btn {
  animation: slideInLeft 0.8s ease-out 0.4s both;
  font-size: 16px;
  padding: 12px 32px;
  height: auto;
}

.carousel-image {
  flex: 0 0 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.carousel-icon {
  font-size: 120px;
  animation: float 3s ease-in-out infinite;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 快捷入口 */
.quick-entry-section {
  background: white;
  padding: 32px 0;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.quick-entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
}

.quick-entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #fafafa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.quick-entry-item:hover {
  background: white;
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.entry-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s;
}

.quick-entry-item:hover .entry-icon {
  transform: scale(1.1) rotate(5deg);
}

.entry-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

/* 主内容区域 */
.main-content {
  margin-top: 20px;
  padding-bottom: 60px;
}

/* 分类标签栏 */
.category-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tabs-wrapper {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-item:hover {
  background: #e8e8e8;
  color: #333;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 商品展示区域 */
.products-area {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: 600px;
}

.search-result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f5f7ff 0%, #fff5f5 100%);
  border-radius: 8px;
  margin-bottom: 24px;
  border-left: 4px solid #667eea;
}

.search-icon {
  font-size: 20px;
  color: #667eea;
}

.search-text {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.search-text strong {
  color: #667eea;
  font-weight: 600;
}

/* 底部装饰 */
.footer-decoration {
  background: white;
  padding: 60px 0;
  margin-top: 40px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.decoration-content {
  text-align: center;
  color: #999;
}

.decoration-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.decoration-text {
  font-size: 16px;
  margin: 0;
}

/* Element Plus 样式覆盖 */
:deep(.el-carousel__indicator) {
  background-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-carousel__indicator.is-active) {
  background-color: white;
}

:deep(.el-carousel__arrow) {
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
}

:deep(.el-carousel__arrow:hover) {
  background-color: white;
}

:deep(.el-button--primary) {
  background: white;
  color: #667eea;
  border: none;
  font-weight: 600;
}

:deep(.el-button--primary:hover) {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .carousel-item {
    padding: 0 40px;
  }

  .carousel-title {
    font-size: 36px;
  }

  .carousel-subtitle {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .carousel-section {
    padding: 10px 0;
  }

  .carousel-container {
    padding: 0 10px;
  }

  .carousel-item {
    height: 300px;
    padding: 0 24px;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }

  .carousel-title {
    font-size: 28px;
  }

  .carousel-subtitle {
    font-size: 16px;
    margin-bottom: 24px;
  }

  .carousel-image {
    display: none;
  }

  .quick-entry-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .quick-entry-item {
    padding: 16px 8px;
  }

  .entry-icon {
    width: 48px;
    height: 48px;
  }

  .entry-icon :deep(.el-icon) {
    font-size: 24px;
  }

  .entry-name {
    font-size: 13px;
  }

  .tabs-wrapper {
    justify-content: center;
  }

  .tab-item {
    padding: 10px 20px;
    font-size: 14px;
  }

  .products-area {
    padding: 16px;
  }
}
</style>
