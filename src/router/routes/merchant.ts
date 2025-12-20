import { RouteRecordRaw } from 'vue-router'

const merchantRoutes: RouteRecordRaw[] = [
    {
        path: '/merchant/stores',
        name: 'MerchantStoreList',
        component: () => import('@/views/merchant/StoreList.vue'),
        meta: { requiresAuth: true, role: 'MERCHANT' }
    },
    {
        path: '/merchant/stores/new',
        name: 'MerchantStoreCreate',
        component: () => import('@/views/merchant/StoreEdit.vue'),
        meta: { requiresAuth: true, role: 'MERCHANT' }
    },
    {
        path: '/merchant/stores/:id',
        name: 'MerchantStoreDetail',
        component: () => import('@/views/merchant/StoreEdit.vue'),
        meta: { requiresAuth: true, role: 'MERCHANT' }
    },
    {
        path: '/merchant/stores/:id/edit',
        name: 'MerchantStoreEdit',
        component: () => import('@/views/merchant/StoreEdit.vue'),
        meta: { requiresAuth: true, role: 'MERCHANT' }
    }
]

export default merchantRoutes


