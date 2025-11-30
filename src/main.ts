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
app.use(store)
app.mount('#app')

