# TomatoMall 前端架构文档

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [核心架构设计](#核心架构设计)
5. [API 层设计](#api-层设计)
6. [状态管理设计](#状态管理设计)
7. [路由设计](#路由设计)
8. [类型系统](#类型系统)
9. [工具函数](#工具函数)
10. [开发规范](#开发规范)

---

## 项目概述

TomatoMall 是一个基于 Vue 3 + TypeScript 的电商前端项目，采用现代化的前端架构设计，提供完整的类型安全、模块化组织和可维护的代码结构。

### 核心特性

- ✅ **TypeScript 全面支持**: 所有源代码使用 TypeScript，提供完整的类型安全
- ✅ **模块化架构**: 按业务模块组织代码，易于维护和扩展
- ✅ **统一 API 管理**: 集中管理 API 请求，统一错误处理和响应拦截
- ✅ **Vuex 状态管理**: 集中管理应用状态，支持模块化状态管理
- ✅ **路由模块化**: 按功能模块拆分路由配置，支持懒加载
- ✅ **组件分类**: 区分通用组件和业务组件，提高代码复用性

---

## 技术栈

### 核心框架

- **Vue 3.5.13**: 渐进式 JavaScript 框架，使用 Composition API
- **TypeScript**: 提供类型安全和更好的开发体验
- **Vite 6.3.3**: 下一代前端构建工具，提供快速的开发体验

### 状态管理

- **Vuex 4.1.0**: 集中式状态管理，支持模块化设计

### 路由

- **Vue Router 4.5.0**: 官方路由管理器，支持懒加载和路由守卫

### UI 框架

- **Element Plus 2.9.7**: Vue 3 组件库
- **Bootstrap 5.3.6**: CSS 框架
- **Lucide Vue Next 0.519.0**: 图标库

### HTTP 客户端

- **Axios 1.9.0**: 基于 Promise 的 HTTP 客户端

---

## 项目结构

```
changed/
├── public/                          # 静态资源
├── src/
│   ├── api/                         # API 层
│   │   ├── config/
│   │   │   └── request.ts          # Axios 配置和拦截器
│   │   ├── modules/                 # API 模块（按业务分类）
│   │   │   ├── user.ts             # 用户相关 API
│   │   │   ├── product.ts          # 产品相关 API
│   │   │   ├── cart.ts             # 购物车相关 API
│   │   │   ├── order.ts            # 订单相关 API
│   │   │   ├── coupon.ts           # 优惠券相关 API
│   │   │   ├── member.ts           # 会员相关 API
│   │   │   ├── advertisement.ts    # 广告相关 API
│   │   │   ├── review.ts           # 书评相关 API
│   │   │   └── forum.ts            # 论坛相关 API
│   │   └── index.ts                # API 统一导出
│   │
│   ├── assets/                      # 资源文件
│   │   └── styles/                  # 样式文件
│   │       ├── base.css            # 基础样式
│   │       └── main.css             # 主样式
│   │
│   ├── components/                  # 组件目录
│   │   ├── common/                  # 通用组件
│   │   │   ├── NavigationBar.vue   # 导航栏
│   │   │   └── SearchBar.vue       # 搜索栏
│   │   └── business/               # 业务组件（按模块分类）
│   │       ├── product/            # 产品相关组件
│   │       ├── cart/               # 购物车相关组件
│   │       ├── coupon/             # 优惠券相关组件
│   │       ├── review/             # 书评相关组件
│   │       ├── advertisement/      # 广告相关组件
│   │       └── admin/              # 管理员相关组件
│   │
│   ├── views/                       # 页面视图（按模块分类）
│   │   ├── home/                   # 首页
│   │   ├── auth/                   # 认证页面
│   │   ├── product/                # 产品页面
│   │   ├── cart/                   # 购物车页面
│   │   ├── order/                  # 订单页面
│   │   ├── coupon/                 # 优惠券页面
│   │   ├── review/                 # 书评页面
│   │   ├── advertisement/          # 广告页面
│   │   ├── user/                   # 用户页面
│   │   └── admin/                  # 管理员页面
│   │
│   ├── router/                      # 路由配置
│   │   ├── routes/                 # 路由模块
│   │   │   ├── index.ts           # 路由入口
│   │   │   ├── public.ts          # 公开路由
│   │   │   ├── user.ts            # 用户路由
│   │   │   └── admin.ts           # 管理员路由
│   │   ├── guards.ts               # 路由守卫
│   │   └── index.ts                # 路由主文件
│   │
│   ├── store/                       # Vuex 状态管理
│   │   ├── modules/                # Store 模块
│   │   │   ├── user.ts            # 用户状态模块
│   │   │   ├── cart.ts            # 购物车状态模块
│   │   │   └── app.ts             # 应用状态模块
│   │   └── index.ts                # Store 入口
│   │
│   ├── types/                       # TypeScript 类型定义
│   │   ├── api.ts                  # API 类型定义
│   │   └── store.ts                # Store 类型定义
│   │
│   ├── utils/                       # 工具函数
│   │   ├── storage.ts              # 本地存储封装
│   │   ├── auth.ts                 # 认证工具函数
│   │   └── constants.ts            # 常量定义
│   │
│   ├── env.d.ts                     # 全局类型声明
│   ├── App.vue                      # 根组件
│   └── main.ts                      # 应用入口
│
├── .env.development                 # 开发环境变量
├── .env.production                  # 生产环境变量
├── package.json                     # 项目配置
├── vite.config.ts                   # Vite 配置
├── tsconfig.json                    # TypeScript 配置
├── tsconfig.node.json               # TypeScript Node 配置
└── index.html                       # HTML 模板
```

### 目录说明

#### `/src/api`
API 层负责所有与后端的数据交互，采用模块化设计：
- `config/request.ts`: 统一的 Axios 实例配置，包含请求/响应拦截器
- `modules/*.ts`: 按业务模块拆分的 API 方法
- `index.ts`: 统一导出所有 API 模块

#### `/src/components`
组件目录分为两类：
- `common/`: 通用组件，可在多个页面复用
- `business/`: 业务组件，按功能模块分类

#### `/src/views`
页面视图目录，按业务模块组织，每个模块包含相关的页面组件。

#### `/src/router`
路由配置采用模块化设计：
- `routes/`: 按功能模块拆分路由配置
- `guards.ts`: 路由守卫，处理权限验证和导航控制

#### `/src/store`
Vuex 状态管理，采用模块化设计：
- `modules/`: 按业务模块拆分状态管理
- 每个模块独立管理自己的状态、mutations、actions 和 getters

#### `/src/types`
TypeScript 类型定义，集中管理所有类型：
- `api.ts`: API 请求和响应的类型定义
- `store.ts`: Store 状态的类型定义

#### `/src/utils`
工具函数目录，提供通用的工具方法。

---

## 核心架构设计

### 架构分层

项目采用分层架构设计，从上到下分为：

1. **视图层 (Views)**: 页面组件，负责用户界面展示
2. **组件层 (Components)**: 可复用的 UI 组件
3. **状态管理层 (Store)**: Vuex 集中管理应用状态
4. **路由层 (Router)**: 路由配置和导航控制
5. **API 层 (API)**: 与后端服务的数据交互
6. **工具层 (Utils)**: 通用工具函数

### 数据流向

```
用户操作
  ↓
视图组件 (Views)
  ↓
触发 Action (Store)
  ↓
调用 API (API Layer)
  ↓
更新 State (Store)
  ↓
响应式更新视图 (Views)
```

### 模块化设计原则

1. **按业务模块拆分**: 每个业务模块包含相关的 API、组件、页面和状态管理
2. **高内聚低耦合**: 模块内部功能紧密相关，模块之间依赖最小化
3. **统一接口**: API 层提供统一的调用接口和错误处理
4. **类型安全**: 所有模块都有完整的 TypeScript 类型定义

---

## API 层设计

### 设计原则

API 层采用统一管理、模块化组织的设计原则：

1. **统一配置**: 所有 API 请求使用同一个 Axios 实例，统一配置 baseURL、timeout 等
2. **统一拦截**: 请求拦截器自动添加 token，响应拦截器统一处理错误
3. **模块化组织**: 按业务模块拆分 API 方法，便于维护和扩展
4. **类型安全**: 所有 API 方法都有完整的 TypeScript 类型定义

### Axios 配置

`src/api/config/request.ts` 是 API 层的核心配置文件：

```typescript
// 创建 axios 实例
const request: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})
```

**请求拦截器**：
- 自动从本地存储获取 token
- 在请求头中添加 token（如果存在）

**响应拦截器**：
- 直接返回 `response.data`，简化数据获取
- 统一处理 401 未授权错误，自动清除 token 并跳转登录页
- 统一错误处理和日志记录

### API 模块组织

API 模块按业务功能拆分，每个模块对应一个业务领域：

- `user.ts`: 用户相关 API（登录、注册、用户信息）
- `product.ts`: 产品相关 API（产品列表、详情、搜索）
- `cart.ts`: 购物车相关 API（添加、更新、删除、结算）
- `order.ts`: 订单相关 API（订单列表、详情、创建）
- `coupon.ts`: 优惠券相关 API（优惠券列表、使用）
- `member.ts`: 会员相关 API（会员信息、积分）
- `advertisement.ts`: 广告相关 API（广告列表、管理）
- `review.ts`: 书评相关 API（书评列表、创建、删除）
- `forum.ts`: 论坛相关 API（帖子、评论）

### API 使用示例

```typescript
// 统一导入
import api from '@/api'

// 用户登录
const response = await api.user.login(username, password)

// 获取产品列表
const products = await api.product.getAllProducts()

// 添加到购物车
await api.cart.addToCart(productId, quantity)
```

### 类型定义

所有 API 方法都有完整的类型定义，定义在 `src/types/api.ts`：

- `ApiResponse<T>`: 统一的 API 响应结构
- `LoginResponse`: 登录响应类型
- `UserInfo`: 用户信息类型
- 其他业务相关的类型定义

---

## 状态管理设计

### Vuex 模块化架构

项目使用 Vuex 4 进行状态管理，采用模块化设计，每个业务模块有独立的状态管理：

```
store/
├── index.ts          # Store 入口，注册所有模块
└── modules/
    ├── user.ts       # 用户状态模块
    ├── cart.ts       # 购物车状态模块
    └── app.ts        # 应用全局状态模块
```

### 模块设计规范

每个 Vuex 模块包含以下部分：

1. **State**: 定义模块的状态数据结构
2. **Mutations**: 同步修改状态的方法
3. **Actions**: 异步操作，通常调用 API 并提交 mutations
4. **Getters**: 计算属性，用于派生状态

### User 模块

`store/modules/user.ts` 管理用户相关的状态：

**State**:
```typescript
{
    token: string              // 用户 token
    userInfo: UserInfo | null  // 用户信息
    isAdmin: boolean          // 是否为管理员
}
```

**主要 Actions**:
- `login`: 用户登录，保存 token 和用户信息
- `logout`: 用户登出，清除所有认证信息
- `fetchUserInfo`: 获取用户详细信息
- `updateUserInfo`: 更新用户信息

**主要 Getters**:
- `isLoggedIn`: 判断用户是否已登录
- `currentUser`: 获取当前用户信息

### Cart 模块

`store/modules/cart.ts` 管理购物车状态：

**State**:
```typescript
{
    cartItems: CartItem[]    // 购物车商品列表
    cartTotal: number        // 购物车总金额
    loading: boolean         // 加载状态
}
```

**主要 Actions**:
- `fetchCartItems`: 获取购物车列表
- `addToCart`: 添加商品到购物车
- `updateCartItem`: 更新购物车商品数量
- `removeCartItem`: 删除购物车商品
- `checkout`: 结算购物车

**主要 Getters**:
- `cartItems`: 获取购物车商品列表
- `cartItemCount`: 计算购物车商品总数量
- `cartTotal`: 获取购物车总金额

### App 模块

`store/modules/app.ts` 管理应用全局状态：

**State**:
```typescript
{
    loading: boolean         // 全局加载状态
    error: string | null     // 全局错误信息
}
```

**主要 Actions**:
- `setLoading`: 设置全局加载状态
- `setError`: 设置全局错误信息
- `clearError`: 清除错误信息

### 类型安全

所有 Store 模块都有完整的 TypeScript 类型定义：

- `UserState`: 用户模块状态类型
- `CartState`: 购物车模块状态类型
- `AppState`: 应用模块状态类型
- `RootState`: 根状态类型，包含所有模块

### 使用示例

```typescript
// 在组件中使用
import { useStore } from 'vuex'

const store = useStore()

// 获取状态
const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])
const cartItems = computed(() => store.getters['cart/cartItems'])

// 调用 Action
await store.dispatch('user/login', { username, password })
await store.dispatch('cart/addToCart', { productId, quantity })
```

---

## 路由设计

### 路由模块化组织

路由配置采用模块化设计，按功能分类：

```
router/
├── index.ts          # 路由主文件，创建 Router 实例
├── guards.ts         # 路由守卫
└── routes/
    ├── index.ts      # 路由入口，合并所有路由
    ├── public.ts     # 公开路由（无需登录）
    ├── user.ts       # 用户路由（需要登录）
    └── admin.ts      # 管理员路由（需要管理员权限）
```

### 路由分类

#### 公开路由 (`routes/public.ts`)

无需登录即可访问的路由：
- `/login`: 登录页面
- `/register`: 注册页面
- `/home`: 首页（可能包含产品展示）

#### 用户路由 (`routes/user.ts`)

需要登录才能访问的路由，包含 `meta: { requiresAuth: true }`：
- `/profile`: 用户个人中心
- `/cart`: 购物车页面
- `/order`: 订单列表
- `/product/:id`: 产品详情
- 其他用户功能页面

#### 管理员路由 (`routes/admin.ts`)

需要管理员权限才能访问的路由，包含 `meta: { requiresAuth: true, requiresAdmin: true }`：
- `/admin/dashboard`: 管理后台首页
- `/admin/products`: 产品管理
- `/admin/orders`: 订单管理
- `/admin/advertisements`: 广告管理
- 其他管理功能页面

### 路由守卫

`router/guards.ts` 实现了路由守卫功能：

**功能**：
1. **认证检查**: 检查路由是否需要登录（`meta.requiresAuth`）
2. **权限验证**: 检查用户是否已登录（通过 Vuex store）
3. **自动重定向**: 未登录用户访问受保护路由时，自动跳转到登录页

**实现逻辑**：
```typescript
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const isLoggedIn = store.getters['user/isLoggedIn']

    if (requiresAuth && !isLoggedIn) {
        next('/login')
    } else {
        next()
    }
})
```

### 路由懒加载

所有路由组件都使用懒加载，提高首屏加载速度：

```typescript
{
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue')
}
```

### 路由元信息

使用 `meta` 字段存储路由的元信息：

```typescript
{
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/ProfilePage.vue'),
    meta: {
        requiresAuth: true,      // 需要登录
        title: '个人中心'         // 页面标题
    }
}
```

### 路由命名规范

路由名称使用 PascalCase，与组件名称保持一致：
- `Login`: 登录页
- `Register`: 注册页
- `Profile`: 个人中心
- `Cart`: 购物车
- `ProductDetail`: 产品详情

---

## 类型系统

### TypeScript 类型定义组织

项目采用 TypeScript 提供完整的类型安全，所有类型定义集中在 `src/types` 目录：

```
types/
├── api.ts      # API 相关类型定义
└── store.ts    # Store 状态类型定义
```

### API 类型定义 (`types/api.ts`)

#### 基础响应类型

```typescript
/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
    code: string
    msg?: string
    data: T
}
```

所有 API 响应都遵循这个统一的结构，`T` 为泛型参数，表示实际的数据类型。

#### 用户相关类型

```typescript
/**
 * 用户信息
 */
export interface UserInfo {
    id?: number
    username: string
    email?: string
    role?: 'ADMIN' | 'USER'
    [key: string]: any
}

/**
 * 登录响应
 */
export interface LoginResponse {
    code: string
    msg?: string
    data: string // token 字符串
}

/**
 * 用户详情响应
 */
export interface UserDetailsResponse {
    code: string
    msg?: string
    data: UserInfo
}
```

#### 业务类型定义

项目还定义了其他业务相关的类型：

- `Coupon`: 优惠券类型
- `Advertisement`: 广告数据类型
- `AdvertisementFormData`: 广告表单数据类型

### Store 类型定义 (`types/store.ts`)

#### 模块状态类型

```typescript
/**
 * User Store State
 */
export interface UserState {
    token: string
    userInfo: UserInfo | null
    isAdmin: boolean
}

/**
 * Cart Store State
 */
export interface CartState {
    cartItems: CartItem[]
    cartTotal: number
    loading: boolean
}

/**
 * App Store State
 */
export interface AppState {
    loading: boolean
    error: string | null
}
```

#### 根状态类型

```typescript
/**
 * Root State
 */
export interface RootState {
    user: UserState
    app: AppState
    cart: CartState
}
```

`RootState` 包含所有模块的状态，用于在组件中访问整个 store 的类型。

### 全局类型声明 (`env.d.ts`)

`src/env.d.ts` 文件包含全局类型声明：

1. **Vue 组件类型声明**:
```typescript
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
```

2. **Vuex 类型声明**:
```typescript
declare module 'vuex' {
    // Vuex 相关类型定义
}
```

3. **环境变量类型**:
```typescript
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
}
```

### 类型使用规范

1. **API 方法类型**: 所有 API 方法都应该有明确的返回类型
2. **组件 Props**: 使用 `defineProps<T>()` 或 `PropType<T>` 定义 props 类型
3. **Store 访问**: 使用 `RootState` 类型确保 store 访问的类型安全
4. **避免使用 `any`**: 尽量使用具体类型，避免使用 `any`

### 类型扩展

当需要扩展类型时：

1. 在对应的类型文件中添加新类型
2. 使用 `interface` 扩展现有类型（使用 `extends` 或交叉类型）
3. 使用泛型提高类型的复用性

---

## 工具函数

### 工具函数组织

工具函数集中在 `src/utils` 目录，按功能分类：

```
utils/
├── storage.ts      # 本地存储封装
├── auth.ts         # 认证工具函数
└── constants.ts    # 常量定义
```

### 本地存储工具 (`utils/storage.ts`)

提供统一的本地存储操作接口，封装 `localStorage` 的使用：

**主要功能**：

1. **Token 管理**:
```typescript
getToken(): string | null          // 获取 token
setToken(token: string | null): void // 设置 token
removeToken(): void                 // 移除 token
```

2. **管理员标识管理**:
```typescript
getAdminFlag(): boolean            // 获取管理员标识
setAdminFlag(isAdmin: boolean): void // 设置管理员标识
removeAdminFlag(): void            // 移除管理员标识
```

3. **清除认证信息**:
```typescript
clearAuth(): void  // 清除所有认证相关信息
```

**设计特点**：
- 统一管理存储键名，避免硬编码
- 提供类型安全的接口
- 简化存储操作，自动处理 null 值

### 认证工具函数 (`utils/auth.ts`)

提供认证相关的工具函数：

**主要功能**：

```typescript
isAuthenticated(): boolean  // 检查用户是否已登录
isAdmin(): boolean          // 检查用户是否为管理员
```

**使用场景**：
- 路由守卫中检查用户认证状态
- 组件中根据权限显示/隐藏功能
- 条件渲染和权限控制

### 常量定义 (`utils/constants.ts`)

集中管理应用中的常量：

**常量分类**：

1. **API 配置**:
```typescript
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
```

2. **应用配置**:
```typescript
export const APP_TITLE: string = import.meta.env.VITE_APP_TITLE || '番茄书城'
```

3. **存储键名**:
```typescript
export const STORAGE_KEYS = {
    TOKEN: 'token',
    ADMIN: 'isAdmin',
    USER_INFO: 'userInfo'
} as const
```

4. **路由名称**:
```typescript
export const ROUTE_NAMES = {
    HOME: 'Home',
    LOGIN: 'Login',
    REGISTER: 'Register',
    PROFILE: 'Profile',
    CART: 'Cart',
    ORDER: 'Order',
    PRODUCT_DETAIL: 'productdetail'
} as const
```

5. **用户角色**:
```typescript
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER'
} as const
```

**设计原则**：
- 使用 `as const` 确保类型推断为字面量类型
- 集中管理，便于维护和修改
- 避免在代码中硬编码字符串

### 工具函数使用示例

```typescript
// 导入工具函数
import { getToken, setToken, clearAuth } from '@/utils/storage'
import { isAuthenticated, isAdmin } from '@/utils/auth'
import { STORAGE_KEYS, ROUTE_NAMES } from '@/utils/constants'

// 使用存储工具
const token = getToken()
setToken('new-token')
clearAuth()

// 使用认证工具
if (isAuthenticated()) {
    // 用户已登录
}

if (isAdmin()) {
    // 用户是管理员
}

// 使用常量
localStorage.setItem(STORAGE_KEYS.TOKEN, token)
router.push({ name: ROUTE_NAMES.LOGIN })
```

---

## 开发规范

### 代码风格规范

#### 命名规范

1. **文件命名**:
   - 组件文件: PascalCase，如 `NavigationBar.vue`
   - 工具文件: camelCase，如 `storage.ts`
   - 类型文件: camelCase，如 `api.ts`

2. **变量命名**:
   - 使用 camelCase: `userName`, `cartItems`
   - 常量使用 UPPER_SNAKE_CASE: `API_BASE_URL`
   - 私有变量使用下划线前缀: `_privateMethod`

3. **函数命名**:
   - 使用 camelCase: `getUserInfo()`, `addToCart()`
   - 布尔值函数使用 `is`/`has` 前缀: `isAuthenticated()`, `hasPermission()`

4. **类型/接口命名**:
   - 使用 PascalCase: `UserInfo`, `ApiResponse<T>`
   - 接口使用 `I` 前缀（可选）: `IUserInfo`

#### TypeScript 规范

1. **类型定义**:
   - 优先使用 `interface` 定义对象类型
   - 使用 `type` 定义联合类型、交叉类型等复杂类型
   - 避免使用 `any`，使用 `unknown` 或具体类型

2. **函数类型**:
   - 明确指定参数和返回值类型
   - 使用泛型提高代码复用性

3. **导入导出**:
   - 使用 ES6 模块语法
   - 优先使用命名导出，默认导出仅用于组件

#### Vue 组件规范

1. **组件结构**:
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 导入
import { ref, computed } from 'vue'

// 类型定义
interface Props {
  // props 定义
}

// Props 和 Emits
const props = defineProps<Props>()
const emit = defineEmits<{
  // events 定义
}>()

// 响应式数据
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
const handleClick = () => {
  // 处理逻辑
}
</script>

<style scoped>
/* 样式 */
</style>
```

2. **Composition API**:
   - 优先使用 `<script setup>` 语法
   - 使用 Composition API 而非 Options API
   - 合理使用 `ref` 和 `reactive`

3. **Props 和 Emits**:
   - 使用 TypeScript 定义 props 类型
   - 明确声明 emits 事件

### 目录组织规范

1. **按功能模块组织**: 相关文件放在同一目录下
2. **组件分类**: 区分通用组件和业务组件
3. **统一导出**: 使用 `index.ts` 统一导出模块内容

### Git 提交规范

使用约定式提交（Conventional Commits）：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat: 添加购物车功能
fix: 修复登录 token 过期问题
refactor: 重构 API 层代码结构
```

### 注释规范

1. **函数注释**: 使用 JSDoc 风格
```typescript
/**
 * 获取用户信息
 * @param userId 用户 ID
 * @returns 用户信息对象
 */
function getUserInfo(userId: number): UserInfo {
    // ...
}
```

2. **复杂逻辑注释**: 对复杂业务逻辑添加注释说明
3. **TODO 注释**: 使用 `// TODO:` 标记待办事项

### 错误处理规范

1. **API 错误**: 统一在响应拦截器中处理
2. **组件错误**: 使用 `try-catch` 捕获异步操作错误
3. **用户提示**: 使用 Element Plus 的消息组件提示用户

### 性能优化规范

1. **路由懒加载**: 所有路由组件使用懒加载
2. **组件懒加载**: 大型组件使用 `defineAsyncComponent`
3. **图片优化**: 使用适当的图片格式和尺寸
4. **避免不必要的响应式**: 使用 `shallowRef` 和 `shallowReactive` 优化性能

### 测试规范

1. **单元测试**: 为工具函数编写单元测试
2. **组件测试**: 为核心组件编写测试用例
3. **E2E 测试**: 为关键业务流程编写端到端测试

---

## 总结

本文档详细介绍了 TomatoMall 前端项目的架构设计、技术栈、代码组织和开发规范。项目采用现代化的前端架构，提供完整的类型安全、模块化组织和可维护的代码结构。

### 核心优势

- ✅ **类型安全**: 全面的 TypeScript 支持
- ✅ **模块化**: 清晰的代码组织和模块划分
- ✅ **可维护性**: 统一的代码规范和最佳实践
- ✅ **可扩展性**: 灵活的架构设计，易于扩展新功能

### 后续优化方向

1. 添加单元测试和 E2E 测试
2. 优化打包体积和加载性能
3. 完善错误监控和日志系统
4. 添加国际化支持

---

*文档版本: 1.0*  
*最后更新: 2024*

