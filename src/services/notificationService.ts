import { ref } from 'vue'
import { getToken } from '@/utils/storage'

export const notifications = ref<any[]>([])

let client: any = null
let connected = false

export async function initNotificationService(backendBase = '') {
  if (connected) return
  try {
    const SockJS = (await import('sockjs-client')).default
    const { Client } = await import('@stomp/stompjs')
    const { ElNotification } = await import('element-plus')
    const router = (await import('@/router')).default

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
      const handleMsg = (msg: any, label = '') => {
        try {
          const body = msg.body ? JSON.parse(msg.body) : {}
          console.log('[WS] received', label, body)
          notifications.value.unshift(body)
          // 通知全局：有新消息，导航栏可刷新未读数或 badge
          try {
            // optimistic delta +1
            window.dispatchEvent(new CustomEvent('notificationChanged', { detail: { delta: 1 } }))
          } catch(e) {}
          const orderId = body.orderId
          ElNotification({
            title: '新订单通知',
            message: `
              <div>订单 <strong>#${orderId}</strong> 已支付，金额 ¥${body.amount || ''}。</div>
              <div style="margin-top:8px;"><a href="#" id="notif-link">查看订单</a></div>
            `,
            dangerouslyUseHTMLString: true,
            duration: 8000,
            showClose: true,
            onClick: () => {
              if (orderId) {
                router.push({ path: `/order/${orderId}` }).catch(()=>{})
              }
            }
          })
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


