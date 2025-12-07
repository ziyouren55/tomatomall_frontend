/**
 * API 统一导出
 * 使用方式：import api from '@/api'
 * api.user.login()
 * api.product.getAllProducts()
 */
import user from './modules/user'
import product from './modules/product'
import cart from './modules/cart'
import order from './modules/order'
import coupon from './modules/coupon'
import member from './modules/member'
import advertisement from './modules/advertisement'
import review from './modules/review'
import forum from './modules/forum'
import image from './modules/image'

export default {
    user,
    product,
    cart,
    order,
    coupon,
    member,
    advertisement,
    review,
    forum,
    image
}

