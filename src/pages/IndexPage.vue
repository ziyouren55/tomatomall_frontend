<template>
  <div class="index-container">
    <div class="header-section">
      <h1>欢迎来到我们的商城</h1>
      <p>精选好物，品质保证</p>
    </div>
    <div class="action-buttons">
      <a href="/warehouse" class="action-button warehouse">进入仓库</a>
      <a href="/profile" class="action-button profile">个人中心</a>
    </div>
    <div class="products-section">
      <ProductList />
    </div>
  </div>
</template>

<script>
import ProductList from '../components/ProductList.vue'

export default {
  name: 'IndexPage',
  components: {
    ProductList
  }
}
</script>

<style scoped>
.index-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px;
  background-color: #f5f5f5;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  border-radius: 12px;
}

.header-section h1 {
  font-size: 36px;
  margin-bottom: 10px;
  font-weight: 700;
}

.header-section p {
  font-size: 18px;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.action-button {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.action-button.warehouse {
  background-color: #4CAF50;
  color: white;
}

.action-button.warehouse:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.action-button.profile {
  border: 2px solid #4CAF50;
  color: #4CAF50;
  background-color: white;
}

.action-button.profile:hover {
  background-color: #4CAF50;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.products-section {
  margin-top: 30px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
</style>