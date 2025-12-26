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

// 用户角色枚举（与后端保持一致）
export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN',
    MERCHANT = 'MERCHANT'
}

// 角色显示名称映射
export const USER_ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.CUSTOMER]: '顾客',
    [UserRole.ADMIN]: '管理员',
    [UserRole.MERCHANT]: '商家'
}

// 向后兼容的常量对象
export const USER_ROLES = {
    ADMIN: UserRole.ADMIN,
    USER: UserRole.CUSTOMER,
    MERCHANT: UserRole.MERCHANT
} as const

// 角色验证工具函数
export const isValidRole = (role: string): role is UserRole => {
    return role === UserRole.CUSTOMER || role === UserRole.ADMIN || role === UserRole.MERCHANT
}

// 规范化角色（将小写转换为大写）
export const normalizeRole = (role: string): UserRole => {
    const upperRole = role.toUpperCase()
    if (upperRole === UserRole.ADMIN) {
        return UserRole.ADMIN
    }
    if (upperRole === UserRole.MERCHANT) {
        return UserRole.MERCHANT
    }
    return UserRole.CUSTOMER // 默认返回 USER
}

// 获取角色显示标签（支持字符串和枚举值）
export const getRoleLabel = (role: string | UserRole | undefined | null): string => {
    if (!role) {
        return USER_ROLE_LABELS[UserRole.CUSTOMER]
    }
    // 如果是字符串，转换为枚举值
    const roleEnum = typeof role === 'string' ? normalizeRole(role) : role
    return USER_ROLE_LABELS[roleEnum] || USER_ROLE_LABELS[UserRole.CUSTOMER]
}

// 优惠券类型枚举（与后端保持一致）
export enum CouponType {
    REPEAT = 'REPEAT',
    PRIVATE = 'PRIVATE'
}

// 优惠券类型显示名称映射
export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
    [CouponType.REPEAT]: '可重复兑换',
    [CouponType.PRIVATE]: '私人优惠券'
}

// 获取优惠券类型显示标签（大小写兼容）
export const getCouponTypeLabel = (type: string | CouponType | undefined | null): string => {
    if (!type) {
        return COUPON_TYPE_LABELS[CouponType.REPEAT]
    }

    // 统一转换为大写字符串进行比较，提高兼容性
    const typeStr = typeof type === 'string' ? type.toUpperCase() : type.toString().toUpperCase()

    // 尝试匹配枚举值
    if (typeStr === 'REPEAT') {
        return COUPON_TYPE_LABELS[CouponType.REPEAT]
    } else if (typeStr === 'PRIVATE') {
        return COUPON_TYPE_LABELS[CouponType.PRIVATE]
    }

    // 默认返回可重复兑换
    return COUPON_TYPE_LABELS[CouponType.REPEAT]
}

// 标准化优惠券类型（确保返回大写格式）
export const normalizeCouponType = (type: string | undefined | null): CouponType => {
    if (!type) {
        return CouponType.REPEAT
    }

    const upperType = type.toUpperCase()
    if (upperType === 'PRIVATE') {
        return CouponType.PRIVATE
    }

    return CouponType.REPEAT
}




