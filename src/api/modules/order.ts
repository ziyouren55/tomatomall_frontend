import request from '../config/request'
import { ApiResponse, Order } from '@/types/api'

/**
 * 订单相关 API
 * Order类型定义在types/api.ts中
 */

const orderApi = {
    // 获取当前用户的订单列表
    getOrders(): Promise<ApiResponse<Order[]>> {
        return request.get('/orders/my')
    },

    // 获取所有订单（管理员）
    getAllOrders(): Promise<ApiResponse<Order[]>> {
        return request.get('/orders')
    },

    // 获取订单详情
    getOrderById(orderId: number): Promise<ApiResponse<Order>> {
        return request.get(`/orders/${orderId}`)
    },

    // 发起支付
    payOrder(orderId: number): Promise<ApiResponse<{ paymentForm: string; orderId: string; paymentMethod: string; totalAmount: number }>> {
        return request.post(`/orders/${orderId}/pay`)
    }
}

export default orderApi




