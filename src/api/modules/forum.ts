import request from '../config/request'
import {ApiResponse, PageResult} from '@/types/api'

/**
 * 论坛相关 API
 */

export interface Forum {
    id: number
    name: string
    bookId?: number
    description?: string
    postCount?: number
    status?: string
    bookTitle?: string
    bookCover?: string
    createTime?: string
    updateTime?: string
}

const forumApi = {
    // 获取所有论坛
    getAllForums(): Promise<ApiResponse<Forum[]>> {
        return request.get('/forums')
    },

    // 获取活跃论坛（分页）
    getActiveForums(page: number = 0, size: number = 10): Promise<ApiResponse<PageResult<Forum>>> {
        return request.get('/forums/active/page', { params: { page, size } })
    },

    // 获取全部论坛（分页）
    getForums(page: number = 0, size: number = 10): Promise<ApiResponse<PageResult<Forum>>> {
        return request.get('/forums/page', { params: { page, size } })
    },

    // 根据ID获取论坛
    getForumById(forumId: number): Promise<ApiResponse<Forum>> {
        return request.get(`/forums/${forumId}`)
    },

    // 根据书籍获取论坛
    getForumByBookId(bookId: number): Promise<ApiResponse<Forum>> {
        return request.get(`/forums/book/${bookId}`)
    },

    // 管理员：为某本书创建论坛
    createBookForum(bookId: number): Promise<ApiResponse<Forum>> {
        return request.post(`/admin/forum/books/${bookId}/forum`)
    },

    // 搜索论坛（按名称，状态可选）
    searchForums(keyword: string, page: number = 0, size: number = 10, status?: string): Promise<ApiResponse<PageResult<Forum>>> {
        return request.get('/forums/search', { params: { keyword, page, size, status } })
    }
}

export default forumApi




