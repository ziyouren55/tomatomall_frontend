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
app.mount('#app')




