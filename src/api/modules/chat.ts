import request from '@/api/config/request'
import { ApiResponse } from '@/types/api'

export interface ChatSessionVO {
  id: number
  customerId: number
  merchantId: number
  storeId: number
  storeName?: string
  customerName?: string
  customerAvatar?: string
  merchantName?: string
  merchantAvatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCountCustomer: number
  unreadCountMerchant: number
  status: string
}

export interface ChatMessageVO {
  id: number
  sessionId: number
  senderId: number
  senderRole: string
  senderName?: string
  senderAvatar?: string
  content: string
  messageType: string
  status: string
  createdAt: string
}

export interface CreateSessionRequest {
  storeId: number
}

export interface SendMessageRequest {
  content: string
  messageType?: string
}

export interface PageResultVO<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

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