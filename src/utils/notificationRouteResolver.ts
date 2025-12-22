export function resolveNotificationPath(payload: any): string | null {
  if (!payload) return null
  const orderId = payload.orderId ?? payload.orderid ?? null
  if (!orderId) return null
  const merchantId = payload.merchantId ?? payload.merchantid ?? payload.storeId ?? payload.storeid ?? null
  return merchantId ? `/merchant/orders/${orderId}` : `/order/${orderId}`
}


