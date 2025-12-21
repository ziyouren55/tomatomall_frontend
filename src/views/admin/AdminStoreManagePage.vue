<template>
  <div class="admin-store-page">
    <div class="warehouse-container">
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
              <path d="M7 7v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
            </svg>
            <h1>店铺管理</h1>
          </div>
          <p class="header-subtitle">在此管理所有平台店铺 — 创建、编辑或删除</p>
        </div>
      </div>

      <div class="tabs-container">
        <div class="tabs">
          <button class="tab-button active">店铺列表</button>
        </div>
      </div>

      <div class="tab-content">
        <div class="content-card">
          <AdminStoreManager />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminStoreManager from '@/components/business/admin/store/AdminStoreManager.vue'
</script>

<style scoped>
.warehouse-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(229, 83, 54, 0.15);
}
.header-title {
  display: flex;
  gap: 16px;
  align-items: center;
}
.header-icon {
  width: 44px;
  height: 44px;
  stroke-width: 2;
}
.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
}
.header-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.95rem;
  opacity: 0.95;
}
.header-actions .primary-btn {
  padding: 10px 18px;
  background: white;
  color: #ff6b35;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.12);
}
.tabs-container {
  margin-bottom: 12px;
}
.tabs {
  display: flex;
}
.tab-button {
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  background: #fff;
  color: #333;
  font-weight: 600;
}
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  padding: 18px;
  min-height: 200px;
}
</style>


