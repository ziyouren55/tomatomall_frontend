import { ref } from 'vue'
import { getToken } from '@/utils/storage'
import { h } from 'vue'
import { registerNotificationComponent, getNotificationComponent } from './notificationComponentRegistry'

// register built-in components (lazy-import to keep bundle reasonable)
async function registerBuiltinComponents() {
  try {
    const paid = (await import('@/components/notifications/OrderPaidNotification.vue')).default
    const shipped = (await import('@/components/notifications/OrderShippedNotification.vue')).default
    const completed = (await import('@/components/notifications/OrderCompletedNotification.vue')).default
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

export async function initNotificationService(backendBase = '') {
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
    const baseWs = backendBase.endsWith('/') ? backendBase + 'ws' : backendBase + '/ws'
    const sockUrl = token ? `${baseWs}?token=${encodeURIComponent(token)}` : baseWs
    const socketFactory = () => new SockJS(sockUrl)

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
            // attach onOpen so component emits or calls parent handler will be handled here
            const vnode = h(Comp, { payload: body, onOpen: () => handleNotificationClickShared(body) })
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


