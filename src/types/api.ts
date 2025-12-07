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

/**
 * 库存信息
 */
export interface Stockpile {
    id: number
    productId: number
    productName?: string
    amount: number
    frozen: number
    [key: string]: any
}

/**
 * 购物车项（完整定义）
 */
export interface CartItem {
    cartItemId: string
    productId: string
    title: string
    price: number
    description?: string
    cover: string
    detail?: string
    quantity: number
    state: string
    [key: string]: any
}

/**
 * 订单信息（完整定义）
 */
export interface Order {
    orderId: number
    userId: number
    totalAmount: number
    paymentMethod: string
    createTime?: string
    name: string
    phone: string
    address: string
    status: string
    cartItems?: CartItem[]
    [key: string]: any
}

/**
 * 用户信息（完整定义，基于AccountVO）
 */
export interface User {
    id: number
    username: string
    name?: string
    email?: string
    telephone?: string
    avatar?: string
    role?: string
    location?: string
    memberLevelId?: number
    isMember?: boolean
    currentPoints?: number
    totalPoints?: number
    currentLevelId?: number
    levelName?: string
    [key: string]: any
}

/**
 * 错误响应类型
 */
export interface ErrorResponse {
    code?: string
    msg?: string
    message?: string
    data?: any
    [key: string]: any
}

