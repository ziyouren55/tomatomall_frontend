<template>
  <div class="nav-bar-container">
    <div class="navbar-wrapper">
      <div class="navbar-container">
        <!-- Logo区域 -->
        <div class="navbar-brand">
          <router-link to="/" class="brand-link">
            <span class="brand-logo">🍅</span>
            <span class="brand-text">番茄书城</span>
          </router-link>
        </div>

        <!-- 搜索框区域 -->
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            @keyup.enter="performSearch" 
            placeholder="搜索商品、店铺..."
            class="search-input"
          >
          <button @click="performSearch" class="search-button">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>

        <!-- 右侧功能区 -->
        <div class="navbar-actions">
          <!-- 未登录状态 -->
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="nav-link">登录</router-link>
            <span class="divider">|</span>
            <router-link to="/register" class="nav-link">注册</router-link>
          </template>

          <!-- 已登录状态 -->
          <template v-else>
            <!-- 用户名下拉菜单 -->
            <el-dropdown @command="handleUserCommand" trigger="hover" class="user-dropdown">
              <span class="user-info">
                <span class="username">{{ username || '用户' }}</span>
                <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <span class="menu-item">
                      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      个人中心
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item command="order">
                    <span class="menu-item">
                      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      </svg>
                      我的订单
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item command="member" v-if="isLoggedIn">
                    <span class="menu-item">
                      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                      </svg>
                      会员中心
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item command="warehouse" v-if="isAdmin" divided>
                    <span class="menu-item">
                      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                        <path d="M12 8v13M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      仓库管理
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <span class="menu-item">
                      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      退出登录
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- 购物车 -->
            <router-link to="/cart" class="cart-link">
              <div class="cart-icon-wrapper">
                <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount > 99 ? '99+' : cartItemCount }}</span>
              </div>
              <span class="cart-text">购物车</span>
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api';
import { removeToken } from '@/utils/storage';
import { UserRole } from '@/utils/constants';
import type { AxiosError } from 'axios';

const router = useRouter();
const route = useRoute();

const searchQuery = ref<string>('');
const cartItemCount = ref<number>(0);
const isLoggedIn = ref<boolean>(false);
const isAdmin = ref<boolean>(false);
const username = ref<string>('');
let cartPollingInterval: ReturnType<typeof setInterval> | null = null;

// 监听路由变化，在搜索页面时同步搜索关键词
watch(() => route.path, () => {
  if (route.path === '/search' && route.query.keyword) {
    const keyword = route.query.keyword;
    if (typeof keyword === 'string') {
      searchQuery.value = keyword;
    }
  }
}, { immediate: true });

watch(() => route.query.keyword, (newKeyword) => {
  if (route.path === '/search' && newKeyword && typeof newKeyword === 'string') {
    searchQuery.value = newKeyword;
  }
});

const performSearch = (): void => {
  if (!searchQuery.value.trim()) return;

  // 如果当前在搜索页面，则更新当前页面的搜索结果
  if (route.path === '/search') {
    router.push({
      path: '/search',
      query: { keyword: searchQuery.value.trim() }
    });
  } else {
    // 如果不在搜索页面，则在新标签页中打开搜索结果
    const keyword = encodeURIComponent(searchQuery.value.trim());
    const resolved = router.resolve({
      path: '/search',
      query: { keyword: searchQuery.value.trim() }
    });
    
    const searchUrl = `${window.location.origin}${resolved.path}?keyword=${keyword}`;
    window.open(searchUrl, '_blank');
    
    // 清空搜索框（因为是在新标签页打开）
    searchQuery.value = '';
  }
};

const checkLoginStatus = () => {
  // Check if user is logged in based on token presence
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;

  // Check if user is admin - 优先从 userInfo 获取，否则从 isAdmin flag 获取
  let adminCheck = false;
  const userInfoStr = localStorage.getItem('userInfo');
  
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      // 使用枚举检查角色
      adminCheck = userInfo.role === UserRole.ADMIN || userInfo.role === 'ADMIN';
    } catch (e) {
      console.error('Failed to parse userInfo:', e);
    }
  }
  
  // 如果没有从 userInfo 获取到，尝试从 isAdmin flag（向后兼容）
  if (!adminCheck) {
    adminCheck = localStorage.getItem('isAdmin') === 'true';
  }
  
  isAdmin.value = adminCheck;
  
  // Get username
  username.value = localStorage.getItem('username') || '';

  // Update cart count if logged in
  if (isLoggedIn.value) {
    fetchCartCount();
    startCartPolling();
  } else {
    stopCartPolling();
    username.value = '';
    isAdmin.value = false;
  }
};

const fetchCartCount = async () => {
  if (!isLoggedIn.value) return;

  try {
    const response = await api.cart.getCartItems();
    if (response && response.data) {
      // response.data是CartItem[]数组，使用数组长度
      cartItemCount.value = Array.isArray(response.data) ? response.data.length : 0;
    }
  } catch (error: unknown) {
    console.error('Failed to fetch cart count:', error);
    // If unauthorized, clear token and update login status
    const axiosError = error as AxiosError;
    if (axiosError.response && axiosError.response.status === 401) {
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

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'order':
      router.push('/order');
      break;
    case 'member':
      router.push('/member');
      break;
    case 'warehouse':
      router.push('/warehouse');
      break;
    case 'logout':
      logout();
      break;
  }
};

const logout = async () => {
  try {
    // 清除本地存储
    removeToken();
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
  } catch (error: unknown) {
    console.error('Logout error:', error);
  } finally {
    // Update component state
    isLoggedIn.value = false;
    isAdmin.value = false;
    cartItemCount.value = 0;
    username.value = '';

    // Stop cart polling
    stopCartPolling();

    // 如果当前在需要登录的页面，跳转到首页
    if (route.meta.requiresAuth) {
      router.push('/');
    } else {
      // 否则刷新当前页面状态
      checkLoginStatus();
    }
  }
};

onMounted(() => {
  // Check login status when component is created
  checkLoginStatus();
  
  // 监听登录状态变化事件
  window.addEventListener('loginStatusChanged', checkLoginStatus);
});

onBeforeUnmount(() => {
  // Clear interval when component is destroyed
  stopCartPolling();
  
  // 移除事件监听
  window.removeEventListener('loginStatusChanged', checkLoginStatus);
});

watch(() => route.path, () => {
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
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-wrapper {
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  padding: 0;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px;
  height: 64px;
}

/* Logo区域 */
.navbar-brand {
  flex: 0 0 auto;
  margin-right: 40px;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
  font-weight: 700;
  font-size: 24px;
  transition: opacity 0.3s;
}

.brand-link:hover {
  opacity: 0.9;
}

.brand-logo {
  font-size: 28px;
  margin-right: 8px;
}

.brand-text {
  color: #fff;
}

/* 搜索框区域 */
.search-container {
  flex: 1;
  max-width: 600px;
  position: relative;
  margin-right: 40px;
}

.search-input {
  width: 100%;
  padding: 10px 50px 10px 20px;
  border: 2px solid transparent;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  background-color: #fff;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-input:focus {
  border-color: #ff6b35;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.search-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #ff6b35;
  border: none;
  border-radius: 20px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.search-button:hover {
  background: #e53935;
}

.search-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  color: #fff;
}

/* 右侧功能区 */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 0 0 auto;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.divider {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

/* 用户下拉菜单 */
.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  width: 14px;
  height: 14px;
  stroke-width: 2;
  transition: transform 0.3s;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* 购物车 */
.cart-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
  position: relative;
}

.cart-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.cart-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.cart-icon {
  width: 22px;
  height: 22px;
  stroke-width: 2;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background-color: #ff4444;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.cart-text {
  font-size: 14px;
}

/* Element Plus 下拉菜单样式覆盖 */
:deep(.el-dropdown-menu__item) {
  padding: 10px 16px;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f5f5;
}
</style>