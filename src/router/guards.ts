import { Router } from 'vue-router'
import { getToken } from '@/utils/storage'
import { UserRole } from '@/utils/constants'

/**
 * 设置路由守卫
 * 
 * 权限控制策略：
 * 1. 前端路由守卫：在路由层面拦截未登录用户访问需要登录的页面
 * 2. 管理员权限检查：检查用户角色是否为管理员
 * 3. 后端API拦截：后端也会验证token，返回401时前端跳转到登录页
 * 
 * 这样前后端双重验证，既保证用户体验，又保证安全性
 */
export function setupRouterGuards(router: Router): void {
    // 导航守卫：检查用户是否已登录和管理员权限
    router.beforeEach((to, _from, next) => {
        // 检查路由是否需要登录
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
        // 检查路由是否需要管理员权限
        const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
        // 检查路由是否声明了需要特定角色（如 MERCHANT）
        const requiredRoleRecord = to.matched.find(record => record.meta && record.meta.role)
        const requiredRole: string | undefined = requiredRoleRecord ? (requiredRoleRecord.meta.role as string) : undefined
        
        // 直接检查本地存储的token，不依赖store（因为store可能未初始化）
        const token = getToken()
        const isLoggedIn = !!token

        // 检查登录状态
        if (requiresAuth && !isLoggedIn) {
            // 如果需要登录但没有登录，保存当前路径并重定向到登录页
            sessionStorage.setItem('redirectPath', to.fullPath)
            next('/login')
            return
        }

        // 检查管理员权限
        if (requiresAdmin) {
            // 从 localStorage 获取用户信息或角色
            const userInfoStr = localStorage.getItem('userInfo')
            let isAdmin = false

            if (userInfoStr) {
                try {
                    const userInfo = JSON.parse(userInfoStr)
                    // 检查角色是否为管理员
                    isAdmin = userInfo.role === UserRole.ADMIN || userInfo.role === 'ADMIN'
                } catch (e) {
                    console.error('Failed to parse userInfo:', e)
                }
            }

            // 如果没有用户信息，尝试从 isAdmin flag 获取（向后兼容）
            if (!isAdmin) {
                isAdmin = localStorage.getItem('isAdmin') === 'true'
            }

            if (!isAdmin) {
                // 权限不足，重定向到首页并显示提示
                next('/')
                // 可以在这里显示一个提示消息
                console.warn('Access denied: Admin privileges required')
                return
            }
        }

        // 检查指定角色权限（例如 MERCHANT）。允许管理员访问所有商家路由。
        if (requiredRole) {
            const userInfoStr = localStorage.getItem('userInfo')
            let userRole = ''
            if (userInfoStr) {
                try {
                    const userInfo = JSON.parse(userInfoStr)
                    userRole = userInfo.role || ''
                } catch (e) {
                    console.error('Failed to parse userInfo:', e)
                }
            }

            const isAllowed = userRole === requiredRole || userRole === UserRole.ADMIN || userRole === 'ADMIN'
            if (!isAllowed) {
                next('/')
                console.warn(`Access denied: role ${requiredRole} required`)
                return
            }
        }

        next()
    })
}




