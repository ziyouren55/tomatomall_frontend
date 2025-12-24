import { reactive } from 'vue'
import { getToken } from '@/utils/storage'
import type { ChatMessageVO, ChatSessionVO } from '@/api/modules/chat'

export interface ChatWebSocketMessage {
  sessionId: number
  content: string
  messageType?: string
}

export interface MarkReadMessage {
  sessionId: number
}

// 聊天状态管理
export const chatState = reactive({
  sessions: [] as ChatSessionVO[],
  currentSession: null as ChatSessionVO | null,
  messages: [] as ChatMessageVO[],
  unreadCount: 0,
  loading: false,
  connected: false
})

// WebSocket客户端
let client: any = null
let connected = false

// 消息监听器
const messageListeners = new Set<(message: ChatMessageVO) => void>()

// 添加消息监听器
export function addMessageListener(listener: (message: ChatMessageVO) => void) {
  messageListeners.add(listener)
}

// 移除消息监听器
export function removeMessageListener(listener: (message: ChatMessageVO) => void) {
  messageListeners.delete(listener)
}

// 初始化聊天WebSocket服务
export async function initChatService(backendBase = '') {
  if (connected) return

  try {
    const SockJS = (await import('sockjs-client')).default
    const { Client } = await import('@stomp/stompjs')

    // 如果token存在，附加为查询参数以便服务器端HandshakeHandler可以在HTTP握手期间读取它
    const token = (() => {
      try { return getToken() } catch (e) { return null }
    })()

    // 确保backendBase是基础URL，不包含/api路径
    const cleanBase = backendBase.replace(/\/api\/?$/, '').replace(/\/$/, '')
    const baseWs = `${cleanBase}/api/ws`
    const sockUrl = token ? `${baseWs}?token=${encodeURIComponent(token)}` : baseWs
    const socketFactory = () => new SockJS(sockUrl, undefined, {
      // 配置SockJS传输方式，优先使用websocket，避免iframe等fallback
      transports: ['websocket', 'xhr-streaming', 'xhr-polling']
    })

    client = new Client({
      webSocketFactory: socketFactory,
      reconnectDelay: 5000,
      debug: (m: any) => console.log('[CHAT STOMP DEBUG]', m)
    })

    client.onConnect = () => {
      console.log('[CHAT WS] connected')
      chatState.connected = true
      connected = true

      // 订阅聊天消息
      client.subscribe('/user/chat', (msg: any) => {
        try {
          const message: ChatMessageVO = msg.body ? JSON.parse(msg.body) : {}
          console.log('[CHAT WS] received message', message)

          // 通知所有监听器
          messageListeners.forEach(listener => {
            try {
              listener(message)
            } catch (e) {
              console.warn('[CHAT WS] listener error', e)
            }
          })

          // 更新未读计数
          updateUnreadCount()

        } catch (e) {
          console.warn('[CHAT WS] parse message failed', e)
        }
      })
    }

    // 附加token用于握手/CONNECT头，以便服务器可以分配Principal
    try {
      const token = getToken()
      if (token) client.connectHeaders = { token }
    } catch (e) {
      // ignore
    }

    client.onStompError = (frame: any) => {
      console.error('[CHAT STOMP ERROR]', frame)
      chatState.connected = false
      connected = false
    }

    client.onWebSocketClose = () => {
      console.log('[CHAT WS] disconnected')
      chatState.connected = false
      connected = false
    }

    client.activate()

  } catch (e) {
    console.warn('initChatService failed', e)
  }
}

// 停止聊天WebSocket服务
export function stopChatService() {
  try {
    if (client) client.disconnect()
    chatState.connected = false
    connected = false
  } catch (e) {
    /* ignore */
  }
}

// 发送聊天消息
export function sendChatMessage(message: ChatWebSocketMessage) {
  if (!client || !connected) {
    console.warn('[CHAT] not connected, cannot send message')
    return false
  }

  try {
    client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message)
    })
    return true
  } catch (e) {
    console.error('[CHAT] send message failed', e)
    return false
  }
}

// 标记消息为已读
export function markChatAsRead(sessionId: number) {
  if (!client || !connected) {
    console.warn('[CHAT] not connected, cannot mark as read')
    return false
  }

  try {
    client.publish({
      destination: '/app/chat.mark-read',
      body: JSON.stringify({ sessionId })
    })
    return true
  } catch (e) {
    console.error('[CHAT] mark as read failed', e)
    return false
  }
}

// 更新未读消息计数
export function updateUnreadCount() {
  // 计算所有会话中的未读消息总数
  const totalUnread = chatState.sessions.reduce((total, session) => {
    // 这里需要根据当前用户角色来确定使用哪个未读计数
    // 暂时简化处理，假设当前用户是顾客
    return total + (session.unreadCountCustomer || 0)
  }, 0)
  chatState.unreadCount = totalUnread
}

// 设置当前会话
export function setCurrentSession(session: ChatSessionVO | null) {
  chatState.currentSession = session
  if (session) {
    // 标记当前会话为已读
    markChatAsRead(session.id)
  }
}

// 添加新会话
export function addSession(session: ChatSessionVO) {
  const existingIndex = chatState.sessions.findIndex(s => s.id === session.id)
  if (existingIndex >= 0) {
    chatState.sessions[existingIndex] = session
  } else {
    chatState.sessions.unshift(session)
  }
  updateUnreadCount()
}

// 更新会话
export function updateSession(sessionId: number, updates: Partial<ChatSessionVO>) {
  const sessionIndex = chatState.sessions.findIndex(s => s.id === sessionId)
  if (sessionIndex >= 0) {
    Object.assign(chatState.sessions[sessionIndex], updates)
    updateUnreadCount()
  }
}

// 移除会话
export function removeSession(sessionId: number) {
  const sessionIndex = chatState.sessions.findIndex(s => s.id === sessionId)
  if (sessionIndex >= 0) {
    chatState.sessions.splice(sessionIndex, 1)
    updateUnreadCount()
  }
}
