/**
 * 路由配置
 * 统一管理所有路由
 */
import publicRoutes from './public'
import userRoutes from './user'
import adminRoutes from './admin'

const routes = [
    ...publicRoutes,
    ...userRoutes,
    ...adminRoutes
]

export default routes

