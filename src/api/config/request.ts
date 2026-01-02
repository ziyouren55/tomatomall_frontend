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
        
        // 如果是FormData，让浏览器自动设置Content-Type（包括boundary）
        // 如果手动设置了Content-Type，则使用设置的（但不要包含boundary）
        if (config.data instanceof FormData) {
            // 如果headers中没有明确设置Content-Type，删除默认的，让axios自动处理
            if (config.headers['Content-Type'] === 'application/json') {
                delete config.headers['Content-Type']
            }
        }
        
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

/**
 * 响应拦截器 - 处理常见错误
 * 
 * 后端API拦截策略：
 * 1. 后端验证token，如果无效或缺失，返回401
 * 2. 前端收到401后，根据请求类型决定是否跳转登录页
 * 3. 公开接口（如商品列表）的401错误不跳转，让组件自己处理
 * 4. 需要登录的接口（如购物车、订单）的401错误才跳转登录页
 */
request.interceptors.response.use(
    (response: AxiosResponse<any>): any => {
        // 保持向后兼容，直接返回包装后的数据
        return response.data as ApiResponse
    },
    (error: AxiosError) => {
        if (error.response) {
            // 处理401未授权的情况（后端拦截未登录请求）
            if (error.response.status === 401) {
                const requestUrl = error.config?.url || ''
                
                // 公开接口（商品列表、图片上传等）的401错误不跳转登录页
                // 让组件自己处理错误，这样未登录用户也能看到商品列表和上传图片（注册时上传头像）
                const publicEndpoints = ['/products', '/advertisements', '/images']
                const isPublicEndpoint = publicEndpoints.some(endpoint => 
                    requestUrl.includes(endpoint) && !requestUrl.includes('/cart') && !requestUrl.includes('/orders')
                )
                
                // 如果是公开接口，不跳转登录页，直接返回错误让组件处理
                if (isPublicEndpoint) {
                    console.warn('公开接口返回401，但不跳转登录页:', requestUrl)
                    return Promise.reject(error)
                }
                
                // 需要登录的接口才跳转登录页
                // 清除本地存储的token
                removeToken()
                localStorage.removeItem('isAdmin')
                localStorage.removeItem('username')
                
                // 如果当前不在登录页，保存当前路径以便登录后返回
                const currentPath = router.currentRoute.value.fullPath
                if (currentPath !== '/login' && currentPath !== '/register') {
                    sessionStorage.setItem('redirectPath', currentPath)
                }
                
                // 重定向到登录页
                router.push('/login')
            }
            console.error('API Error:', error.response.data)
        }
        return Promise.reject(error)
    }
)

export default request

