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

    // 商家视图下的订单详情（仅返回该商家相关明细）
    getOrderForMerchant(orderId: number): Promise<ApiResponse<Order>> {
        return request.get(`/orders/merchant/${orderId}`)
    },
    // 获取商家待发货订单列表
    getPendingOrdersForMerchant(): Promise<ApiResponse<Order[]>> {
        return request.get('/orders/merchant/pending')
    },
    // 获取商家已处理订单列表（已发货/已完成）
    getProcessedOrdersForMerchant(): Promise<ApiResponse<Order[]>> {
        return request.get('/orders/merchant/processed')
    },
    // 用户确认收货
    confirmReceipt(orderId: number): Promise<ApiResponse<{ message: string }>> {
        return request.post(`/orders/${orderId}/confirmReceipt`)
    },

    // 发起支付
    payOrder(orderId: number): Promise<ApiResponse<{ paymentForm: string; orderId: string; paymentMethod: string; totalAmount: number }>> {
        return request.post(`/orders/${orderId}/pay`)
    }
    ,
    // 商家标记发货
    shipOrderForMerchant(orderId: number, body: { carrier?: string; trackingNo?: string }): Promise<ApiResponse<null>> {
        return request.post(`/orders/merchant/${orderId}/ship`, body)
    }
}

export default orderApi




