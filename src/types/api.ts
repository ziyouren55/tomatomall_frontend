/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
    code: string
    msg?: string
    data: T
}

/**
 * 登录响应
 */
export interface LoginResponse {
    code: string
    msg?: string
    data: string // token 字符串
}

/**
 * 用户信息
 */
export interface UserInfo {
    id?: number
    username: string
    email?: string
    role?: 'ADMIN' | 'USER'
    [key: string]: any
}

/**
 * 用户详情响应
 */
export interface UserDetailsResponse {
    code: string
    msg?: string
    data: UserInfo
}

/**
 * 优惠券
 */
export interface Coupon {
    id: number
    name: string
    discount: number
    description?: string
    expiryDate?: string
    createTime?: string
    pointsRequired?: number
    status?: number // 0: 未使用, 1: 已使用
    terms?: string[]
}

/**
 * 广告数据
 */
export interface Advertisement {
    id: number
    title: string
    content: string
    image_url?: string
    imageUrl?: string
    product_id?: number | string
    productId?: number | string
    [key: string]: any
}

/**
 * 创建/更新广告的数据
 */
export interface AdvertisementFormData {
    id?: number
    title: string
    content: string
    image_url: string
    product_id: number | string
}

