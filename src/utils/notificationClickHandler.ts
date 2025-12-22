export async function handleNotificationClickShared(notif: any, opts?: { skipMarkAndBadge?: boolean }) {
  const skip = !!opts?.skipMarkAndBadge

  // perform mark-read and badge update unless asked to skip
  if (!skip) {
    let marked = false
    try {
      const api = (await import('@/api')).default
      if (notif?.id) {
        await api.notification.markRead([notif.id])
        marked = true
      }
    } catch (e) {
      // ignore mark-read failures
    }
    if (marked) {
      try { window.dispatchEvent(new CustomEvent('notificationChanged', { detail: { delta: -1 } })) } catch (e) {}
    }
  }

  // derive payload
  const p = notif && (notif.payload ?? notif.__payload ?? notif) ? (notif.payload ?? notif.__payload ?? notif) : {}
  console.log('p = ', p)

  // try navigator registry
  try {
    const { getNotificationNavigator } = await import('@/utils/notificationNavigatorRegistry')
    const navigator = getNotificationNavigator(notif?.type ?? '')
    if (navigator) {
      console.log('go registered navigator = ', navigator)
      await navigator(p, notif)
      return
    }
  } catch (e) {
    // ignore navigator lookup errors
  }

  // fallback to resolver
  try {
    const { resolveNotificationPath } = await import('@/utils/notificationRouteResolver')
    const path = resolveNotificationPath(p)
    if (path) {
      console.log('go path resolver = ', path)
      const router = (await import('@/router')).default
      await router.push(path)
      return
    }
  } catch (e) {
    // ignore
  }

  // final fallback: go to notifications page
  try {
    const router = (await import('@/router')).default
    console.log('go notifications page = ', router)
    await router.push({ path: '/notifications' })
  } catch (e) { /* ignore */ }
}


