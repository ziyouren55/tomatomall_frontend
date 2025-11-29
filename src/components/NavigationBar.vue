<template>
  <div class="nav-bar-container">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/">
          <h1>番茄书城</h1>
        </router-link>
      </div>

      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          @keyup.enter="performSearch" 
          placeholder="搜索商品..."
          class="search-input"
        >
        <button @click="performSearch" class="search-button">
          <i class="search-icon">🔍</i>
        </button>
      </div>

      <el-menu
        class="nav-bar"
        mode="horizontal"
        :router="true"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <template v-if="isLoggedIn">
          <el-menu-item index="/order">订单</el-menu-item>
          <el-menu-item index="/profile">个人中心</el-menu-item>
           <el-menu-item index="/cart">购物车</el-menu-item>
           <el-menu-item index="/bookcomment">书评</el-menu-item>
          <el-menu-item @click="logout">退出</el-menu-item>
          
        </template>
        <template v-else>
          <el-menu-item index="/login">登录</el-menu-item>
          <el-menu-item index="/register">注册</el-menu-item>
          <el-menu-item index="/order">订单</el-menu-item>
          <el-menu-item index="/profile">个人中心</el-menu-item>
          <el-menu-item index="/cart">购物车</el-menu-item>
          <el-menu-item @click="logout">退出</el-menu-item>
        </template>
        <el-menu-item v-if="isAdmin" index="/warehouse">仓库管理</el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { ElMenu, ElMenuItem } from "element-plus";
import services from '../api/services';

const searchQuery = ref('');
const cartItemCount = ref(0);
const isLoggedIn = ref(false);
const isAdmin = ref(false);
let cartPollingInterval = null;

const performSearch = () => {
  if (!searchQuery.value.trim()) return;

  window.$router.push({
    path: '/',
    query: { search: searchQuery.value }
  });

  // Clear search query after search
  searchQuery.value = '';
};

const checkLoginStatus = () => {
  // Check if user is logged in based on token presence
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;

  // Check if user is admin (from local storage or other source)
  isAdmin.value = localStorage.getItem('isAdmin') === 'true';

  // Update cart count if logged in
  if (isLoggedIn.value) {
    fetchCartCount();
    startCartPolling();
  } else {
    stopCartPolling();
  }
};

const fetchCartCount = async () => {
  if (!isLoggedIn.value) return;

  try {
    const response = await services.cart.getCartItems();
    if (response && response.data) {
      cartItemCount.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('Failed to fetch cart count:', error);
    // If unauthorized, clear token and update login status
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      isLoggedIn.value = false;
    }
  }
};

const startCartPolling = () => {
  // Poll for cart updates every 30 seconds
  cartPollingInterval = setInterval(() => {
    fetchCartCount();
  }, 30000);
};

const stopCartPolling = () => {
  if (cartPollingInterval) {
    clearInterval(cartPollingInterval);
    cartPollingInterval = null;
  }
};

const logout = async () => {
  try {
    await services.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API response
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');

    // Update component state
    isLoggedIn.value = false;
    isAdmin.value = false;
    cartItemCount.value = 0;

    // Stop cart polling
    stopCartPolling();

    // Redirect to home page
    window.$router.push('/');
  }
};

onMounted(() => {
  // Check login status when component is created
  checkLoginStatus();
});

onBeforeUnmount(() => {
  // Clear interval when component is destroyed
  stopCartPolling();
});

watch(() => window.$route, () => {
  // Watch for route changes to update login status
  checkLoginStatus();
});
</script>

<style scoped>
.nav-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 40px;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 20px;
}

.navbar-brand {
  flex: 0 0 auto;
}

.navbar-brand h1 {
  margin: 0;
  font-size: 24px;
  color: #e53935;
}

.navbar-brand a {
  text-decoration: none;
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 30px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #e53935;
  box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.2);
}

.search-button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
}

.cart-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background-color: #e53935;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  margin-left: 5px;
}

.admin-link {
  color: #e53935;
  font-weight: 500;
}
</style>