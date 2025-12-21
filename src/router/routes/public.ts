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
        component: () => import('@/views/store/StoreDetail.vue'),
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
    }
]

export default publicRoutes




