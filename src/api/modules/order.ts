import request from '../config/request'
import { ApiResponse } from '@/types/api'

/**
 * 订单相关 API
 */

export interface Order {
    id: number
    userId: number
    totalAmount: number
    status: string
    createTime?: string
    [key: string]: any
}

const orderApi = {
    // 获取订单列表
    getOrders(): Promise<ApiResponse<Order[]>> {
        return request.get('/orders')
    },

    // 获取订单详情
    getOrderById(orderId: number): Promise<ApiResponse<Order>> {
        return request.get(`/orders/${orderId}`)
    },

    // 发起支付
    payOrder(orderId: number): Promise<ApiResponse<any>> {
        return request.post(`/orders/${orderId}/pay`)
    }
}

export default orderApi




