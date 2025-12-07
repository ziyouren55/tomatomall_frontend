import request from '../config/request'
import { ApiResponse } from '@/types/api'

/**
 * 书评相关 API
 * 对应后端 BookCommentController
 */

export interface BookCommentData {
    commentText: string
    name: string
}

export interface BookComment {
    id: number
    productId: number
    commentText: string
    name: string
}

const reviewApi = {
    // 发布书评
    addBookComment(productId: number, commentData: BookCommentData): Promise<ApiResponse<string>> {
        return request.post(`/bookComment/${productId}`, commentData)
    },

    // 获取指定产品的书评列表（后端返回Set，前端接收为数组）
    getBookComments(productId: number): Promise<ApiResponse<BookComment[]>> {
        return request.get(`/bookComment/${productId}`)
    },

    // 删除书评
    deleteBookComment(commentId: number): Promise<ApiResponse<string>> {
        return request.delete(`/bookComment/${commentId}`)
    }
}

export default reviewApi




