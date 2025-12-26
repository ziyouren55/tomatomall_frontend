import request from '@/api/config/request'
import { ApiResponse, ChatSessionVO, ChatMessageVO, CreateSessionRequest, CreateSessionWithCustomerRequest, SendMessageRequest, PageResultVO } from '@/types/api'

const chatApi = {
  // 获取用户的聊天会话列表
  getChatSessions(): Promise<ApiResponse<ChatSessionVO[]>> {
    return request.get('/chat/sessions')
  },

  // 获取特定会话详情
  getChatSession(sessionId: number): Promise<ApiResponse<ChatSessionVO>> {
    return request.get(`/chat/sessions/${sessionId}`)
  },

  // 获取会话消息历史
  getSessionMessages(
    sessionId: number,
    page: number = 0,
    pageSize: number = 20
  ): Promise<ApiResponse<PageResultVO<ChatMessageVO>>> {
    return request.get(`/chat/sessions/${sessionId}/messages`, {
      params: { page, pageSize }
    })
  },

  // 创建或获取聊天会话
  createChatSession(data: CreateSessionRequest): Promise<ApiResponse<ChatSessionVO>> {
    return request.post('/chat/sessions', data)
  },

  // 商家创建与顾客的聊天会话
  createChatSessionWithCustomer(data: CreateSessionWithCustomerRequest): Promise<ApiResponse<ChatSessionVO>> {
    return request.post('/chat/sessions/with-customer', data)
  },

  // 发送消息
  sendMessage(sessionId: number, data: SendMessageRequest): Promise<ApiResponse<ChatMessageVO>> {
    return request.post(`/chat/sessions/${sessionId}/messages`, data)
  },

  // 标记会话为已读
  markSessionAsRead(sessionId: number): Promise<ApiResponse<string>> {
    return request.post(`/chat/sessions/${sessionId}/mark-read`)
  },

  // 标记所有会话为已读
  markAllSessionsAsRead(): Promise<ApiResponse<string>> {
    return request.post('/chat/mark-all-read')
  },

  // 获取未读消息总数
  getUnreadCount(): Promise<ApiResponse<number>> {
    return request.get('/chat/unread-count')
  },

  // 归档会话
  archiveSession(sessionId: number): Promise<ApiResponse<string>> {
    return request.post(`/chat/sessions/${sessionId}/archive`)
  }
}

export default chatApi