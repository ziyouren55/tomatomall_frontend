import { Module, ActionContext } from 'vuex'
import { AppState, RootState } from '@/types/store'

const appModule: Module<AppState, RootState> = {
    namespaced: true,

    state: {
        loading: false,
        error: null
    },

    mutations: {
        SET_LOADING(state: AppState, loading: boolean) {
            state.loading = loading
        },

        SET_ERROR(state: AppState, error: string | null) {
            state.error = error
        },

        CLEAR_ERROR(state: AppState) {
            state.error = null
        }
    },

    actions: {
        setLoading({ commit }: ActionContext<AppState, RootState>, loading: boolean) {
            commit('SET_LOADING', loading)
        },

        setError({ commit }: ActionContext<AppState, RootState>, error: string | null) {
            commit('SET_ERROR', error)
        },

        clearError({ commit }: ActionContext<AppState, RootState>) {
            commit('CLEAR_ERROR')
        }
    },

    getters: {
        isLoading: (state: AppState) => state.loading,
        error: (state: AppState) => state.error
    }
}

export default appModule

