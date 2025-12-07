import request from '../config/request'
import { ApiResponse, CartItem } from '@/types/api'

/**
 * 购物车相关 API
 * CartItem类型定义在types/api.ts中
 */

export interface AddToCartData {
    productId: number
    quantity: number
}

export interface UpdateCartItemData {
    quantity: number
}

export interface ReceiverInfo {
    receiverName: string
    phone: string
    zipCode?: string
    address: string
    [key: string]: any
}

export interface OrderCheckoutData {
    cartItemIds: (string | number)[]
    paymentMethod: string
    receiverInfoVO: ReceiverInfo
    [key: string]: any
}

const cartApi = {
    // 添加商品到购物车
    addToCart(productId: number, quantity: number): Promise<ApiResponse<CartItem>> {
        console.log('API调用: 添加商品到购物车', { productId, quantity })
        return request.post('/cart', { productId, quantity })
    },

    // 获取购物车列表
    getCartItems(): Promise<ApiResponse<CartItem[]>> {
        return request.get('/cart')
    },

    // 更新购物车商品数量
    updateCartItemQuantity(cartItemId: number, quantity: number): Promise<ApiResponse<CartItem>> {
        return request.patch(`/cart/${cartItemId}`, { quantity })
    },

    // 删除购物车商品
    removeCartItem(cartItemId: number): Promise<ApiResponse<void>> {
        return request.delete(`/cart/${cartItemId}`)
    },

    // 结算购物车（创建订单）
    checkout(orderData: OrderCheckoutData): Promise<ApiResponse<any>> {
        return request.post('/cart/checkout', orderData)
    }
}

export default cartApi




