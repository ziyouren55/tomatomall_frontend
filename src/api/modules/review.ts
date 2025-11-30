import request from '../config/request'
import { ApiResponse } from '@/types/api'

/**
 * 书评相关 API
 */

export interface CommentData {
    content: string
    rating?: number
    [key: string]: any
}

export interface BookComment {
    id: number
    productId: number
    userId: number
    content: string
    rating?: number
    createTime?: string
    [key: string]: any
}

const reviewApi = {
    // 发布书评/评论
    addBookComment(productId: number, commentData: CommentData): Promise<ApiResponse<BookComment>> {
        return request.post(`/bookComment/${productId}`, commentData)
    },

    // 获取指定产品的书评列表
    getBookComments(productId: number): Promise<ApiResponse<BookComment[]>> {
        return request.get(`/bookComment/${productId}`)
    },

    // 删除书评
    deleteBookComment(commentId: number): Promise<ApiResponse<void>> {
        return request.delete(`/bookComment/${commentId}`)
    }
}

export default reviewApi

