import { createStore } from 'vuex'
import user from './modules/user'
import cart from './modules/cart'
import app from './modules/app'
import { RootState } from '@/types/store'

export default createStore<RootState>({
    modules: {
        user,
        cart,
        app
    }
})

