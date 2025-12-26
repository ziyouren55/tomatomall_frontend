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
import { registerNotificationComponents } from './services/notificationComponentInit'

const app: App = createApp(AppComponent)
app.use(ElementPlus)
app.use(router)
// Vuex 4 的 Store 类型与 Vue 3 的 Plugin 类型兼容，但 TypeScript 需要类型断言
app.use(store as any)

// 恢复用户状态（从localStorage）
try {
  const token = localStorage.getItem('token')
  const userInfoStr = localStorage.getItem('userInfo')

  if (token && userInfoStr) {
    const userInfo = JSON.parse(userInfoStr)
    console.log('Restoring user state:', { token: token.substring(0, 10) + '...', userInfo })
    store.commit('user/SET_TOKEN', token)
    store.commit('user/SET_USER_INFO', userInfo)

    // 验证store状态
    console.log('Store state after restore:', store.state.user)
  } else {
    console.log('No stored user state found')
  }
} catch (e) {
  console.warn('Failed to restore user state:', e)
}

// Register notification components at startup so pages can render history without waiting for websocket init
try {
  // register synchronously so registry is ready before pages mount
  registerNotificationComponents()
} catch (e) {
  console.warn('notification components init failed', e)
}

// initialize notification service non-blocking (does not block app startup)
try {
  const backendBase = (import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080') as string
  import('./services/notificationService').then(module => {
    module.initNotificationService(backendBase)
  }).catch(e => console.warn('notification service init failed', e))
  
  // initialize chat service non-blocking (only if user is logged in)
  import('./services/chatService').then(module => {
    const token = localStorage.getItem('token')
    if (token) {
      module.initChatService(backendBase).catch(e => console.warn('chat service init failed', e))
    }
  }).catch(e => console.warn('chat service dynamic import failed', e))
} catch (e) {
  console.warn('services dynamic import failed', e)
}

app.mount('#app')




