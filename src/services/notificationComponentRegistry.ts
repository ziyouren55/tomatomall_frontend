import { Component } from 'vue'

const registry = new Map<string, Component>()

export function registerNotificationComponent(type: string, comp: Component) {
  if (!type || !comp) return
  registry.set(type, comp)
}

export function getNotificationComponent(type: string): Component | undefined {
  return registry.get(type)
}

export function clearNotificationRegistry() {
  registry.clear()
}


