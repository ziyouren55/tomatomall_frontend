import request from '../config/request'
import { ApiResponse, PageResult, PostCreatePayload, PostItem } from '@/types/api'

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

