type Navigator = (payload: any, item?: any) => Promise<void> | void

const registry: Record<string, Navigator> = {}

export function registerNotificationNavigator(type: string, nav: Navigator) {
  if (!type || !nav) return
  registry[type] = nav
}

export function getNotificationNavigator(type: string): Navigator | undefined {
  return registry[type]
}

export function clearNotificationNavigators() {
  for (const k of Object.keys(registry)) delete registry[k]
}


