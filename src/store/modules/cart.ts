import { Module, ActionContext } from 'vuex'
import api from '@/api'
import { CartState, RootState } from '@/types/store'
import { ApiResponse } from '@/types/api'
import { CartItem } from '@/types/store'

interface CartItemsResponse {
    items?: CartItem[]
    total?: number
}

const cartModule: Module<CartState, RootState> = {
    namespaced: true,

    state: {
        cartItems: [],
        cartTotal: 0,
        loading: false
    },

    mutations: {
        SET_CART_ITEMS(state: CartState, items: CartItem[] | any) {
            state.cartItems = Array.isArray(items) ? items : []
        },

        SET_CART_TOTAL(state: CartState, total: number) {
            state.cartTotal = total || 0
        },

        SET_LOADING(state: CartState, loading: boolean) {
            state.loading = loading
        },

        ADD_CART_ITEM(state: CartState, item: CartItem) {
            const existingItem = state.cartItems.find(i => i.id === item.id)
            if (existingItem) {
                existingItem.quantity += item.quantity
            } else {
                state.cartItems.push(item)
            }
        },

        UPDATE_CART_ITEM(state: CartState, { id, quantity }: { id: number; quantity: number }) {
            const item = state.cartItems.find(i => i.id === id)
            if (item) {
                item.quantity = quantity
            }
        },

        REMOVE_CART_ITEM(state: CartState, id: number) {
            state.cartItems = state.cartItems.filter(i => i.id !== id)
        },

        CLEAR_CART(state: CartState) {
            state.cartItems = []
            state.cartTotal = 0
        }
    },

    actions: {
        async fetchCartItems({ commit }: ActionContext<CartState, RootState>): Promise<ApiResponse<CartItemsResponse | CartItem[]>> {
            commit('SET_LOADING', true)
            try {
                const res = await api.cart.getCartItems()
                if (res && res.data) {
                    // 处理 response.data 可能是数组或对象的情况
                    const data = res.data as any
                    const items = Array.isArray(data) ? data : (data.items || data.cartItems || [])
                    // 确保 items 是数组
                    commit('SET_CART_ITEMS', Array.isArray(items) ? items : [])
                    const total = Array.isArray(data) ? data.length : (data.total || 0)
                    commit('SET_CART_TOTAL', total)
                } else {
                    // 如果没有数据，设置为空数组
                    commit('SET_CART_ITEMS', [])
                    commit('SET_CART_TOTAL', 0)
                }
                return res as ApiResponse<CartItemsResponse | CartItem[]>
            } catch (error: unknown) {
                console.error('Fetch cart items error:', error)
                // 出错时也确保是空数组
                commit('SET_CART_ITEMS', [])
                commit('SET_CART_TOTAL', 0)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        async addToCart({ dispatch }: ActionContext<CartState, RootState>, { productId, quantity }: { productId: number; quantity: number }): Promise<ApiResponse<any>> {
            try {
                const res = await api.cart.addToCart(productId, quantity)
                // 添加成功后重新获取购物车列表
                await dispatch('fetchCartItems')
                return res
            } catch (error: unknown) {
                console.error('Add to cart error:', error)
                throw error
            }
        },

        async updateCartItem({ dispatch }: ActionContext<CartState, RootState>, { cartItemId, quantity }: { cartItemId: number; quantity: number }): Promise<ApiResponse<any>> {
            try {
                const res = await api.cart.updateCartItemQuantity(cartItemId, quantity)
                await dispatch('fetchCartItems')
                return res
            } catch (error: unknown) {
                console.error('Update cart item error:', error)
                throw error
            }
        },

        async removeCartItem({ dispatch }: ActionContext<CartState, RootState>, cartItemId: number): Promise<ApiResponse<any>> {
            try {
                const res = await api.cart.removeCartItem(cartItemId)
                await dispatch('fetchCartItems')
                return res
            } catch (error: unknown) {
                console.error('Remove cart item error:', error)
                throw error
            }
        },

        async checkout({ commit }: ActionContext<CartState, RootState>, orderData: any): Promise<ApiResponse<any>> {
            try {
                const res = await api.cart.checkout(orderData)
                // 结算成功后清空购物车
                commit('CLEAR_CART')
                return res
            } catch (error: unknown) {
                console.error('Checkout error:', error)
                throw error
            }
        }
    },

    getters: {
        cartItems: (state: CartState) => Array.isArray(state.cartItems) ? state.cartItems : [],
        cartTotal: (state: CartState) => state.cartTotal,
        cartItemCount: (state: CartState) => {
            const items = Array.isArray(state.cartItems) ? state.cartItems : []
            return items.reduce((sum, item) => sum + (item.quantity || 0), 0)
        },
        isLoading: (state: CartState) => state.loading
    }
}

export default cartModule

