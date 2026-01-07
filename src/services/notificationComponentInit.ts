import { registerNotificationComponent } from './notificationComponentRegistry'
import { registerNotificationNavigator } from '@/utils/notificationNavigatorRegistry'
import OrderPaid from '@/components/business/notifications/OrderPaidNotification.vue'
import OrderShipped from '@/components/business/notifications/OrderShippedNotification.vue'
import OrderCompleted from '@/components/business/notifications/OrderCompletedNotification.vue'
import CouponIssued from '@/components/business/notifications/CouponIssuedNotification.vue'
import { resolveNotificationPath } from '@/utils/notificationRouteResolver'

// Register built-in notification components and default navigators synchronously at app startup
export function registerNotificationComponents() {
  try {
    registerNotificationComponent('ORDER_PAID', (OrderPaid as any).default || OrderPaid)
    registerNotificationComponent('ORDER_SHIPPED', (OrderShipped as any).default || OrderShipped)
    registerNotificationComponent('ORDER_COMPLETED', (OrderCompleted as any).default || OrderCompleted)
    registerNotificationComponent('COUPON_ISSUED', (CouponIssued as any).default || CouponIssued)

    // default navigator: use resolver to get path then router.push
    const navigatorForPayload = async (payload: any) => {
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

    // coupon navigator: navigate to my coupons page
    const couponNavigator = async (payload: any) => {
      try {
        const router = (await import('@/router')).default
        await router.push('/my-coupons')
      } catch (e) {
        console.error('couponNavigator error = ', e)
      }
    }

    registerNotificationNavigator('ORDER_PAID', navigatorForPayload)
    registerNotificationNavigator('ORDER_SHIPPED', navigatorForPayload)
    registerNotificationNavigator('ORDER_COMPLETED', navigatorForPayload)
    registerNotificationNavigator('COUPON_ISSUED', couponNavigator)
  } catch (e) {
    console.warn('registerNotificationComponents failed', e)
  }
}


