/**
 * 通知 fallback 消息格式化器
 * 将业务逻辑从通知服务中分离出来，提供通用的消息格式化功能
 */

export interface NotificationFallbackFormatter {
  generateMessage(notification: any): string
  getTitle(notification: any): string
}

/**
 * 默认的通知 fallback 格式化器
 */
export class DefaultNotificationFallbackFormatter implements NotificationFallbackFormatter {
  generateMessage(notification: any): string {
    // 优先处理订单相关通知
    if (notification.orderId) {
      return `订单 <strong>#${notification.orderId}</strong> 已收到一条新消息。`
    }

    // 处理其他类型的通知
    if (notification.title) {
      return notification.title
    }

    if (notification.message) {
      return notification.message
    }

    // 通用 fallback
    return '您收到了一条新消息'
  }

  getTitle(notification: any): string {
    // 可以根据通知类型返回不同的标题
    if (notification.orderId) {
      return '订单通知'
    }

    return notification.title || '新消息'
  }
}

// 默认导出单例实例
export const defaultFormatter = new DefaultNotificationFallbackFormatter()

// 便捷函数
export function generateFallbackMessage(notification: any): string {
  return defaultFormatter.generateMessage(notification)
}

export function getFallbackTitle(notification: any): string {
  return defaultFormatter.getTitle(notification)
}
