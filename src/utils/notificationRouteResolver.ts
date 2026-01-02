export function resolveNotificationPath(payload: any): string | null {
  try {
    // snapshot payload for reliable logging (console.log may show live object later)
    let snap: any = payload
    if (typeof payload === 'string') {
      try { snap = JSON.parse(payload) } catch (e) { snap = payload }
    }
    if (!snap) return null

    // try common locations/variants for orderId
    const orderId =
      snap.orderId ??
      snap.orderid ??
      (snap.payload && (snap.payload.orderId ?? snap.payload.orderid)) ??
      null
    if (!orderId || orderId === 'NaN' || isNaN(Number(orderId))) {
      console.warn('Invalid orderId in notification payload:', orderId)
      return null
    }

    const merchantId =
      snap.merchantId ??
      snap.merchantid ??
      snap.storeId ??
      snap.storeid ??
      (snap.payload && (snap.payload.merchantId ?? snap.payload.storeId)) ??
      null
    return merchantId ? `/merchant/orders/${orderId}` : `/order/${orderId}`
  } catch (e) {
    console.error('resolveNotificationPath error', e)
    return null
  }
}


