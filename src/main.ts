// Polyfills for libraries that expect Node-like globals in browser (e.g. sockjs-client)
;(window as any).global = window
;(window as any).process = { env: {} }
import './assets/styles/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp, App } from 'vue'
import AppComponent from './App.vue'
import router from './router'
import store from './store'

const app: App = createApp(AppComponent)
app.use(ElementPlus)
app.use(router)
// Vuex 4 的 Store 类型与 Vue 3 的 Plugin 类型兼容，但 TypeScript 需要类型断言
app.use(store as any)
// initialize notification service non-blocking (does not block app startup)
try {
  const backendBase = (import.meta.env.VITE_BACKEND_BASE_URL || import.meta.env.VITE_API_BASE_URL || '') as string
  import('./services/notificationService').then(module => {
    module.initNotificationService(backendBase)
  }).catch(e => console.warn('notification service init failed', e))
} catch (e) {
  console.warn('notification service dynamic import failed', e)
}

app.mount('#app')




