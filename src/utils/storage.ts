/**
 * 本地存储工具函数
 */

const TOKEN_KEY = 'token'
const ADMIN_KEY = 'isAdmin'

/**
 * 获取 token
 */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)

/**
 * 设置 token
 */
export const setToken = (token: string | null): void => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token)
    } else {
        localStorage.removeItem(TOKEN_KEY)
    }
}

/**
 * 移除 token
 */
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY)

/**
 * 获取管理员标识
 */
export const getAdminFlag = (): boolean => localStorage.getItem(ADMIN_KEY) === 'true'

/**
 * 设置管理员标识
 */
export const setAdminFlag = (isAdmin: boolean): void => {
    localStorage.setItem(ADMIN_KEY, String(isAdmin))
}

/**
 * 移除管理员标识
 */
export const removeAdminFlag = (): void => localStorage.removeItem(ADMIN_KEY)

/**
 * 清除所有认证信息
 */
export const clearAuth = (): void => {
    removeToken()
    removeAdminFlag()
}

