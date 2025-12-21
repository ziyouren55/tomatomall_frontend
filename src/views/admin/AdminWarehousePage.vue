<template>
  <div class="warehouse-page">
    <div class="warehouse-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="8" width="18" height="4" rx="1"></rect>
              <path d="M12 8v13M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"></path>
            </svg>
            <h1>仓库管理</h1>
          </div>
          <p class="header-subtitle">管理产品和库存信息</p>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            :class="{ 'active': activeTab === 'products' }"
            @click="activeTab = 'products'"
            class="tab-button"
          >
            <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
            </svg>
            <span>产品管理</span>
          </button>
          <button
            :class="{ 'active': activeTab === 'stockpile' }"
            @click="activeTab = 'stockpile'"
            class="tab-button"
          >
            <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>库存管理</span>
          </button>
        </div>
      </div>

      <!-- 标签页内容 -->
      <div class="tab-content">
        <div class="content-card">
          <AdminProductManager v-if="activeTab === 'products'" />
          <AdminStockpileManager v-if="activeTab === 'stockpile'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminProductManager from '@/components/business/admin/product/AdminProductManager.vue'
import AdminStockpileManager from '@/components/business/admin/stockpile/AdminStockPileManager.vue'
import { ref } from 'vue';

const activeTab = ref<string>('products');
</script>

<style scoped>
.warehouse-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-top: 80px; /* 为固定导航栏留出空间 */
  padding-bottom: 40px;
}

.warehouse-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
  color: white;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 40px;
  height: 40px;
  stroke-width: 2;
}

.page-header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.header-subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.95;
  color: rgba(255, 255, 255, 0.95);
}

/* 标签页容器 */
.tabs-container {
  background: white;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #666;
  position: relative;
}

.tab-button:hover {
  background: #f5f5f5;
  color: #333;
}

.tab-button.active {
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.tab-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.tab-button.active .tab-icon {
  animation: iconPulse 0.3s ease;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 内容区域 */
.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 500px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .warehouse-container {
    padding: 0 16px;
  }

  .page-header {
    padding: 24px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-button {
    width: 100%;
  }
}
</style>
