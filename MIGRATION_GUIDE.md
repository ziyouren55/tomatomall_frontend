# 迁移指南：从 origin 到 changed

本文档说明如何将代码从 `origin` 迁移到重构后的 `changed` 目录。

## 📋 主要变更

### 1. 技术栈升级

**重要变更**：
- ✅ **JavaScript → TypeScript**: 所有代码已迁移到 TypeScript
- ✅ 添加了完整的类型定义 (`src/types/`)
- ✅ 配置了 TypeScript 编译选项 (`tsconfig.json`)
- ✅ 添加了 Vuex 类型声明 (`src/env.d.ts`)

### 2. API 调用方式变更

**旧方式** (`origin/src/api/services.js`):
```javascript
import services from '../api/services'
// 或者
import { userService, ProductService } from '../api/services'

// 使用
services.cart.getCartItems()
userService.login(username, password)
```

**新方式** (`changed/src/api/index.ts`):
```typescript
import api from '@/api'

// 使用
api.cart.getCartItems()
api.user.login(username, password)
```

### 3. 组件导入路径变更

**旧路径**:
```javascript
import ProductList from '../components/ProductList.vue'
import NavigationBar from '../components/NavigationBar.vue'
```

**新路径**:
```typescript
// 通用组件
import NavigationBar from '@/components/common/NavigationBar.vue'
import SearchBar from '@/components/common/SearchBar.vue'

// 业务组件
import ProductList from '@/components/business/product/ProductList.vue'
import ProductDetailCard from '@/components/business/product/ProductDetailCard.vue'
```

### 4. 页面导入路径变更

**旧路径** (`origin/src/pages/`):
```javascript
import IndexPage from '../pages/IndexPage.vue'
import LoginPage from '../pages/LoginPage.vue'
```

**新路径** (`changed/src/views/`):
```typescript
// 路由中使用懒加载（推荐）
component: () => import('@/views/home/IndexPage.vue')
component: () => import('@/views/auth/LoginPage.vue')

// 或者直接导入
import IndexPage from '@/views/home/IndexPage.vue'
import LoginPage from '@/views/auth/LoginPage.vue'
```

### 5. 状态管理变更

**旧方式** (组件内管理):
```javascript
// 在组件中直接使用 localStorage
const token = localStorage.getItem('token')
localStorage.setItem('token', newToken)
```

**新方式** (使用 Vuex):
```typescript
// 在组件中
import { useStore } from 'vuex'
import { mapGetters, mapActions } from 'vuex'

// Composition API
const store = useStore()
const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])
await store.dispatch('user/login', { username, password })

// Options API
export default {
  computed: {
    ...mapGetters('user', ['isLoggedIn', 'isAdmin']),
    ...mapGetters('cart', ['cartItemCount'])
  },
  methods: {
    ...mapActions('user', ['login', 'logout']),
    ...mapActions('cart', ['fetchCartItems'])
  }
}
```

### 6. 路由配置变更

**旧方式** (`origin/src/router/index.js`):
```javascript
import IndexPage from '../pages/IndexPage.vue'
import LoginPage from '../pages/LoginPage.vue'

const routes = [
  { path: '/', component: IndexPage },
  { path: '/login', component: LoginPage }
]
```

**新方式** (`changed/src/router/routes/`):
```typescript
// routes/user.ts
export default [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/IndexPage.vue'),
    meta: { requiresAuth: true }
  }
]

// routes/public.ts
export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue')
  }
]
```

## 🔧 需要更新的文件列表

### 页面文件 (views/)

需要更新以下文件中的导入路径：

1. `views/home/IndexPage.vue` ✅ (已更新)
2. `views/auth/LoginPage.vue` ✅ (已更新)
3. `views/auth/RegisterPage.vue` - 需要更新 API 导入
4. `views/user/ProfilePage.vue` - 需要更新 API 和 store
5. `views/user/UserMember.vue` - 需要更新 API 导入
6. `views/product/ProductDetail.vue` - 需要更新 API 和组件导入
7. `views/cart/CartPage.vue` - 需要更新 API 和 store
8. `views/order/OrderPage.vue` - 需要更新 API 导入
9. `views/coupon/CouponDetailPage.vue` - 需要更新 API 导入
10. `views/review/BookCommentPage.vue` - 需要更新 API 和组件导入
11. `views/advertisement/AdvertisementPage.vue` - 需要更新 API 和组件导入
12. `views/admin/WarehousePage.vue` - 需要更新 API 和组件导入
13. `views/admin/AdminCouponPage.vue` - 需要更新组件导入
14. `views/admin/AdminMember.vue` - 需要更新 API 导入

### 组件文件 (components/)

需要更新以下文件中的导入路径：

1. `components/business/product/ProductList.vue` - 需要更新 API 导入
2. `components/business/product/ProductDetailCard.vue` - 需要更新 API 导入
3. `components/business/product/ProductForm.vue` - 需要更新 API 导入
4. `components/business/product/AdminProductManager.vue` - 需要更新 API 导入
5. `components/business/product/StockPileManager.vue` - 需要更新 API 导入
6. `components/business/coupon/*` - 需要更新 API 导入
7. `components/business/review/BookCommentList.vue` - 需要更新 API 导入
8. `components/business/advertisement/AdvertisementList.vue` - 需要更新 API 导入
9. `components/business/admin/coupon/*` - 需要更新 API 导入

## 📝 更新步骤

### 步骤 1: 添加 TypeScript 类型支持

在迁移到 TypeScript 时，需要：

1. **添加类型定义**：
```typescript
// 在组件中定义接口
interface LoginForm {
  username: string
  password: string
}

interface ApiResponse<T = any> {
  code: string
  msg: string
  data: T
}
```

2. **使用类型注解**：
```typescript
// 函数参数和返回值
async function login(credentials: LoginForm): Promise<ApiResponse> {
  // ...
}
```

### 步骤 2: 更新 API 导入

在所有文件中，将：
```javascript
import services from '../api/services'
// 或
import { userService } from '../api/services'
```

替换为：
```typescript
import api from '@/api'
```

然后更新调用：
```typescript
// 旧: services.cart.getCartItems()
// 新: api.cart.getCartItems()

// 旧: userService.login(username, password)
// 新: api.user.login(username, password)
```

### 步骤 3: 更新组件导入

将所有组件导入路径更新为新的目录结构：
```typescript
// 旧: import ProductList from '../components/ProductList.vue'
// 新: import ProductList from '@/components/business/product/ProductList.vue'
```

### 步骤 4: 更新页面导入

在路由文件中，使用懒加载：
```typescript
// 旧: import IndexPage from '../pages/IndexPage.vue'
// 新: component: () => import('@/views/home/IndexPage.vue')
```

### 步骤 5: 使用 Vuex Store

在需要状态管理的组件中：
```typescript
// 添加
import { mapGetters, mapActions } from 'vuex'

// 在 computed 中使用
computed = {
  ...mapGetters('user', ['isLoggedIn', 'isAdmin']),
  ...mapGetters('cart', ['cartItemCount'])
}

// 在 methods 中使用
methods = {
  ...mapActions('user', ['login', 'logout']),
  ...mapActions('cart', ['fetchCartItems', 'addToCart'])
}
```

### 步骤 6: 更新工具函数

如果使用了本地存储，使用新的工具函数：
```typescript
// 旧: localStorage.getItem('token')
// 新: import { getToken } from '@/utils/storage'
//     const token = getToken()
```

## ✅ 验证清单

完成迁移后，请验证：

- [ ] 所有页面能正常访问
- [ ] 登录功能正常
- [ ] API 调用正常
- [ ] 购物车功能正常
- [ ] 路由跳转正常
- [ ] 状态管理生效
- [ ] 组件正常显示
- [ ] 没有控制台错误

## 🐛 常见问题

### 问题 1: 找不到模块 '@/api'

**解决**: 确保 `vite.config.ts` 中配置了路径别名：
```typescript
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

同时确保 `tsconfig.json` 中配置了路径映射：
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 问题 2: Store 未定义

**解决**: 确保在 `main.ts` 中注册了 store：
```typescript
import store from './store'
app.use(store)
```

### 问题 3: 路由守卫不生效

**解决**: 确保在 `router/index.ts` 中调用了 `setupRouterGuards(router)`

### 问题 4: TypeScript 类型错误

**常见错误及解决方案**：

1. **Vuex 类型错误**：
   - 已在 `src/env.d.ts` 中添加 Vuex 类型声明
   - 如果仍有错误，使用 `(mapActions as any)` 临时解决

2. **Vue 组件类型错误**：
   - 确保使用 `defineComponent` 定义组件
   - 为 props 和 data 添加类型注解

3. **API 响应类型错误**：
   - 使用 `as any` 处理灵活的响应结构
   - 或定义更精确的接口类型

## 📚 参考

- [Vue 3 文档](https://vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Vuex 文档](https://vuex.vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vue 3 + TypeScript 指南](https://vuejs.org/guide/typescript/overview.html)

