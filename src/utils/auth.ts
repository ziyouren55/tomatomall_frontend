/**
 * 认证相关工具函数
 */

import { getToken } from './storage'
import { UserRole } from './constants'

/**
 * 检查用户是否已登录
 */
export const isAuthenticated = (): boolean => {
    return !!getToken()
}

/**
 * 检查用户是否为管理员
 * 优先从 userInfo 获取角色信息，否则从 isAdmin flag 获取（向后兼容）
 */
export const isAdmin = (): boolean => {
    // 优先从 userInfo 获取
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
        try {
            const userInfo = JSON.parse(userInfoStr)
            return userInfo.role === UserRole.ADMIN || userInfo.role === 'ADMIN'
        } catch (e) {
            console.error('Failed to parse userInfo:', e)
        }
    }
    
    // 向后兼容：从 isAdmin flag 获取
    return localStorage.getItem('isAdmin') === 'true'
}




