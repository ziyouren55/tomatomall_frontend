import request from '../config/request'
import { ApiResponse, Coupon, UserCoupon, IssueCouponData, ApplyCouponData, ReleaseCouponData, IssueChatCouponData } from '@/types/api'
import type { Product } from './product'

/**
 * 优惠券相关 API
 * 包含管理员和用户两套 API
 */

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

    // 查看某个用户的优惠券（管理员视角）
    getUserCoupons(userId: number): Promise<ApiResponse<UserCoupon[]>> {
        return request.get(`/admin/coupons/user/${userId}`)
    },

    // 为用户发放优惠券
    issueCouponToUser(issueData: IssueCouponData): Promise<ApiResponse<void>> {
        return request.post('/admin/coupons/issue', issueData)
    },

    // 向全体用户发放优惠券
    issueCouponToAll(couponId: number, remark?: string): Promise<ApiResponse<void>> {
        return request.post('/admin/coupons/issue/all', { couponId, remark })
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

    // 获取单个用户优惠券详情
    getUserCouponDetail(userCouponId: number): Promise<ApiResponse<UserCoupon>> {
        return request.get(`/coupons/user/${userCouponId}`)
    },

    // 领取优惠券（无需积分）
    claimCoupon(couponId: number): Promise<ApiResponse<void>> {
        return request.post(`/coupons/claim/${couponId}`)
    },

    // 获取当前登录用户拥有的优惠券
    getUserOwnedCoupons(): Promise<ApiResponse<UserCoupon[]>> {
        return request.get('/coupons/my')
    },

    // 兑换优惠券
    exchangeCoupon(couponId: number): Promise<ApiResponse<void>> {
        return request.post(`/coupons/exchange/${couponId}`)
    },

    // 使用优惠券
    applyCoupon(applyData: ApplyCouponData): Promise<ApiResponse<void>> {
        return request.post('/coupons/apply', applyData)
    },

    // 释放优惠券
    releaseCoupon(releaseData: ReleaseCouponData): Promise<ApiResponse<void>> {
        return request.post('/coupons/release', releaseData)
    },

    // ========== 商家优惠券 API ==========
    // 获取商家管理的商品列表
    getMerchantProducts(): Promise<ApiResponse<Product[]>> {
        return request.get('/merchant/coupons/products')
    },

    // 为聊天用户发放优惠券
    issueChatCoupon(issueData: IssueChatCouponData): Promise<ApiResponse<UserCoupon>> {
        return request.post('/merchant/coupons/issue-to-chat', issueData)
    },

    // 获取商家发放的优惠券历史
    getIssuedCouponsHistory(): Promise<ApiResponse<UserCoupon[]>> {
        return request.get('/merchant/coupons/issued-history')
    }
}

export default couponApi