import request from '../config/request'
import { LoginResponse, UserDetailsResponse, UserInfo, ApiResponse, SchoolVerification, SchoolVerificationRequest } from '@/types/api'

/**
 * 用户相关 API
 */
export default {
    // 登录
    login(username: string, password: string): Promise<LoginResponse> {
        return request.post('/accounts/login', { username, password })
    },

    // 注册
    register(userData: Partial<UserInfo>): Promise<ApiResponse> {
        return request.post('/accounts', userData)
    },

    // 获取用户详情
    getUserDetails(username: string): Promise<UserDetailsResponse> {
        return request.get(`/accounts/${username}`)
    },

    // 更新用户信息
    updateUserInfo(userData: Partial<UserInfo>): Promise<ApiResponse> {
        return request.put('/accounts', userData)
    }
,
    // 提交学校认证（当前登录用户）
    submitSchoolVerification(payload: SchoolVerificationRequest): Promise<ApiResponse<SchoolVerification>> {
        return request.post('/accounts/school-verification', payload)
    },

    // 获取某用户的学校认证状态
    getSchoolVerification(username: string): Promise<ApiResponse<SchoolVerification | null>> {
        return request.get(`/accounts/${username}/school-verification`)
    }
,
    // ========== 管理员接口 ==========
    adminListSchoolVerifications(status?: string): Promise<ApiResponse<SchoolVerification[]>> {
        const url = status ? `/admin/school-verifications?status=${encodeURIComponent(status)}` : '/admin/school-verifications'
        return request.get(url)
    },

    adminApproveSchoolVerification(id: number): Promise<ApiResponse<SchoolVerification>> {
        return request.post(`/admin/school-verifications/${id}/approve`)
    },

    adminRejectSchoolVerification(id: number, reason?: string): Promise<ApiResponse<SchoolVerification>> {
        return request.post(`/admin/school-verifications/${id}/reject`, { reason })
    }
}

