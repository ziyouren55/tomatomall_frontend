import { RouteRecordRaw } from 'vue-router'

/**
 * 用户路由（需要登录）
 */
const userRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/home/IndexPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/product/:id',
        name: 'productdetail',
        component: () => import('@/views/product/ProductDetail.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/user/ProfilePage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/cart',
        name: 'Cart',
        component: () => import('@/views/cart/CartPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/order/OrderPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/bookcomment',
        name: 'BookReview',
        component: () => import('@/views/review/BookCommentPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/advertisement',
        name: 'advertisement',
        component: () => import('@/views/advertisement/AdvertisementPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/coupon/:id',
        name: 'CouponDetail',
        component: () => import('@/views/coupon/CouponDetailPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/member',
        name: 'usermember',
        component: () => import('@/views/user/UserMember.vue'),
        meta: { requiresAuth: true }
    }
]

export default userRoutes




