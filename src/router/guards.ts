import { Router } from 'vue-router'
import store from '@/store'

/**
 * 设置路由守卫
 */
export function setupRouterGuards(router: Router): void {
    // 导航守卫：检查用户是否已登录
    router.beforeEach((to, from, next) => {
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
        const isLoggedIn = store.getters['user/isLoggedIn']

        if (requiresAuth && !isLoggedIn) {
            // 如果需要登录但没有登录，重定向到登录页
            next('/login')
        } else {
            next()
        }
    })
}

