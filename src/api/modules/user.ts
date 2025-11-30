import request from '../config/request'
import { LoginResponse, UserDetailsResponse, UserInfo, ApiResponse } from '@/types/api'

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
}

