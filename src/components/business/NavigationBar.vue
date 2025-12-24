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
          <!-- 论坛入口，所有人可见 -->
          <router-link to="/forums" class="nav-link desktop-link">论坛</router-link>

          <!-- 未登录状态 -->
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="nav-link">登录</router-link>
            <span class="divider">|</span>
            <router-link to="/register" class="nav-link">注册</router-link>
          </template>

          <!-- 已登录状态 -->
          <template v-else>
            <!-- 聊天入口 -->
            <router-link to="/chat" class="nav-link chat-link" :class="{ 'has-unread': chatUnreadCount > 0 }">
              <el-icon><ChatDotRound /></el-icon>
              <span v-if="chatUnreadCount > 0" class="unread-badge">{{ chatUnreadCount }}</span>
            </router-link>

            <router-link to="/bookcomment" class="nav-link desktop-link">书评</router-link>
            <router-link to="/coupon-center" class="nav-link desktop-link">领券中心</router-link>
            <!-- 用户名下拉菜单 -->
            <el-dropdown @command="handleUserCommand" trigger="hover" class="user-dropdown">
              <span class="user-info">
                <img 
                  v-if="userAvatar" 
                  :src="userAvatar" 
                  alt="用户头像" 
                  class="user-avatar"
                />
                <span class="username">{{ username || '用户' }}</span>
                <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
              <template #dropdown>
            <el-dropdown-menu>
                <!-- 管理员看到的是 管理店铺，商家看到的是 我的店铺 -->
                <el-dropdown-item command="admin-stores" v-if="isAdmin">
                  <span class="menu-item">
                    <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
                      <path d="M7 7v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    管理店铺
                  </span>
                </el-dropdown-item>
                <el-dropdown-item command="merchant-stores" v-else-if="isMerchant">
                  <span class="menu-item">
                    <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
                      <path d="M7 7v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    我的店铺
                  </span>
                </el-dropdown-item>
                <el-dropdown-item command="merchant-warehouse" v-if="isMerchant">
                  <span class="menu-item">
                    <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                      <path d="M12 8v13M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    我的仓库
                  </span>
                </el-dropdown-item>
                  <el-dropdown-item command="profile">
                    <span class="menu-item">
                      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      个人中心
                    </span>
                  </el-dropdown-item>
                <el-dropdown-item command="merchant-orders" v-if="isMerchant">
                  <span class="menu-item">
                    <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
                      <path d="M7 7v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    订单管理
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
                  <el-dropdown-item command="my-coupons">
                    <span class="menu-item">
                      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="9"></circle>
                        <path d="M9 12h6M9 16h6M9 8h6"></path>
                      </svg>
                      我的优惠券
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
                  <el-dropdown-item command="admin-coupons" v-if="isAdmin">
                    <span class="menu-item">
                      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="5" width="18" height="6" rx="1"></rect>
                        <path d="M5 11v8h14v-8"></path>
                        <path d="M9 15h6"></path>
                      </svg>
                      优惠券管理
                    </span>
                  </el-dropdown-item>
                <el-dropdown-item command="admin-school-verifications" v-if="isAdmin">
                  <span class="menu-item">
                    <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
                      <path d="M7 7v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    学校认证审核
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

            <!-- 消息 -->
            <router-link to="/notifications" class="nav-link">
              <div class="cart-icon-wrapper">
                <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12.5a1 1 0 0 1-1 1H6l-3 4V6h18z"></path>
                </svg>
                <span v-if="unreadCount > 0" class="cart-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
              </div>
              <span class="cart-text">消息</span>
            </router-link>
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
import { ChatDotRound } from '@element-plus/icons-vue';
import api from '@/api';
import chatApi from '@/api/modules/chat';
import { removeToken } from '@/utils/storage';
import { UserRole } from '@/utils/constants';
import type { AxiosError } from 'axios';

const router = useRouter();
const route = useRoute();

const searchQuery = ref<string>('');
const cartItemCount = ref<number>(0);
const isLoggedIn = ref<boolean>(false);
const isAdmin = ref<boolean>(false);
const isMerchant = ref<boolean>(false);
const username = ref<string>('');
const userAvatar = ref<string>('');
const unreadCount = ref<number>(0);
const chatUnreadCount = ref<number>(0);
let cartPollingInterval: ReturnType<typeof setInterval> | null = null;
let chatPollingInterval: ReturnType<typeof setInterval> | null = null;

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
      // merchant check
      isMerchant.value = userInfo.role === UserRole.MERCHANT || userInfo.role === 'MERCHANT';
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
  
  // Get user avatar from userInfo
  userAvatar.value = '';
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo.avatar) {
        userAvatar.value = userInfo.avatar;
      }
    } catch (e) {
      // Already handled above
    }
  }

  // Update cart count and chat unread count if logged in
  if (isLoggedIn.value) {
    fetchCartCount();
    fetchChatUnreadCount();
    startCartPolling();
    startChatPolling();
  } else {
    stopCartPolling();
    stopChatPolling();
    chatUnreadCount.value = 0;
    username.value = '';
    userAvatar.value = '';
    isAdmin.value = false;
    isMerchant.value = false;
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

const fetchUnreadCount = async () => {
  if (!isLoggedIn.value) {
    unreadCount.value = 0;
    return;
  }
  try {
    const res = await api.notification.unreadCount();
    if (res && res.data) {
      // support different shapes: either {unreadCount} or raw number
      const v = res.data.unreadCount ?? res.data ?? 0;
      unreadCount.value = typeof v === 'number' ? v : Number(v) || 0;
    }
  } catch (e) {
    console.warn('Failed to fetch unread count', e);
  }
}

const fetchChatUnreadCount = async () => {
  if (!isLoggedIn.value) {
    chatUnreadCount.value = 0;
    return;
  }
  try {
    const res = await chatApi.getUnreadCount();
    if (res && res.code === '200') {
      chatUnreadCount.value = res.data || 0;
    }
  } catch (e) {
    console.warn('Failed to fetch chat unread count', e);
    chatUnreadCount.value = 0;
  }
}

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

const startChatPolling = () => {
  // Poll for chat unread count every 10 seconds
  chatPollingInterval = setInterval(() => {
    fetchChatUnreadCount();
  }, 10000);
};

const stopChatPolling = () => {
  if (chatPollingInterval) {
    clearInterval(chatPollingInterval);
    chatPollingInterval = null;
  }
};

const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'order':
      router.push('/order');
      break;
    case 'coupon-center':
      router.push('/coupon-center');
      break;
    case 'my-coupons':
      router.push('/my-coupons');
      break;
    case 'bookcomment':
      router.push('/bookcomment');
      break;
    case 'member':
      router.push('/member');
      break;
    case 'warehouse':
      router.push('/warehouse');
      break;
    case 'admin-coupons':
      router.push('/admin/coupons');
      break;
    case 'admin-school-verifications':
      router.push('/admin/school-verifications');
      break;
    case 'admin-stores':
      router.push('/admin/stores');
      break;
    case 'merchant-stores':
      router.push('/merchant/stores');
      break;
    case 'merchant-orders':
      router.push('/merchant/pending-shipments');
      break;
    case 'merchant-warehouse':
      {
        try {
          const res = await api.store.getMerchantStores(0, 1)
          let firstStore: any = null
          if (res && res.data) {
            if (Array.isArray(res.data)) firstStore = res.data[0]
            else if (Array.isArray(res.data.content) && res.data.content.length) firstStore = res.data.content[0]
            else if (Array.isArray(res.data.data) && res.data.data.length) firstStore = res.data.data[0]
            else firstStore = res.data[0] || null
          }

          if (firstStore && firstStore.id) {
            router.push(`/merchant/stores/${firstStore.id}/warehouse`)
          } else {
            // fallback to store list so user can pick/create a store
            router.push('/merchant/stores')
          }
        } catch (e) {
          console.error('Failed to open merchant warehouse:', e)
          router.push('/merchant/stores')
        }
      }
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
    userAvatar.value = '';

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
  window.addEventListener('loginStatusChanged', fetchUnreadCount);
  // listen for notification changes; if event has delta, apply optimistically, else fetch latest
  window.addEventListener('notificationChanged', (e: Event) => {
    try {
      const ce = e as CustomEvent
      const d = ce.detail && typeof ce.detail.delta === 'number' ? ce.detail.delta : null
      if (d !== null) {
        unreadCount.value = Math.max(0, unreadCount.value + d)
      } else {
        fetchUnreadCount()
      }
    } catch (err) {
      fetchUnreadCount()
    }
  });
});

onBeforeUnmount(() => {
  // Clear intervals when component is destroyed
  stopCartPolling();
  stopChatPolling();

  // 移除事件监听
  window.removeEventListener('loginStatusChanged', checkLoginStatus);
  window.removeEventListener('loginStatusChanged', fetchUnreadCount);
  window.removeEventListener('notificationChanged', fetchUnreadCount);
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

.desktop-link {
  font-weight: 600;
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
  gap: 8px;
  color: #fff;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.username {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
  padding-top: 2px;
  padding-bottom: 2px;
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

/* 聊天链接样式 */
.chat-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: transparent;
  color: #666;
  transition: all 0.3s ease;
  margin-right: 8px;
}

.chat-link:hover {
  background-color: #f5f5f5;
  color: #333;
}

.chat-link.has-unread {
  color: #409eff;
}

.chat-link .el-icon {
  font-size: 20px;
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: #ff4444;
  color: white;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Element Plus 下拉菜单样式覆盖 */
:deep(.el-dropdown-menu__item) {
  padding: 10px 16px;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f5f5;
}
</style>