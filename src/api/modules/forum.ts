import request from '../config/request'
import { ApiResponse } from '@/types/api'

/**
 * 论坛相关 API
 */

export interface Forum {
    id: number
    name: string
    description?: string
    [key: string]: any
}

const forumApi = {
    // 获取所有论坛
    getAllForums(): Promise<ApiResponse<Forum[]>> {
        return request.get('/api/forums')
    },

    // 获取活跃论坛（分页）
    getActiveForums(page: number = 0, size: number = 10): Promise<ApiResponse<Forum[]>> {
        return request.get('/api/forums/active', {
            params: { page, size }
        })
    },

    // 根据ID获取论坛
    getForumById(forumId: number): Promise<ApiResponse<Forum>> {
        return request.get(`/api/forums/${forumId}`)
    }
}

export default forumApi




