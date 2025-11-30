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
        path: '/register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterPage.vue')
    }
]

export default publicRoutes

