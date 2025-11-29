<template>
  <div class="warehouse-container">
    <h1>产品和库存管理</h1>

    <div class="tabs">
      <button 
        :class="{ 'active': activeTab === 'products' }" 
        @click="activeTab = 'products'"
      >
        产品管理
      </button>
      <button 
        :class="{ 'active': activeTab === 'stockpile' }" 
        @click="activeTab = 'stockpile'"
      >
        库存管理
      </button>
    </div>

    <div class="tab-content">
      <AdminProductManager v-if="activeTab === 'products'" />
      <StockpileManager v-if="activeTab === 'stockpile'" />
    </div>
  </div>
</template>

<script setup>
import AdminProductManager from '../components/AdminProductManager.vue'
import StockpileManager from '../components/StockPileManager.vue'
import { ref } from 'vue';

const activeTab = ref('products');
</script>

<style scoped>
.warehouse-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

}

h1 {
  margin-top: 40px;
  margin-bottom: 30px;
  text-align: center;

}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tabs button {
  padding: 10px 20px;
  font-size: 16px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.tabs button.active {
  font-weight: bold;
  border-bottom: 2px solid #409eff;
  color: #409eff;
}

.tab-content {
  padding: 20px 0;
}
</style>