/**
 * 认证相关工具函数
 */

import { getToken } from './storage'

/**
 * 检查用户是否已登录
 */
export const isAuthenticated = (): boolean => {
    return !!getToken()
}

/**
 * 检查用户是否为管理员
 */
export const isAdmin = (): boolean => {
    return localStorage.getItem('isAdmin') === 'true'
}

