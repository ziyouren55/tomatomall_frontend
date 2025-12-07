import { createRouter, createWebHistory, Router } from 'vue-router'
import { setupRouterGuards } from './guards'
import routes from './routes'

const router: Router = createRouter({
    history: createWebHistory(),
    routes
})

// 设置路由守卫
setupRouterGuards(router)

export default router




