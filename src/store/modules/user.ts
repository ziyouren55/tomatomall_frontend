import { Module, ActionContext } from 'vuex'
import api from '@/api'
import { setToken, removeToken, getToken, setAdminFlag, removeAdminFlag } from '@/utils/storage'
import { UserState, RootState } from '@/types/store'
import { LoginResponse, UserDetailsResponse } from '@/types/api'

const userModule: Module<UserState, RootState> = {
    namespaced: true,

    state: {
        token: getToken() || '',
        userInfo: null,
        isAdmin: false
    },

    mutations: {
        SET_TOKEN(state: UserState, token: string) {
            state.token = token
            setToken(token)
        },

        SET_USER_INFO(state: UserState, userInfo: any) {
            state.userInfo = userInfo
            const isAdmin = userInfo?.role === 'ADMIN' || localStorage.getItem('isAdmin') === 'true'
            state.isAdmin = isAdmin
            setAdminFlag(isAdmin)
        },

        LOGOUT(state: UserState) {
            state.token = ''
            state.userInfo = null
            state.isAdmin = false
            removeToken()
            removeAdminFlag()
        }
    },

    actions: {
        async login({ commit }: ActionContext<UserState, RootState>, { username, password }: { username: string; password: string }): Promise<LoginResponse> {
            try {
                const res = await api.user.login(username, password)
                // 响应拦截器已经返回了 response.data，所以 res 的结构是 { code: '200', data: 'token_string' }
                if (res && res.code === '200' && res.data) {
                    // res.data 就是 token 字符串本身
                    commit('SET_TOKEN', res.data)
                }
                return res
            } catch (error: unknown) {
                console.error('Login error:', error)
                throw error
            }
        },

        async getUserDetails({ commit }: ActionContext<UserState, RootState>, username: string): Promise<UserDetailsResponse> {
            try {
                const res = await api.user.getUserDetails(username)
                if (res && res.data) {
                    commit('SET_USER_INFO', res.data)
                }
                return res
            } catch (error: unknown) {
                console.error('Get user details error:', error)
                throw error
            }
        },

        logout({ commit }: ActionContext<UserState, RootState>) {
            commit('LOGOUT')
        }
    },

    getters: {
        isLoggedIn: (state: UserState) => !!state.token,
        isAdmin: (state: UserState) => state.isAdmin,
        userInfo: (state: UserState) => state.userInfo
    }
}

export default userModule

