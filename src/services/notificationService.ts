import { ref } from 'vue'
import { getToken } from '@/utils/storage'
import { h } from 'vue'
import { registerNotificationComponent, getNotificationComponent } from './notificationComponentRegistry'

// register built-in components (lazy-import to keep bundle reasonable)
async function registerBuiltinComponents() {
  try {
    const paid = (await import('@/components/business/notifications/OrderPaidNotification.vue')).default
    const shipped = (await import('@/components/business/notifications/OrderShippedNotification.vue')).default
    const completed = (await import('@/components/business/notifications/OrderCompletedNotification.vue')).default
    registerNotificationComponent('ORDER_PAID', paid)
    registerNotificationComponent('ORDER_SHIPPED', shipped)
    registerNotificationComponent('ORDER_COMPLETED', completed)
  } catch (e) {
    console.warn('registerBuiltinComponents failed', e)
  }
}

export const notifications = ref<any[]>([])

let client: any = null
let connected = false
let currentBackendBase = ''

// 单点登录登出函数
const performLogout = () => {
  try {
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('username')
    localStorage.removeItem('userInfo')

    // 显示登出消息
    const { ElMessage } = import('element-plus').then(module => {
      module.ElMessage.success('已安全登出')
    }).catch(() => {
      console.log('已安全登出')
    })

    // 强制跳转到登录页
    setTimeout(() => {
      const loginUrl = window.location.origin + '/login'
      window.location.replace(loginUrl)
    }, 500)

  } catch (error) {
    console.error('Logout failed:', error)
    // 最后的降级方案
    window.location.href = '/login'
  }
}

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
    // ensure built-in formatters/components are registered
    registerBuiltinComponents().catch(()=>{})

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
            console.warn('Single login detected, forcing logout...')

            // 立即清除本地存储，防止状态混乱
            localStorage.removeItem('token')
            localStorage.removeItem('isAdmin')
            localStorage.removeItem('username')
            localStorage.removeItem('userInfo')

            // 显示警告通知并立即执行登出
            try {
              const { ElMessageBox, ElMessage } = await import('element-plus')

              // 显示确认对话框
              await ElMessageBox.alert(
                body.message || '您的账号在其他设备上登录，您已被迫下线',
                '账号安全提醒',
                {
                  confirmButtonText: '立即重新登录',
                  type: 'warning',
                  showClose: false,
                  closeOnClickModal: false,
                  closeOnPressEscape: false,
                }
              )

              // 用户点击确认后执行登出
              performLogout()

            } catch (dialogError) {
              console.warn('Dialog failed, using direct logout:', dialogError)
              // 如果对话框失败，直接执行登出
              performLogout()
            }

            // 延迟跳转，确保用户有时间看到通知
            setTimeout(async () => {
              try {
                const router = (window as any).$router
                if (router) {
                  await router.push('/login')
                  // 强制刷新页面，确保所有状态都被清理
                  setTimeout(() => {
                    window.location.reload()
                  }, 100)
                }
              } catch (e) {
                console.error('Failed to redirect to login page:', e)
                // 最后的降级方案：直接跳转
                window.location.href = '/login'
              }
            }, 2000) // 缩短等待时间，确保及时跳转

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
            // fallback simple text notification
            const orderId = body.orderId
            ElNotification({
              title: '新消息',
              message: `
                <div>订单 <strong>#${orderId}</strong> 已收到一条新消息。</div>
              `,
              dangerouslyUseHTMLString: true,
              duration: 8000,
              showClose: true,
              onClick: async () => {
                if (!orderId) return
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

          // 如果是单点登录通知，立即处理
          if (body.type === 'FORCE_LOGOUT') {
            console.warn('Single login broadcast detected, forcing logout...')
            // 复用现有的处理逻辑
            handleMsg({ body: JSON.stringify(body) }, 'broadcast')
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


