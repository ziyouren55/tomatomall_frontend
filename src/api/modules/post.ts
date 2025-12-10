import request from '../config/request'
import { ApiResponse, PageResult } from '@/types/api'

export interface PostCreatePayload {
    forumId: number
    title: string
    content: string
    imageUrlList?: string[]
}

export interface PostItem {
    id: number
    forumId: number
    userId: number
    title: string
    content: string
    imageUrls?: string[]
    viewCount?: number
    likeCount?: number
    replyCount?: number
    isSticky?: boolean
    isEssence?: boolean
    status?: string
    lastReplyTime?: string
    createTime?: string
    updateTime?: string
    username?: string
    userAvatar?: string
    forumName?: string
    isLiked?: boolean
}

const postApi = {
    createPost(data: PostCreatePayload): Promise<ApiResponse<PostItem>> {
        return request.post('/posts', data)
    },

    getPostDetail(postId: number): Promise<ApiResponse<PostItem>> {
        return request.get(`/posts/${postId}`)
    },

    deletePost(postId: number): Promise<ApiResponse<string>> {
        return request.delete(`/posts/${postId}`)
    },

    getPostsByForum(forumId: number, page = 0, size = 10): Promise<ApiResponse<PageResult<PostItem>>> {
        return request.get(`/posts/forum/${forumId}`, { params: { page, size } })
    },

    likePost(postId: number): Promise<ApiResponse<PostItem>> {
        return request.post(`/posts/${postId}/like`)
    }
}

export default postApi

