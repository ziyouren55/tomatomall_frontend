import { Router } from 'vue-router'
import { getToken } from '@/utils/storage'

/**
 * 设置路由守卫
 * 
 * 权限控制策略：
 * 1. 前端路由守卫：在路由层面拦截未登录用户访问需要登录的页面
 * 2. 后端API拦截：后端也会验证token，返回401时前端跳转到登录页
 * 
 * 这样前后端双重验证，既保证用户体验，又保证安全性
 */
export function setupRouterGuards(router: Router): void {
    // 导航守卫：检查用户是否已登录
    router.beforeEach((to, from, next) => {
        // 检查路由是否需要登录
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
        
        // 直接检查本地存储的token，不依赖store（因为store可能未初始化）
        const token = getToken()
        const isLoggedIn = !!token

        if (requiresAuth && !isLoggedIn) {
            // 如果需要登录但没有登录，保存当前路径并重定向到登录页
            sessionStorage.setItem('redirectPath', to.fullPath)
            next('/login')
        } else {
            next()
        }
    })
}




