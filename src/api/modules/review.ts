import request from '../config/request'
import { ApiResponse, BookCommentData, BookComment, PageResult } from '@/types/api'

const reviewApi = {
    // 发布书评
    addBookComment(productId: number, commentData: BookCommentData): Promise<ApiResponse<string>> {
        return request.post(`/bookComment/${productId}`, commentData)
    },

    // 获取指定产品的书评列表（分页）
    getBookComments(productId: number, page = 0, size = 10): Promise<ApiResponse<PageResult<BookComment>>> {
        return request.get(`/bookComment/${productId}`, { params: { page, size } })
    },

    // 删除书评
    deleteBookComment(commentId: number): Promise<ApiResponse<string>> {
        return request.delete(`/bookComment/${commentId}`)
    }
}

export default reviewApi




