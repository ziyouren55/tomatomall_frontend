import request from '../config/request'
import { ApiResponse, PageResult } from '@/types/api'

export interface ReplyCreatePayload {
    postId: number
    content: string
    parentId?: number
}

export interface ReplyItem {
    id: number
    postId: number
    userId: number
    content: string
    parentId?: number
    likeCount?: number
    status?: string
    createTime?: string
    updateTime?: string
    username?: string
    userAvatar?: string
    childReplies?: ReplyItem[]
    isLiked?: boolean
    parentUsername?: string
}

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

