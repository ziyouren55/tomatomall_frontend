import { registerNotificationComponent } from './notificationComponentRegistry'
import { registerNotificationNavigator } from '@/utils/notificationNavigatorRegistry'
import OrderPaid from '@/components/notifications/OrderPaidNotification.vue'
import OrderShipped from '@/components/notifications/OrderShippedNotification.vue'
import OrderCompleted from '@/components/notifications/OrderCompletedNotification.vue'
import { resolveNotificationPath } from '@/utils/notificationRouteResolver'

// Register built-in notification components and default navigators synchronously at app startup
export function registerNotificationComponents() {
  try {
    registerNotificationComponent('ORDER_PAID', (OrderPaid as any).default || OrderPaid)
    registerNotificationComponent('ORDER_SHIPPED', (OrderShipped as any).default || OrderShipped)
    registerNotificationComponent('ORDER_COMPLETED', (OrderCompleted as any).default || OrderCompleted)

    // default navigator: use resolver to get path then router.push
    const navigatorForPayload = async (payload: any) => {
      console.log('navigatorForPayload = ', payload)
      console.log('payload = ', payload)
      try {
        const path = resolveNotificationPath(payload)
        console.log('path = ', path)
        if (path) {
          const router = (await import('@/router')).default
          await router.push(path)
        }
      } catch (e) {
        console.error('navigatorForPayload error = ', e)
      }
    }

    registerNotificationNavigator('ORDER_PAID', navigatorForPayload)
    registerNotificationNavigator('ORDER_SHIPPED', navigatorForPayload)
    registerNotificationNavigator('ORDER_COMPLETED', navigatorForPayload)
  } catch (e) {
    console.warn('registerNotificationComponents failed', e)
  }
}


