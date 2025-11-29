import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理常见错误
apiClient.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response) {
      // 处理401未授权的情况
      if (error.response.status === 401) {
        // 清除本地存储的token
        localStorage.removeItem('token');
        // 重定向到登录页
        window.location.href = '/login';
      }
      console.error('API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// 用户相关API服务
export const userService = {
  // 登录
  login(username, password) {
    return apiClient.post('/accounts/login', { username, password });
  },

  // 注册
  register(userData) {
    return apiClient.post('/accounts', userData);
  },

  // 获取用户详情
  getUserDetails(username) {
    return apiClient.get(`/accounts/${username}`);
  },

  // 更新用户信息
  updateUserInfo(userData) {
    return apiClient.put('/accounts', userData);
  }
};

// 产品相关API服务
export const ProductService = {
  // 获取所有产品
  getAllProducts() {
    return apiClient.get('/products');
  },

  // 根据ID获取产品
  getProductById(id) {
    return apiClient.get(`/products/${id}`);
  },

  // 创建新产品
  createProduct(product) {
    return apiClient.post('/products', product);
  },

  // 更新产品
  updateProduct(product) {
    return apiClient.put('/products', product);
  },

  // 删除产品
  deleteProduct(id) {
    return apiClient.delete(`/products/${id}`);
  },

  // 获取产品库存
  getProductStockpile(productId) {
    return apiClient.get(`/products/stockpile/${productId}`);
  },

  // 更新产品库存
  updateProductStockpile(productId, stockpile) {
    return apiClient.patch(`/products/stockpile/${productId}`, stockpile);
  }
};

export const cartService = {
  // 添加商品到购物车
  addToCart(productId, quantity) {
    console.log('API调用: 添加商品到购物车', { productId, quantity });
    return apiClient.post('/cart', { productId, quantity });
  },

  // 获取购物车列表
  getCartItems() {
    return apiClient.get('/cart');
  },

  // 更新购物车商品数量
  updateCartItemQuantity(cartItemId, quantity) {
    return apiClient.patch(`/cart/${cartItemId}`, { quantity });
  },

  // 删除购物车商品
  removeCartItem(cartItemId) {
    return apiClient.delete(`/cart/${cartItemId}`);
  },

  // 结算购物车（创建订单）
  checkout(orderData) {
    return apiClient.post('/cart/checkout', orderData);
  }
};

// 订单相关服务
export const orderService = {
  // 获取订单列表
  getOrders() {
    return apiClient.get('/orders');
  },

  // 获取订单详情
  getOrderById(orderId) {
    return apiClient.get(`/orders/${orderId}`);
  },

  // 发起支付
  payOrder(orderId) {
    return apiClient.post(`/orders/${orderId}/pay`);
  }
};

export const advertisementService = {
  // Get all advertisements
  getAllAdvertisements() {
    return apiClient.get('/advertisements');
  },

  // Create new advertisement
  createAdvertisement(advertisementData) {
    return apiClient.post('/advertisements', advertisementData);
  },

  // Update advertisement
  updateAdvertisement(advertisementData) {
    return apiClient.put('/advertisements', advertisementData);
  },

  // Delete advertisement
  deleteAdvertisement(id) {
    return apiClient.delete(`/advertisements/${id}`);
  }
};

// 书评相关API服务
export const bookReviewService = {
  // 发布书评/评论
  addBookComment(productId, commentData) {
    return apiClient.post(`/bookComment/${productId}`, commentData);
  },

  // 获取指定产品的书评列表
  getBookComments(productId) {
    return apiClient.get(`/bookComment/${productId}`);
  },

  // 删除书评
  deleteBookComment(commentId) {
    return apiClient.delete(`/bookComment/${commentId}`);
  }
};

export const admincouponService = {
  // 获取所有优惠券
  getAllCoupons() {
    return apiClient.get('/api/admin/coupons')
  },

  // 根据ID获取优惠券
  getCouponById(couponId) {
    return apiClient.get(`/api/admin/coupons/${couponId}`)
  },

  // 创建优惠券
  createCoupon(couponData) {
    return apiClient.post('/api/admin/coupons', couponData)
  },

  // 更新优惠券
  updateCoupon(couponId, couponData) {
    return apiClient.put(`/api/admin/coupons/${couponId}`, couponData)
  },

  // 查看用户优惠券
  getUserCoupons(userId) {
    return apiClient.get(`/api/admin/coupons/user/${userId}`)
  },

  // 为用户发放优惠券
  issueCouponToUser(issueData) {
    return apiClient.post('/api/admin/coupons/issue', issueData)
  },
}

export const CouponService = {
  // 用户优惠券相关API

  // 获取所有可兑换优惠券
  getAvailableCoupons() {
    return apiClient.get('/api/coupons/available');
  },

  // 获取优惠券详情
  getCouponDetail(couponId) {
    return apiClient.get(`/api/coupons/${couponId}`);
  },

  // 获取用户拥有的优惠券
  getUserCoupons() {
    return apiClient.get('/api/coupons/my');
  },

  // 兑换优惠券
  exchangeCoupon(couponId) {
    return apiClient.post(`/api/coupons/exchange/${couponId}`);
  },

  // 使用优惠券
  applyCoupon(applyData) {
    return apiClient.post('/api/coupons/apply', applyData);
  }
}

// 论坛相关API
export const forumService = {
  getAllForums() {
    return apiClient.get('/api/forums');
  },
  getActiveForums(page = 0, size = 10) {
    return apiClient.get('/api/forums/active', {
      params: { page, size }
    });
  },
  getForumById(forumId) {
    return apiClient.get(`/api/forums/${forumId}`);
  }
};

// 会员管理相关API服务
export const memberService = {
  // 获取所有会员等级
  getAllLevels() {
    return apiClient.get('/api/admin/member/levels');
  },

  // 根据ID获取会员等级
  getLevelById(levelId) {
    return apiClient.get(`/api/admin/member/levels/${levelId}`);
  },

  // 创建会员等级
  createLevel(levelData) {
    return apiClient.post('/api/admin/member/levels', levelData);
  },

  // 更新会员等级
  updateLevel(levelId, levelData) {
    return apiClient.put(`/api/admin/member/levels/${levelId}`, levelData);
  },

  // 删除会员等级
  deleteLevel(levelId) {
    return apiClient.delete(`/api/admin/member/levels/${levelId}`);
  },

  // 手动升级用户会员等级
  upgradeUserLevel(userId, targetLevelId) {
    return apiClient.post(`/api/admin/member/upgrade/${userId}`, null, {
      params: { targetLevelId }
    });
  },

  // 查看用户积分记录
  getUserPointsHistory(userId) {
    return apiClient.get(`/api/admin/member/points/${userId}`);
  },

  // 手动调整用户积分
  adjustUserPoints(adjustmentData) {
    return apiClient.post('/api/admin/member/points/adjust', adjustmentData);
  }
};

export const usermemberService = {
  // 获取用户会员信息
  getMemberInfo() {
    return apiClient.get('/member/info');
  },

  // 获取用户当前会员等级
  getMemberLevel() {
    return apiClient.get('/member/level');
  },

  // 获取所有会员等级列表
  getAllLevels() {
    return apiClient.get('/member/levels');
  },

  // 获取用户当前积分
  getUserPoints() {
    return apiClient.get('/member/points');
  },

  // 获取用户积分历史记录
  getPointsHistory() {
    return apiClient.get('/member/points/history');
  }
};

export default {
  user: userService,
  ProductService,
  cart: cartService,
  order: orderService,
  advertisement: advertisementService,
  bookReview: bookReviewService,
  AdminCoupon: admincouponService,
  Coupon: CouponService,
  forum: forumService,
  member: memberService,
  usermember: usermemberService,

};