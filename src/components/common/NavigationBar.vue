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
          <el-menu-item index="/cart">
            购物车
            <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
          </el-menu-item>
          <el-menu-item index="/bookcomment">书评</el-menu-item>
          <el-menu-item @click="logout">退出</el-menu-item>
        </template>
        <template v-else>
          <el-menu-item index="/login">登录</el-menu-item>
          <el-menu-item index="/register">注册</el-menu-item>
        </template>
        <el-menu-item v-if="isAdmin" index="/warehouse">仓库管理</el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMenu, ElMenuItem } from 'element-plus'
import api from '@/api'

const router = useRouter()
const route = useRoute()
const store = useStore()

const searchQuery = ref<string>('')
let cartPollingInterval: ReturnType<typeof setInterval> | null = null

// 从 store 获取状态
const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])
const isAdmin = computed(() => store.getters['user/isAdmin'])
const cartItemCount = computed(() => store.getters['cart/cartItemCount'])

const performSearch = (): void => {
  if (!searchQuery.value.trim()) return

  router.push({
    path: '/',
    query: { search: searchQuery.value }
  })

  // Clear search query after search
  searchQuery.value = ''
}

const fetchCartCount = async (): Promise<void> => {
  if (!isLoggedIn.value) return

  try {
    await store.dispatch('cart/fetchCartItems')
  } catch (error) {
    console.error('Failed to fetch cart count:', error)
  }
}

const startCartPolling = (): void => {
  // Poll for cart updates every 30 seconds
  cartPollingInterval = setInterval(() => {
    fetchCartCount()
  }, 30000)
}

const stopCartPolling = (): void => {
  if (cartPollingInterval) {
    clearInterval(cartPollingInterval)
    cartPollingInterval = null
  }
}

const logout = async (): Promise<void> => {
  try {
    // 调用 store 的 logout action
    await store.dispatch('user/logout')
    // 停止购物车轮询
    stopCartPolling()
    // 重定向到首页
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
    // 即使出错也执行清理
    await store.dispatch('user/logout')
    stopCartPolling()
    router.push('/')
  }
}

onMounted(() => {
  // 如果已登录，获取购物车信息并开始轮询
  if (isLoggedIn.value) {
    fetchCartCount()
    startCartPolling()
  }
})

onBeforeUnmount(() => {
  // 清除定时器
  stopCartPolling()
})

watch(() => route.path, () => {
  // 路由变化时，如果已登录，更新购物车信息
  if (isLoggedIn.value) {
    fetchCartCount()
  }
})
</script>

<style scoped>
.nav-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  height: 100%;
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
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background-color: #e53935;
  color: white;
  border-radius: 9px;
  font-size: 12px;
  margin-left: 5px;
}

.admin-link {
  color: #e53935;
  font-weight: 500;
}
</style>

