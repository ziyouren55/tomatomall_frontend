/**
 * 常量定义
 */

// API 相关
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// 应用配置
export const APP_TITLE: string = import.meta.env.VITE_APP_TITLE || '番茄书城'

// 存储键名
export const STORAGE_KEYS = {
    TOKEN: 'token',
    ADMIN: 'isAdmin',
    USER_INFO: 'userInfo'
} as const

// 路由名称
export const ROUTE_NAMES = {
    HOME: 'Home',
    LOGIN: 'Login',
    REGISTER: 'Register',
    PROFILE: 'Profile',
    CART: 'Cart',
    ORDER: 'Order',
    PRODUCT_DETAIL: 'productdetail'
} as const

// 用户角色
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER'
} as const




