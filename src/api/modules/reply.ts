import request from '../config/request'
import { ApiResponse, PageResult, ReplyCreatePayload, ReplyItem } from '@/types/api'

const replyApi = {
    createReply(data: ReplyCreatePayload): Promise<ApiResponse<ReplyItem>> {
        return request.post('/replies', data)
    },

    deleteReply(replyId: number): Promise<ApiResponse<string>> {
        return request.delete(`/replies/${replyId}`)
    },

    getRepliesByPost(postId: number, page = 0, size = 20): Promise<ApiResponse<PageResult<ReplyItem>>> {
        return request.get(`/replies/post/${postId}`, { params: { page, size } })
    },

    likeReply(replyId: number): Promise<ApiResponse<ReplyItem>> {
        return request.post(`/replies/${replyId}/like`)
    }
}

export default replyApi

