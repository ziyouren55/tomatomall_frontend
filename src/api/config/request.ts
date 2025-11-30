import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import router from '@/router'
import { getToken, removeToken } from '@/utils/storage'
import { ApiResponse } from '@/types/api'

/**
 * 创建 axios 实例
 */
const request: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

/**
 * 请求拦截器 - 添加 token
 */
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken()
        if (token && config.headers) {
            config.headers.token = token
        }
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

/**
 * 响应拦截器 - 处理常见错误
 */
request.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        // 直接返回 response.data，因为后端已经包装了数据结构
        return response.data
    },
    (error: AxiosError) => {
        if (error.response) {
            // 处理401未授权的情况
            if (error.response.status === 401) {
                // 清除本地存储的token
                removeToken()
                // 重定向到登录页
                router.push('/login')
            }
            console.error('API Error:', error.response.data)
        }
        return Promise.reject(error)
    }
)

export default request

