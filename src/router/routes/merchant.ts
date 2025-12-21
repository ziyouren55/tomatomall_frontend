import { RouteRecordRaw } from 'vue-router'

const merchantRoutes: RouteRecordRaw[] = [
    {
        path: '/merchant/stores',
        name: 'MerchantStoreManagerPage',
        component: () => import('@/views/merchant/MerchantStoreManagerPage.vue'),
        meta: { requiresAuth: true, role: 'MERCHANT' }
    },
    {
        path: '/merchant/stores/new',
        name: 'MerchantStoreCreatePage',
        component: () => import('@/views/merchant/MerchantStoreEditPage.vue'),
        meta: { requiresAuth: true, role: 'MERCHANT' }
    },
    {
        path: '/merchant/stores/:id',
        name: 'MerchantStoreDetailPage',
        component: () => import('@/views/merchant/MerchantStoreEditPage.vue'),
        meta: { requiresAuth: true, role: 'MERCHANT' }
    },
    {
        path: '/merchant/stores/:id/edit',
        name: 'MerchantStoreEditPage',
        component: () => import('@/views/merchant/MerchantStoreEditPage.vue'),
        meta: { requiresAuth: true, role: 'MERCHANT' }
    }
    ,
    {
        path: '/merchant/stores/:id/warehouse',
        name: 'MerchantStoreWarehouse',
        component: () => import('@/views/store/StoreWarehousePage.vue'),
        meta: { requiresAuth: true, role: 'MERCHANT' }
    }
    ,
    {
        path: '/merchant/stores/:id/stockpiles',
        name: 'MerchantStoreStockpiles',
        component: () => import('@/components/business/store/StoreStockPileManager.vue'),
        props: (route) => ({ storeId: route.params.id }),
        meta: { requiresAuth: true, role: 'MERCHANT' }
    }
]

export default merchantRoutes


