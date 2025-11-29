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

const username = localStorage.getItem('username');
if (!username) {
  this.$router.push('/login');
}