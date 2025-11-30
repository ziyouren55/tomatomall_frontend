import request from '../config/request'
import { ApiResponse } from '@/types/api'

/**
 * 购物车相关 API
 */

export interface CartItem {
    id: number
    productId: number
    quantity: number
    product?: any
    [key: string]: any
}

export interface AddToCartData {
    productId: number
    quantity: number
}

export interface UpdateCartItemData {
    quantity: number
}

export interface OrderData {
    items: CartItem[]
    couponId?: number
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
    checkout(orderData: OrderData): Promise<ApiResponse<any>> {
        return request.post('/cart/checkout', orderData)
    }
}

export default cartApi

