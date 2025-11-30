import { UserInfo } from './api'

/**
 * User Store State
 */
export interface UserState {
    token: string
    userInfo: UserInfo | null
    isAdmin: boolean
}

/**
 * App Store State
 */
export interface AppState {
    loading: boolean
    error: string | null
}

/**
 * Cart Item
 */
export interface CartItem {
    id: number
    quantity: number
    [key: string]: any
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
 * Root State
 */
export interface RootState {
    user: UserState
    app: AppState
    cart: CartState
}

