import { createStore, Store } from 'vuex'
import userModule from './modules/user'
import cartModule from './modules/cart'
import appModule from './modules/app'
import { RootState } from '@/types/store'

const store: Store<RootState> = createStore<RootState>({
    modules: {
        user: userModule,
        cart: cartModule,
        app: appModule
    }
})

export default store

