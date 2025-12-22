import { registerNotificationComponent } from './notificationComponentRegistry'
import OrderPaid from '@/components/notifications/OrderPaidNotification.vue'
import OrderShipped from '@/components/notifications/OrderShippedNotification.vue'
import OrderCompleted from '@/components/notifications/OrderCompletedNotification.vue'

// Register built-in notification components synchronously at app startup
export function registerNotificationComponents() {
  try {
    registerNotificationComponent('ORDER_PAID', (OrderPaid as any).default || OrderPaid)
    registerNotificationComponent('ORDER_SHIPPED', (OrderShipped as any).default || OrderShipped)
    registerNotificationComponent('ORDER_COMPLETED', (OrderCompleted as any).default || OrderCompleted)
  } catch (e) {
    console.warn('registerNotificationComponents failed', e)
  }
}


