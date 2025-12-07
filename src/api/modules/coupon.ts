import request from '../config/request'
import { ApiResponse, Coupon } from '@/types/api'

/**
 * 优惠券相关 API
 * 包含管理员和用户两套 API
 */

export interface IssueCouponData {
    userId: number
    couponId: number
    [key: string]: any
}

export interface ApplyCouponData {
    couponId: number
    orderId?: number
    [key: string]: any
}

const couponApi = {
    // ========== 管理员优惠券 API ==========
    // 获取所有优惠券
    getAllCoupons(): Promise<ApiResponse<Coupon[]>> {
        return request.get('/admin/coupons')
    },

    // 根据ID获取优惠券
    getCouponById(couponId: number): Promise<ApiResponse<Coupon>> {
        return request.get(`/admin/coupons/${couponId}`)
    },

    // 创建优惠券
    createCoupon(couponData: Partial<Coupon>): Promise<ApiResponse<Coupon>> {
        return request.post('/admin/coupons', couponData)
    },

    // 更新优惠券
    updateCoupon(couponId: number, couponData: Partial<Coupon>): Promise<ApiResponse<Coupon>> {
        return request.put(`/admin/coupons/${couponId}`, couponData)
    },

    // 查看用户优惠券
    getUserCoupons(userId: number): Promise<ApiResponse<Coupon[]>> {
        return request.get(`/admin/coupons/user/${userId}`)
    },

    // 为用户发放优惠券
    issueCouponToUser(issueData: IssueCouponData): Promise<ApiResponse<void>> {
        return request.post('/admin/coupons/issue', issueData)
    },

    // ========== 用户优惠券 API ==========
    // 获取所有可兑换优惠券
    getAvailableCoupons(): Promise<ApiResponse<Coupon[]>> {
        return request.get('/coupons/available')
    },

    // 获取优惠券详情
    getCouponDetail(couponId: number): Promise<ApiResponse<Coupon>> {
        return request.get(`/coupons/${couponId}`)
    },

    // 获取用户拥有的优惠券
    getUserOwnedCoupons(): Promise<ApiResponse<Coupon[]>> {
        return request.get('/coupons/my')
    },

    // 兑换优惠券
    exchangeCoupon(couponId: number): Promise<ApiResponse<void>> {
        return request.post(`/coupons/exchange/${couponId}`)
    },

    // 使用优惠券
    applyCoupon(applyData: ApplyCouponData): Promise<ApiResponse<void>> {
        return request.post('/coupons/apply', applyData)
    }
}

export default couponApi




