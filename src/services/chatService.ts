import { reactive } from 'vue'
import { getToken } from '@/utils/storage'
import type { ChatMessageVO, ChatSessionVO } from '@/types/api'
import store from '@/store'

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
  if (import.meta.env.DEV) {
    console.log('[CHAT WS] Listener added, total:', messageListeners.size)
  }
}

// 移除消息监听器
export function removeMessageListener(listener: (message: ChatMessageVO) => void) {
  messageListeners.delete(listener)
  if (import.meta.env.DEV) {
    console.log('[CHAT WS] Listener removed, total:', messageListeners.size)
  }
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

    if (import.meta.env.DEV) {
      console.log('[CHAT WS] Connecting...', !!token ? 'with token' : 'no token')
    }

    const socketFactory = () => new SockJS(sockUrl)

    client = new Client({
      webSocketFactory: socketFactory,
      reconnectDelay: 5000,
      debug: (m: any) => console.log('[CHAT STOMP]', m),
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000
    })

    // 添加连接状态监听 - 只在开发环境下输出
    if (import.meta.env.DEV) {
      client.beforeConnect = () => {
        console.log('[CHAT WS] Connecting...')
      }
    }

    client.onConnect = () => {
      console.log('[CHAT WS] ✅ Connected')
      chatState.connected = true
      connected = true

      // 订阅聊天消息 - 使用与通知功能一致的路径模式
      console.log('[CHAT WS] Setting up subscriptions...')

      // 主要订阅路径（与通知功能一致）
      client.subscribe('/user/queue/chat', (msg: any) => {
        handleReceivedMessage(msg, '/user/queue/chat')
      })

      // 备用订阅路径
      client.subscribe('/user/chat', (msg: any) => {
        handleReceivedMessage(msg, '/user/chat')
      })

      client.subscribe('/queue/chat', (msg: any) => {
        handleReceivedMessage(msg, '/queue/chat')
      })

      console.log('[CHAT WS] ✅ Subscriptions ready')
    }

    // 统一的消息处理函数 - 在收到消息时打印原始数据
    const handleReceivedMessage = (msg: any, source: string) => {
      // 首先打印完整的原始消息数据
      console.log(`[CHAT WS] 🔴 RECEIVED RAW MESSAGE from ${source}:`, msg)
      console.log(`[CHAT WS] 🔴 MESSAGE BODY:`, msg.body)
      console.log(`[CHAT WS] 🔴 MESSAGE HEADERS:`, msg.headers)

      try {
        const payload = msg.body ? JSON.parse(msg.body) : {}

        // 检查是否是复合对象（包含消息和会话状态）
        if (payload.message && payload.updatedSession) {
          // 复合对象：包含消息和更新的会话状态
          const message: ChatMessageVO = payload.message
          const updatedSession: ChatSessionVO = payload.updatedSession

          console.log(`[CHAT WS] ✅ PARSED COMPOSITE PAYLOAD from ${source}:`, { message, updatedSession })

          // 更新本地会话状态
          const existingSessionIndex = chatState.sessions.findIndex(s => s.id === updatedSession.id)
          if (existingSessionIndex >= 0) {
            // 会话已存在，更新它
            updateSession(updatedSession.id, updatedSession)
            console.log(`[CHAT WS] ✅ Session updated:`, updatedSession.id)
          } else {
            // 会话不存在，添加新会话
            addSession(updatedSession)
            console.log(`[CHAT WS] ✅ New session added:`, updatedSession.id)
          }

          // 检查当前用户是否正在查看该会话，如果是则自动标记已读
          console.log(`[CHAT DEBUG] Checking if user is viewing session ${message.sessionId}`)
          console.log(`[CHAT DEBUG] Current session:`, chatState.currentSession?.id || 'null')
          console.log(`[CHAT DEBUG] Message session:`, message.sessionId)

          if (chatState.currentSession && chatState.currentSession.id === message.sessionId) {
            console.log(`[CHAT WS] 👁️ User is viewing session ${message.sessionId}, auto-marking as read`)

            // 乐观更新：立即将本地会话的未读计数设置为0，避免显示红点
            const currentUser = store.state.user.userInfo
            const optimisticUpdates: Partial<ChatSessionVO> = {}
            if (currentUser?.id === updatedSession.customerId) {
              optimisticUpdates.unreadCountCustomer = 0
            } else {
              optimisticUpdates.unreadCountMerchant = 0
            }

            console.log(`[CHAT DEBUG] Optimistically updating session ${message.sessionId} unread count to 0`)
            updateSession(message.sessionId, optimisticUpdates)

            // 发送标记已读的WebSocket消息
            markChatAsRead(message.sessionId)
          } else {
            console.log(`[CHAT DEBUG] User is NOT viewing this session, will show red dot`)
          }

          // 通知消息监听器
          messageListeners.forEach((listener) => {
            try {
              console.log(`[CHAT WS] 📢 Notifying listener with message:`, message)
              listener(message)
            } catch (e) {
              console.warn(`[CHAT WS] Listener error:`, e)
            }
          })

        } else {
          // 简单对象：只包含消息（发送方收到自己的消息）
          const message: ChatMessageVO = payload

          console.log(`[CHAT WS] ✅ PARSED SIMPLE MESSAGE from ${source}:`, message)

          // 通知消息监听器
          messageListeners.forEach((listener) => {
            try {
              console.log(`[CHAT WS] 📢 Notifying listener with message:`, message)
              listener(message)
            } catch (e) {
              console.warn(`[CHAT WS] Listener error:`, e)
            }
          })
        }

        console.log(`[CHAT WS] ✅ Message processing completed`)

      } catch (e) {
        console.warn(`[CHAT WS] Parse message failed from ${source}:`, e)
        console.warn(`[CHAT WS] Raw message that failed to parse:`, msg)
      }
    }

    // 注意：SockJS不支持CONNECT帧的自定义headers，token通过URL参数传递
    // TokenHandshakeHandler会从查询参数中解析token

    client.onStompError = (frame: any) => {
      console.error('[CHAT WS] STOMP error:', frame.headers?.message || 'Unknown error')
      chatState.connected = false
      connected = false
    }

    client.onWebSocketError = () => {
      console.error('[CHAT WS] WebSocket error')
      chatState.connected = false
      connected = false
    }

    client.onWebSocketClose = () => {
      console.log('[CHAT WS] Disconnected')
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

// 发送聊天消息 - 只在开发环境下输出详细信息
export function sendChatMessage(message: ChatWebSocketMessage) {
  console.log('[CHAT WS] sendChatMessage called')
  console.log('[CHAT WS] client exists:', !!client)
  console.log('[CHAT WS] connected:', connected)
  console.log('[CHAT WS] chatState.connected:', chatState.connected)
  
  if (!client || !connected) {
    console.warn('[CHAT WS] Not connected, cannot send message')
    console.warn('[CHAT WS] client:', !!client, 'connected:', connected)
    return false
  }

  try {
    if (import.meta.env.DEV) {
      console.log('[CHAT WS] 📤 Sending:', message.content?.substring(0, 50))
    }

    client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message)
    })
    console.log('[CHAT WS] Message published successfully')
    return true
  } catch (e) {
    console.error('[CHAT WS] Send failed:', e)
    return false
  }
}

// 测试连接状态
export function testWebSocketConnection() {
  return {
    clientExists: !!client,
    connected,
    chatStateConnected: chatState.connected,
    listenersCount: messageListeners.size,
    clientState: client ? {
      connected: client.connected,
      active: client.active
    } : null
  }
}

// 标记消息为已读
export function markChatAsRead(sessionId: number) {
  console.log('[CHAT DEBUG] markChatAsRead called for session:', sessionId)
  if (!client || !connected) {
    console.warn('[CHAT] not connected, cannot mark as read')
    return false
  }

  try {
    console.log('[CHAT DEBUG] Publishing mark-read for session:', sessionId)
    client.publish({
      destination: '/app/chat.mark-read',
      body: JSON.stringify({ sessionId })
    })
    console.log('[CHAT DEBUG] markChatAsRead published successfully')
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
    // 根据当前用户角色返回对应的未读消息数
    const currentUser = store.state.user.userInfo
    let unreadCount = 0
    if (currentUser?.id === session.customerId) {
      unreadCount = session.unreadCountCustomer || 0
    } else {
      unreadCount = session.unreadCountMerchant || 0
    }
    return total + unreadCount
  }, 0)
  chatState.unreadCount = totalUnread
}

// 设置当前会话
export function setCurrentSession(session: ChatSessionVO | null) {
  console.log('[CHAT DEBUG] setCurrentSession called with:', session?.id || 'null')
  chatState.currentSession = session
  console.log('[CHAT DEBUG] chatState.currentSession set to:', chatState.currentSession?.id || 'null')
  if (session) {
    // 乐观更新：立即将本地会话的未读计数设置为0
    const currentUser = store.state.user.userInfo
    const optimisticUpdates: Partial<ChatSessionVO> = {}
    if (currentUser?.id === session.customerId) {
      optimisticUpdates.unreadCountCustomer = 0
    } else {
      optimisticUpdates.unreadCountMerchant = 0
    }

    console.log(`[CHAT DEBUG] Optimistically updating session ${session.id} unread count to 0`)
    updateSession(session.id, optimisticUpdates)

    // 标记当前会话为已读
    console.log('[CHAT DEBUG] Marking session as read:', session.id)
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
