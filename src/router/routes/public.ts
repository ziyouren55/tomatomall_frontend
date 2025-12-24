import { RouteRecordRaw } from 'vue-router'

/**
 * 公开路由（无需登录）
 */
const publicRoutes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/LoginPage.vue')
    },
    {
        path: '/stores/:id',
        name: 'StoreDetail',
        component: () => import('@/views/store/StoreDetailPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/users/:username',
        name: 'UserPublicProfile',
        component: () => import('@/views/user/UserPublicDetailPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterPage.vue')
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/search/SearchPage.vue'),
        meta: { requiresAuth: false } // 搜索页面不需要登录
    },
    // WebSocket相关路径处理 - 避免Vue Router拦截SockJS请求
    {
        path: '/api/ws/:pathMatch(.*)*',
        name: 'WebSocket',
        component: { render: () => null }, // 空组件，不渲染任何内容
        meta: { requiresAuth: false }
    },
    {
        path: '/ws/:pathMatch(.*)*',
        name: 'WebSocketLegacy',
        component: { render: () => null }, // 空组件，不渲染任何内容
        meta: { requiresAuth: false }
    }
]

export default publicRoutes




