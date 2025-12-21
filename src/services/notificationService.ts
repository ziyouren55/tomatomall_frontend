import { ref } from 'vue'

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

    const sockUrl = backendBase.endsWith('/') ? backendBase + 'ws' : backendBase + '/ws'
    const socketFactory = () => new SockJS(sockUrl)

    client = new Client({
      webSocketFactory: socketFactory,
      reconnectDelay: 5000,
      debug: (m: any) => console.log('[STOMP DEBUG][service]', m)
    })

    client.onConnect = () => {
      console.log('[WS] connected (notificationService)')
      connected = true
      client.subscribe('/topic/merchant/notifications', (msg: any) => {
        try {
          const body = msg.body ? JSON.parse(msg.body) : {}
          notifications.value.unshift(body)
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
      })
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


