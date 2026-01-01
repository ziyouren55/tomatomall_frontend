import { ref } from 'vue'
import { getToken } from '@/utils/storage'
import { h } from 'vue'
import { getNotificationComponent } from './notificationComponentRegistry'
import { authService } from './authService'
import { generateFallbackMessage, getFallbackTitle } from '@/utils/notificationFallbackFormatter'

export const notifications = ref<any[]>([])

let client: any = null
let connected = false
let currentBackendBase = ''


// 重新初始化WebSocket连接（用于登录状态变化时）
export async function reinitializeNotificationService() {
  if (connected && client) {
    // 如果已经连接，先断开
    try {
      await client.deactivate()
    } catch (e) {
      console.warn('Failed to deactivate existing connection:', e)
    }
    connected = false
  }

  // 使用当前的后端地址重新初始化
  if (currentBackendBase) {
    await initNotificationService(currentBackendBase)
  }
}

export async function initNotificationService(backendBase = '') {
  currentBackendBase = backendBase // 保存后端地址用于重新初始化
  if (connected) return
  try {
    const SockJS = (await import('sockjs-client')).default
    const { Client } = await import('@stomp/stompjs')
    const { ElNotification } = await import('element-plus')
    // 初始化认证服务
    authService.init().catch(()=>{})

    // if token exists, attach as query param so server-side HandshakeHandler can read it during HTTP handshake
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
      debug: (m: any) => console.log('[STOMP DEBUG][service]', m)
    })

    client.onConnect = () => {
      console.log('[WS] connected (notificationService)')
      connected = true
      const handleMsg = async (msg: any, label = '') => {
        try {
          const body = msg.body ? JSON.parse(msg.body) : {}
          console.log('[WS] received', label, body)

          // 特殊处理：单点登录强制登出
          if (body.type === 'FORCE_LOGOUT') {
            console.warn('Single login detected, delegating to auth service...')
            // 将单点登录处理委托给认证服务
            await authService.handleSingleLoginNotification(body)
            return // 不继续处理普通通知逻辑
          }

          notifications.value.unshift(body)
          // 通知全局：有新消息，导航栏可刷新未读数或 badge
          try {
            // optimistic delta +1
            window.dispatchEvent(new CustomEvent('notificationChanged', { detail: { delta: 1 } }))
          } catch(e) {}
          // delegate click handling to shared handler to keep behavior consistent with NotificationsPage.open
          const { handleNotificationClickShared } = await import('@/utils/notificationClickHandler')

          // show notification using registered component if available
          const Comp = getNotificationComponent(body.type)
          console.log('body = ', body)
          console.log('Comp = ', Comp)
          if (Comp) {
            // build component payload: if backend sent stringified payload, parse it so component gets object
            let compPayload: any = null
            try {
              if (body && body.payload && typeof body.payload === 'string') {
                compPayload = JSON.parse(body.payload)
              } else {
                compPayload = body?.payload ?? body?.__payload ?? body
              }
            } catch (e) {
              compPayload = body?.payload ?? body?.__payload ?? body
            }
            console.log('[WS] compPayload = ', compPayload, 'fullBody = ', body)
            // attach onOpen so component emits or calls parent handler will be handled here
            const vnode = h(Comp, { payload: compPayload, __notif: body, onOpen: () => handleNotificationClickShared(body) })
            ElNotification({
              title: '',
              message: vnode,
              dangerouslyUseHTMLString: false,
              duration: 8000,
              showClose: true,
            })
          } else {
            // fallback simple text notification using generic formatter
            ElNotification({
              title: getFallbackTitle(body),
              message: generateFallbackMessage(body),
              dangerouslyUseHTMLString: true,
              duration: 8000,
              showClose: true,
              onClick: async () => {
                await handleNotificationClickShared(body)
              }
            })
          }
        } catch (e) {
          console.warn('[WS] service parse failed', e)
        }
      }

      // subscribe to merchant topic, general topic and user queue (if server sends to these)
      client.subscribe('/topic/merchant/notifications', (msg: any) => handleMsg(msg, 'merchant'))
      client.subscribe('/topic/notifications', (msg: any) => handleMsg(msg, 'general'))
      client.subscribe('/user/queue/notifications', (msg: any) => handleMsg(msg, 'user'))

      // 订阅单点登录广播频道（作为用户队列的补充）
      client.subscribe('/topic/single-login/*', (msg: any) => {
        try {
          const body = msg.body ? JSON.parse(msg.body) : {}
          console.log('[WS] single-login broadcast received:', body)

          // 如果是单点登录通知，委托给认证服务处理
          if (body.type === 'FORCE_LOGOUT') {
            console.warn('Single login broadcast detected, delegating to auth service...')
            authService.handleSingleLoginNotification(body).catch(e => {
              console.warn('[WS] Failed to handle single-login broadcast:', e)
            })
          }
        } catch (e) {
          console.warn('[WS] Failed to process single-login broadcast:', e)
        }
      })
    }

    // attach token for handshake / CONNECT headers so server can assign Principal
    try {
      const token = getToken()
      if (token) client.connectHeaders = { token }
    } catch (e) {
      // ignore
    }

    client.onStompError = (frame: any) => {
      console.error('[STOMP ERROR]', frame)
    }

    client.activate()
  } catch (e) {
    console.warn('initNotificationService failed', e)
  }
}

export function stopNotificationService() {
  try {
    if (client) client.disconnect()
    connected = false
  } catch (e) {
    /* ignore */
  }
}


