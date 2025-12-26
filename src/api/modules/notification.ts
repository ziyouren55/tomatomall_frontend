import request from '@/api/config/request'
import { ApiResponse, PageResult, Notification } from '@/types/api'

export default {
  unreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    return request.get('/notifications/unread-count')
  },

  getNotifications(page: number = 0, size: number = 20): Promise<ApiResponse<PageResult<Notification>>> {
    return request.get('/notifications', { params: { page, size } })
  },

  getDetail(id: number): Promise<ApiResponse<Notification>> {
    return request.get(`/notifications/${id}`)
  },

  markRead(ids: number[] = []): Promise<ApiResponse<{ updated: number }>> {
    return request.post('/notifications/mark-read', { ids })
  },

  markAllRead(): Promise<ApiResponse<{ updated: number }>> {
    return request.post('/notifications/mark-all-read')
  },

  deleteBulk(ids: number[] = []): Promise<ApiResponse<{ deleted: number }>> {
    return request.post('/notifications/delete', { ids })
  }
}


