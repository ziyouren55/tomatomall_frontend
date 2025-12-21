import { RouteRecordRaw } from 'vue-router'

/**
 * 管理员路由
 */
const adminRoutes: RouteRecordRaw[] = [
    {
        path: '/warehouse',
        name: 'Warehouse',
        component: () => import('@/views/admin/AdminWarehousePage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/coupons',
        component: () => import('@/views/admin/AdminCouponPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: '',
                component: () => import('@/components/business/admin/coupon/CouponList.vue')
            },
            {
                path: 'create',
                component: () => import('@/components/business/admin/coupon/CouponForm.vue')
            },
            {
                path: 'edit/:id',
                component: () => import('@/components/business/admin/coupon/CouponForm.vue'),
                props: true
            },
            {
                path: ':id',
                component: () => import('@/components/business/admin/coupon/CouponDetail.vue'),
                props: true
            },
            {
                path: 'user',
                component: () => import('@/components/business/admin/coupon/UserCoupons.vue')
            },
            {
                path: 'issue',
                component: () => import('@/components/business/admin/coupon/IssueCouponForm.vue')
            }
        ]
    },
    {
        path: '/admin/member',
        name: 'adminmember',
        component: () => import('@/views/admin/AdminMember.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    }
    ,
    {
        path: '/admin/stores',
        name: 'AdminStores',
        component: () => import('@/views/admin/AdminStoreManagePage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    }
    ,
    {
        path: '/admin/stockpiles',
        name: 'AdminStockpiles',
        component: () => import('@/components/business/admin/stockpile/AdminStockPileManager.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    }
]

export default adminRoutes




