/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'vuex' {
    export interface Module<S, R> {
        namespaced?: boolean
        state?: S | (() => S)
        getters?: any
        actions?: any
        mutations?: any
        modules?: any
    }

    export interface ActionContext<S, R> {
        dispatch: any
        commit: any
        state: S
        getters: any
        rootState: R
        rootGetters: any
    }

    export function mapActions(namespace: string, map: string[] | Record<string, string | Function>): any
    export function mapActions(map: string[] | Record<string, string | Function>): any
    export function mapGetters(map: string[] | Record<string, string>): any
    export function mapMutations(map: string[] | Record<string, string | Function>): any
    export function mapState(map: string[] | Record<string, string | Function>): any

    export class Store<S> {
        constructor(options: any)
        state: S
        getters: any
        commit: any
        dispatch: any
    }

    export function createStore<S>(options: any): Store<S>

    export default Store
}

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    // 可以添加更多环境变量类型
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

