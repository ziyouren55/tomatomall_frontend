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

    // 验证token有效性
    validateToken(): Promise<ApiResponse<boolean>> {
        return request.post('/accounts/validate-token')
    },

    // 登出
    logout(): Promise<ApiResponse<string>> {
        return request.post('/accounts/logout')
    },

    // 注册
    register(userData: Partial<UserInfo>): Promise<ApiResponse> {
        return request.post('/accounts', userData)
    },

    // 获取用户详情
    getUserDetails(username: string): Promise<UserDetailsResponse> {
        return request.get(`/accounts/${username}`)
    },

    // 获取当前登录用户信息
    getCurrentUser(): Promise<UserDetailsResponse> {
        return request.get('/accounts/current-user')
    },
    // 根据用户ID获取用户详情（用于通过 merchantId 获取用户名）
    getUserById(id: number): Promise<UserDetailsResponse> {
        return request.get(`/accounts/id/${id}`)
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
    // 获取某用户的学校信息（UserSchoolVO / profile）
    getUserSchool(username: string): Promise<ApiResponse<any>> {
        return request.get(`/accounts/${username}/school`)
    },
    // 获取组合 profile：{ account, school }
    getProfile(username: string): Promise<ApiResponse<any>> {
        return request.get(`/accounts/${username}/profile`)
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

