export function resolveNotificationPath(payload: any): string | null {
  try {
    // snapshot payload for reliable logging (console.log may show live object later)
    let snap: any = payload
    if (typeof payload === 'string') {
      try { snap = JSON.parse(payload) } catch (e) { snap = payload }
    }
    console.log('resolveNotificationPath payload snapshot =', JSON.stringify(snap))
    if (!snap) return null

    // try common locations/variants for orderId
    const orderId =
      snap.orderId ??
      snap.orderid ??
      (snap.payload && (snap.payload.orderId ?? snap.payload.orderid)) ??
      null
    console.log('resolveNotificationPath orderId =', orderId)
    if (!orderId) return null

    const merchantId =
      snap.merchantId ??
      snap.merchantid ??
      snap.storeId ??
      snap.storeid ??
      (snap.payload && (snap.payload.merchantId ?? snap.payload.storeId)) ??
      null
    console.log('resolveNotificationPath merchantId =', merchantId)
    return merchantId ? `/merchant/orders/${orderId}` : `/order/${orderId}`
  } catch (e) {
    console.error('resolveNotificationPath error', e)
    return null
  }
}


