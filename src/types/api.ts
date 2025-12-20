import { UserRole } from '@/utils/constants'

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
    role?: UserRole
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
 * 使用新字段 discountAmount / discountPercentage / validFrom / validTo
 */
export interface Coupon {
    id: number
    name: string
    // 优惠金额 / 折扣百分比
    discountAmount?: number
    discountPercentage?: number
    description?: string
    // 有效期
    validFrom?: string
    validTo?: string
    createTime?: string
    minimumPurchase?: number
    pointsRequired?: number
    status?: number // 0: 未使用, 1: 已使用
    terms?: string[]
    [key: string]: any
}

/**
 * 用户持有的优惠券（基于后端 UserCouponVO）
 */
export interface UserCoupon {
    id: number
    userId: number
    couponId: number
    couponName?: string
    couponDescription?: string
    discountAmount?: number
    discountPercentage?: number
    minimumPurchase?: number
    pointsRequired?: number
    validFrom?: string
    validTo?: string
    isUsed?: boolean
    usedTime?: string
    orderId?: number
    createTime?: string
    isActive?: boolean
    [key: string]: any
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
 * 通用分页结果
 */
export interface PageResult<T> {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
    size: number
}

/**
 * 论坛
 */
export interface ForumInfo {
    id: number
    name: string
    bookId?: number
    description?: string
    postCount?: number
    status?: string
    bookTitle?: string
    bookCover?: string
    createTime?: string
    updateTime?: string
}

/**
 * 帖子
 */
export interface PostInfo {
    id: number
    forumId: number
    userId: number
    title: string
    content: string
    imageUrls?: string[]
    viewCount?: number
    likeCount?: number
    replyCount?: number
    isSticky?: boolean
    isEssence?: boolean
    status?: string
    lastReplyTime?: string
    createTime?: string
    updateTime?: string
    username?: string
    forumName?: string
    userAvatar?: string
    isLiked?: boolean
}

/**
 * 回复
 */
export interface ReplyInfo {
    id: number
    postId: number
    userId: number
    content: string
    parentId?: number
    likeCount?: number
    status?: string
    createTime?: string
    updateTime?: string
    username?: string
    userAvatar?: string
    childReplies?: ReplyInfo[]
    isLiked?: boolean
    parentUsername?: string
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
    cartItemId?: string | number
    id?: number
    productId: string | number
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
    role?: UserRole
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

/**
 * 优惠券表单数据（用于创建/编辑优惠券）
 */
export interface CouponFormData {
    name: string
    discountAmount?: number
    discountPercentage?: number
    minimumPurchase?: number
    validFrom: string
    validTo: string
    pointsRequired?: number
    isActive: boolean
    description: string
}

/**
 * 优惠券发放数据
 */
export interface IssueCouponData {
    userId: number
    couponId: number
    [key: string]: any
}

/**
 * 优惠券使用数据
 */
export interface ApplyCouponData {
    userCouponId?: number
    couponId: number
    orderId?: number
    [key: string]: any
}

/**
 * 优惠券释放数据
 */
export interface ReleaseCouponData {
    userCouponId: number
    orderId?: number
    [key: string]: any
}

/**
 * 购物车（包含购物车项和总计）
 */
export interface Cart {
    items: CartItem[]
    total: number
    totalAmount: number
}

/**
 * 购物车项（扩展定义，兼容不同场景）
 */
export interface CartItemExtended {
    id?: number
    cartItemId?: number | string
    productId: number | string
    quantity: number
    price?: number
    title?: string
    description?: string
    cover?: string
    [key: string]: any
}

/**
 * 收货地址
 */
export interface ShippingAddress {
    receiverName: string
    phone: string
    zipCode: string
    address: string
}

/**
 * 登录表单数据
 */
export interface LoginForm {
    username: string
    password: string
}

/**
 * 注册表单数据
 */
export interface RegisterForm {
    username: string
    password: string
    name: string
    avatar: string
    role: UserRole
    telephone: string
    email: string
    location: string
    memberLevel: number
    isMember: boolean
}

/**
 * 用户编辑表单数据
 */
export interface EditForm {
    username: string
    name: string
    avatar: string
    telephone: string
    email: string
    location: string
    password: string
    role: UserRole
}

