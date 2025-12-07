import { RouteRecordRaw } from 'vue-router'

/**
 * 管理员路由
 */
const adminRoutes: RouteRecordRaw[] = [
    {
        path: '/warehouse',
        name: 'Warehouse',
        component: () => import('@/views/admin/WarehousePage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/coupons',
        component: () => import('@/views/admin/AdminCouponPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: '',
                component: () => import('@/components/business/admin/coupon/AdminCoupon/CouponList.vue')
            },
            {
                path: 'create',
                component: () => import('@/components/business/admin/coupon/AdminCoupon/CouponForm.vue')
            },
            {
                path: 'edit/:id',
                component: () => import('@/components/business/admin/coupon/AdminCoupon/CouponForm.vue'),
                props: true
            },
            {
                path: ':id',
                component: () => import('@/components/business/admin/coupon/AdminCoupon/CouponDetail.vue'),
                props: true
            },
            {
                path: 'user',
                component: () => import('@/components/business/admin/coupon/AdminCoupon/UserCoupons.vue')
            },
            {
                path: 'issue',
                component: () => import('@/components/business/admin/coupon/AdminCoupon/IssueCouponForm.vue')
            }
        ]
    },
    {
        path: '/admin/member',
        name: 'adminmember',
        component: () => import('@/views/admin/AdminMember.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    }
]

export default adminRoutes




