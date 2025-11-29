import { createRouter, createWebHistory } from 'vue-router';

// 导入页面组件
import IndexPage from '../pages/IndexPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import ProfilePage from '../pages/ProfilePage.vue';
import CartPage from '../pages/CartPage.vue';
import WarehousePage from '../pages/WarehousePage.vue';
import OrderPage from '@/pages/OrderPage.vue';
import AdvertisementPage from '@/pages/AdvertisementPage.vue';
import BookCommentPage from '@/pages/BookCommentPage.vue';
import AdminCouponPage from '@/pages/AdminCouponPage.vue';
import CouponList from '@/components/AdminCoupon/CouponList.vue';
import CouponForm from '@/components/AdminCoupon/CouponForm.vue';
import CouponDetail from '@/components/AdminCoupon/CouponDetail.vue';
import UserCoupons from '@/components/AdminCoupon/UserCoupons.vue';
import IssueCouponForm from '@/components/AdminCoupon/IssueCouponForm.vue';
import CouponDetailPage from '@/pages/CouponDetailPage.vue';
import ProductDetail from '@/pages/ProductDetail.vue';
import AdminMember from '@/pages/AdminMember.vue';
import UserMember from '@/pages/UserMember.vue';




// 定义路由配置
const routes = [
    {
        path: '/',
        name: 'Home',
        component: IndexPage,
        meta: { requiresAuth: true }
    },
        {
        path: '/product/:id',
        name: 'productdetail',
        component: ProductDetail,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterPage
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { requiresAuth: true }
    },
    {
        path: '/cart',
        name: 'Cart',
        component: CartPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/warehouse',
        name: 'Warehouse',
        component: WarehousePage,
        meta: { requiresAuth: true }
    },
    {
        path: '/order',
        name: 'Order',
        component:OrderPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/advertisement',
        name: 'advertisement',
        component:AdvertisementPage,
        meta: { requiresAuth: true }
    },
     {
        path: '/bookcomment',
        name: 'BookReview',
        component: BookCommentPage,
        meta: { requiresAuth: true }
    },
      {
    path: '/admin/coupons',
    component: AdminCouponPage,
    children: [
      {
        path: '',
        component: CouponList,
      },
      {
        path: 'create',
        component: CouponForm,
      },
      {
        path: 'edit/:id',
        component: CouponForm,
        props: true
      },
      {
        path: ':id',
        component: CouponDetail,
        props: true
      },
      {
        path: 'user',
        component: UserCoupons,
      },
         {
        path: 'issue',
        component: IssueCouponForm,
      }
    ],
  }
,
    {
    path: '/coupon/:id',
    name: 'CouponDetail',
    component: CouponDetailPage,
    meta: { requiresAuth: true }
  },

     {
        path: '/admin/member',
        name: 'adminmember',
        component: AdminMember
    },

         {
        path: '/member',
        name: 'usermember',
        component: UserMember
    },
    // 其他路由配置可以继续添加在这里
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 导航守卫：检查用户是否已登录
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const token = localStorage.getItem('token');

    if (requiresAuth && !token) {
        // 如果需要登录但没有token，重定向到登录页
        next('/login');
    } else {
        next();
    }
});

export default router;