<template>
  <div class="cart-page">
    <h1>购物车</h1>
    
    <!-- Empty Cart Message -->
    <div v-if="cart.items && cart.items.length === 0" class="empty-cart">
      <p>购物车是空的，快去选购喜欢的商品吧！</p>
      <router-link to="/" class="btn btn-primary">继续购物</router-link>
    </div>
    
    <!-- Cart Items -->
    <div v-if="cart.items && cart.items.length > 0" class="cart-container">
      <div class="cart-header">
        <div class="row">
          <div class="col-1">选择</div>
          <div class="col-4">商品</div>
          <div class="col-2">单价</div>
          <div class="col-2">数量</div>
          <div class="col-2">金额</div>
          <div class="col-1">操作</div>
        </div>
      </div>
      
      <div class="cart-items">
        <div v-for="item in cart.items" :key="item.cartItemId || item.id" class="cart-item row">
          <div class="col-1">
            <input 
              type="checkbox" 
              v-model="selectedItems" 
              :value="getCartItemId(item)"
              @change="calculateSelectedTotal"
            >
          </div>
          <div class="col-4 product-info">
            <img 
              :src="getImageUrl(item.cover)" 
              alt="商品图片" 
              class="product-image"
              @error="handleImageError"
            >
            <div class="product-details">
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
            </div>
          </div>
          <div class="col-2 price">¥{{ (item.price || 0).toFixed(2) }}</div>
          <div class="col-2 quantity">
            <div class="quantity-control">
              <button 
                type="button"
                @click="handleDecreaseQuantity(item)" 
                :disabled="item.quantity <= 1"
                class="quantity-btn"
              >-</button>
              <input 
                type="number" 
                v-model.number="item.quantity" 
                min="1" 
                @change="handleQuantityChange(item)"
                class="quantity-input"
              >
              <button 
                type="button"
                @click="handleIncreaseQuantity(item)" 
                class="quantity-btn"
                :disabled="isMaxQuantity(item)"
              >+</button>
            </div>
            <div class="stock-info" v-if="item.productId && getAvailableStock(item.productId) !== null">
              <small>{{ (getAvailableStock(item.productId) ?? 0) > 0 ? '有库存' : '无库存' }}</small>
            </div>
          </div>
          <div class="col-2 subtotal">¥{{ ((item.price || 0) * item.quantity).toFixed(2) }}</div>
          <div class="col-1 actions">
            <button type="button" @click="handleRemoveItem(item)" class="remove-btn">删除</button>
          </div>
        </div>
      </div>
      
      <!-- Cart Summary -->
      <div class="cart-summary row">
        <div class="col-6">
          <label>
            <input 
              type="checkbox" 
              @change="toggleSelectAll" 
              :checked="isAllSelected"
            > 全选
          </label>
          <button @click="removeSelected" class="btn btn-outline-danger ms-3" :disabled="selectedItems.length === 0">
            删除选中
          </button>
        </div>
        <div class="col-6 text-end">
          <div class="summary-info">
            <p>已选商品 <span>{{ selectedItems.length }}</span> 件</p>
            <p>合计: <span class="total-price">¥{{ selectedTotal.toFixed(2) }}</span></p>
          </div>
          <button 
            @click="proceedToCheckout" 
            class="btn btn-primary checkout-btn"
            :disabled="selectedItems.length === 0"
          >
            结算
          </button>
        </div>
      </div>
    </div>
    
    <!-- Checkout Modal -->
    <div v-if="showCheckoutModal" class="checkout-modal">
      <div class="modal-content checkout-content">
        <div class="modal-header checkout-header">
          <div class="header-title">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h2>订单确认</h2>
          </div>
          <button @click="showCheckoutModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body checkout-body">
          <!-- 收货地址 -->
          <div class="checkout-section shipping-address">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3>收货地址</h3>
            </div>
            <div class="address-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    收货人
                  </label>
                  <input id="name" v-model="shippingAddress.receiverName" type="text" class="form-control" placeholder="请输入收货人姓名">
                </div>
                <div class="form-group">
                  <label for="phone">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    联系电话
                  </label>
                  <input id="phone" v-model="shippingAddress.phone" type="text" class="form-control" placeholder="请输入联系电话">
                </div>
              </div>
              <div class="form-group">
                <label for="zipcode">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  邮政编码
                </label>
                <input id="zipcode" v-model="shippingAddress.zipCode" type="text" class="form-control" placeholder="请输入邮政编码">
              </div>
              <div class="form-group">
                <label for="address">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  详细地址
                </label>
                <textarea id="address" v-model="shippingAddress.address" class="form-control" rows="3" placeholder="请输入详细地址"></textarea>
              </div>
            </div>
          </div>
          
          <!-- 订单摘要 -->
          <div class="checkout-section order-summary">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3>订单摘要</h3>
            </div>
            <div class="summary-content">
              <div class="summary-item">
                <span class="summary-label">选中商品</span>
                <span class="summary-value">{{ selectedItems.length }} 件</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">订单原价</span>
                <span class="summary-value">¥{{ selectedTotal.toFixed(2) }}</span>
              </div>
              <div v-if="selectedDiscount > 0" class="summary-item discount">
                <span class="summary-label">优惠减免</span>
                <span class="summary-value">-¥{{ selectedDiscount.toFixed(2) }}</span>
              </div>
              <div class="summary-item total">
                <span class="summary-label">应付金额</span>
                <span class="summary-value price-highlight">¥{{ payableTotal.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- 优惠券 -->
          <div class="checkout-section coupon-section">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3>优惠券</h3>
            </div>
            <div v-if="couponLoading" class="coupon-hint loading">
              <svg class="loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              正在加载可用优惠券...
            </div>
            <div v-else class="coupon-selector">
              <select v-model="selectedUserCouponId" class="form-control coupon-select">
                <option :value="null">不使用优惠券</option>
                <option
                  v-for="c in availableUserCoupons"
                  :key="c.id"
                  :value="c.id"
                >
                  {{ c.couponName || c.couponDescription || '优惠券' }} - 
                  优惠{{ formatCouponDiscount(c) }} (满{{ c.minimumPurchase || 0 }}可用)
                </option>
              </select>
              <p v-if="!availableUserCoupons.length" class="coupon-hint empty">
                <svg class="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                暂无可用优惠券
              </p>
            </div>
          </div>
          
          <!-- 支付方式 -->
          <div class="checkout-section payment-method">
            <div class="section-header">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3>支付方式</h3>
            </div>
            <div class="payment-options">
              <label class="payment-option" for="alipay">
                <input 
                  class="payment-radio" 
                  type="radio" 
                  id="alipay" 
                  value="ALIPAY" 
                  v-model="paymentMethod" 
                  checked
                >
                <div class="payment-label">
                  <svg class="payment-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                  <span>支付宝</span>
                </div>
                <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer checkout-footer">
          <button @click="showCheckoutModal = false" class="btn btn-secondary cancel-btn">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            取消
          </button>
          <button @click="submitOrder" class="btn btn-primary submit-btn">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            提交订单
          </button>
        </div>
      </div>
    </div>
    
    <!-- Payment Form Modal -->
    <div v-if="showPaymentForm" class="payment-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>支付订单</h2>
          <button @click="closePaymentForm" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="paymentForm" v-html="paymentForm"></div>
          <div v-else>
            <p>订单号: {{ (currentOrder as any)?.orderNo || (currentOrder as any)?.orderId || (currentOrder as any)?.id }}</p>
            <p>订单金额: ¥{{ (currentOrder as any)?.totalAmount || 0 }}</p>
            <p>正在准备支付...</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';
import { ElMessage } from 'element-plus';
import type { AxiosError } from 'axios';
import type { UserCoupon, Cart, ShippingAddress, CartItem } from '@/types/api';
import { getImageUrl } from '@/utils/image';

export default defineComponent({
  name: 'CartPage',
  data() {
    return {
      cart: {
        items: [],
        total: 0,
        totalAmount: 0
      } as Cart,
      selectedItems: [] as number[],
      selectedTotal: 0,
      loading: false,
      showCheckoutModal: false,
      showPaymentForm: false,
      shippingAddress: {
        receiverName: '',
        phone: '',
        zipCode: '',
        address: ''
      } as ShippingAddress,
      paymentMethod: 'ALIPAY' as string,
      paymentForm: null as any,
      currentOrder: null as any,
      productStockpiles: {} as Record<string | number, any>, // 存储商品库存信息
      availableUserCoupons: [] as UserCoupon[],
      selectedUserCouponId: null as number | null,
      couponLoading: false,
      selectedDiscount: 0
    };
  },
  computed: {
    isAllSelected(): boolean {
      return this.cart.items && 
             this.cart.items.length > 0 && 
             this.selectedItems.length === this.cart.items.length;
    },
    payableTotal(): number {
      const total = this.selectedTotal || 0;
      const discount = this.selectedDiscount || 0;
      return total - discount > 0 ? total - discount : 0;
    }
  },
  watch: {
    selectedUserCouponId() {
      this.recalculateDiscount();
    }
  },
  created() {
    this.fetchCart();
  },
  methods: {
    getImageUrl,
    async fetchCart(): Promise<void> {
      try {
        this.loading = true;
        const response = await api.cart.getCartItems();
        console.log('购物车数据:', response);
        
        // 根据返回的数据结构正确设置购物车数据
        if (response && response.code === '200' && response.data) {
          // 处理 response.data 可能是数组或对象的情况
          const data = response.data as any
          const items = Array.isArray(data) ? data : (data.cartItems || data.items || [])
          this.cart = {
            items: items,
            total: Array.isArray(data) ? data.length : (data.total || 0),
            totalAmount: Array.isArray(data) ? 0 : (data.totalAmount || 0)
          };
          
          // 获取所有商品的库存信息
          this.fetchAllProductStockpiles();
        } else {
          this.cart = {
            items: [],
            total: 0,
            totalAmount: 0
          };
        }
        
        this.loading = false;
      } catch (error: unknown) {
        console.error('Failed to fetch cart:', error);
        this.loading = false;
        this.cart = {
          items: [],
          total: 0,
          totalAmount: 0
        };
      }
    },
    
    // 获取所有购物车商品的库存信息
    async fetchAllProductStockpiles() {
      try {
        if (!this.cart.items || this.cart.items.length === 0) return;
        
        // console.log('开始获取商品库存信息...');
        
        // 为每个商品获取库存信息
        for (const item of this.cart.items) {
          if (!item.productId) continue;
          
          try {
            const productId = typeof item.productId === 'string' ? parseInt(item.productId, 10) : item.productId;
            if (isNaN(productId)) continue;
            
            const response = await api.product.getProductStockpile(productId);
            // console.log(`商品 ${item.productId} 库存API响应:`, response);
            
            if (response && response.code === '200' && response.data) {
              // 存储库存信息，键为商品ID（保持原始类型）
              this.productStockpiles[item.productId] = response.data;
              // console.log(`商品 ${item.productId} 库存:`, response.data);
              // console.log(`商品 ${item.productId} 的amount值:`, response.data.amount);
            }
          } catch (err: unknown) {
            // console.error(`获取商品 ${item.productId} 库存失败:`, err);
          }
        }
        
        // console.log('所有商品库存信息:', this.productStockpiles);
      } catch (error: unknown) {
        // console.error('获取商品库存信息失败:', error);
      }
    },
    
    async updateQuantity(cartItemId: number, quantity: number): Promise<void> {

      if (quantity < 1) return;
      
      // 查找当前购物车项

      const cartItem = this.cart.items.find(item => (item.cartItemId || item.id) === cartItemId);
      if (!cartItem) return;

      // 检查是否是增加数量的操作
      const isIncreasing = quantity > cartItem.quantity;
      
      // 只有在增加数量且库存为0时才拒绝操作
      if (isIncreasing) {
        const stockpile = this.productStockpiles[cartItem.productId];
        if (stockpile) {
          // 将amount转换为数字进行比较
          const amount = parseInt(stockpile.amount || 0, 10);
          // console.log(`更新数量 - 商品 ${cartItem.productId} 库存: ${amount}, 类型: ${typeof amount}`);
          
          if (amount <= 0) {
            ElMessage({
              type: 'warning',
              message: `库存不足，当前无可用库存`
            });
            // 恢复原来的数量
            cartItem.quantity = cartItem.quantity;
            return;
          }
        }
      }
      console.log("update");
      try {
        this.loading = true;
        await api.cart.updateCartItemQuantity(cartItemId, quantity);
        console.log(cartItemId,quantity);
        await this.fetchCart();
        this.calculateSelectedTotal();
      } catch (error: unknown) {
        console.error('Failed to update quantity:', error);
        const axiosError = error as AxiosError
        if (axiosError.response && axiosError.response.data) {
          ElMessage({
            type: 'error',
            message: (axiosError.response.data as any).msg || '更新数量失败'
          });
        }
        this.loading = false;
      }
    },
    
    getCartItemId(item: CartItem): number | null {
      const id = item.cartItemId || item.id;
      if (id === undefined || id === null) return null;
      return typeof id === 'string' ? parseInt(id, 10) : id;
    },
    
    async removeItem(cartItemId: number): Promise<void> {
      if (!confirm('确定要从购物车中删除此商品吗？')) return;
      
      try {
        this.loading = true;
        await api.cart.removeCartItem(cartItemId);
        
        // Remove from selected items if present
        const id = cartItemId
        const index = this.selectedItems.indexOf(id);
        if (index > -1) {
          this.selectedItems.splice(index, 1);
        }
        
        await this.fetchCart();
        this.calculateSelectedTotal();
      } catch (error: unknown) {
        console.error('Failed to remove item:', error);
        this.loading = false;
      }
    },
    
    async removeSelected() {
      if (this.selectedItems.length === 0) return;
      if (!confirm(`确定要删除选中的 ${this.selectedItems.length} 件商品吗？`)) return;
      
      try {
        this.loading = true;
        
        for (const cartItemId of this.selectedItems) {
          if (typeof cartItemId === 'number') {
            await api.cart.removeCartItem(cartItemId);
          }
        }
        
        this.selectedItems = [];
        await this.fetchCart();
        this.calculateSelectedTotal();
      } catch (error: unknown) {
        console.error('Failed to remove selected items:', error);
        this.loading = false;
      }
    },
    
    toggleSelectAll(event: Event): void {
      const target = event.target as HTMLInputElement
      if (target && target.checked) {
        this.selectedItems = this.cart.items
          .map(item => this.getCartItemId(item))
          .filter((id): id is number => id !== null);
      } else {
        this.selectedItems = [];
      }
      this.calculateSelectedTotal();
    },
    
    calculateSelectedTotal() {
      this.selectedTotal = 0;
      if (!this.cart.items) return;
      
      for (const item of this.cart.items) {
        const id = this.getCartItemId(item);
        if (id !== null && this.selectedItems.includes(id)) {
          this.selectedTotal += (item.price || 0) * item.quantity;
        }
      }
    },
    
    proceedToCheckout() {
      if (this.selectedItems.length === 0) {
        ElMessage({
          type: 'warning',
          message: '请至少选择一件商品'
        });
        return;
      }

      // 打开结算弹窗前刷新可用优惠券
      this.loadAvailableCoupons();
      this.showCheckoutModal = true;
    },
    
    async submitOrder() {
      if (!this.validateShippingAddress()) {
        return;
      }
      
      try {
        this.loading = true;
        
        // 构建符合后端OrderCheckoutVO格式的数据
        const orderData = {
          cartItemIds: this.selectedItems.map(id => String(id)), // 确保是字符串数组
          paymentMethod: this.paymentMethod,
          receiverInfoVO: {
            receiverName: this.shippingAddress.receiverName,
            phone: this.shippingAddress.phone,
            zipCode: this.shippingAddress.zipCode || '',
            address: this.shippingAddress.address
          }
        };
        
        const response = await api.cart.checkout(orderData as any);
        this.currentOrder = response.data || response;
        
        this.showCheckoutModal = false;
        console.log(this.currentOrder);
        const orderId = (this.currentOrder as any)?.orderId || (this.currentOrder as any)?.id

        // 如果选择了优惠券，先尝试应用优惠券
        if (orderId && this.selectedUserCouponId) {
          const selectedCoupon = this.availableUserCoupons.find(
            c => c.id === this.selectedUserCouponId
          );
          if (!selectedCoupon || !selectedCoupon.couponId) {
            ElMessage({ type: 'error', message: '优惠券信息缺失，无法使用该优惠券' });
            this.loading = false;
            return;
          }
          try {
            const applyRes = await api.coupon.applyCoupon({
              userCouponId: this.selectedUserCouponId as number,
              couponId: selectedCoupon.couponId,
              orderId
            });
            const msg = (applyRes as any)?.data || applyRes.msg;
            if (typeof msg === 'string' && msg.includes('失败')) {
              ElMessage({ type: 'error', message: msg || '优惠券使用失败' });
              this.loading = false;
              return;
            }
          } catch (e: any) {
            const msg =
              e?.response?.data?.msg ||
              e?.response?.data?.message ||
              e?.message ||
              '优惠券使用失败';
            ElMessage({ type: 'error', message: msg });
            this.loading = false;
            return;
          }
        }

        if (orderId) {
          await this.initiatePayment(orderId);
        }
      } catch (error: unknown) {
        console.error('Failed to create order:', error);
        const axiosError = error as AxiosError
        if (axiosError.response && axiosError.response.data) {
          ElMessage({
            type: 'error',
            message: (axiosError.response.data as any).msg || '创建订单失败'
          });
        }
        this.loading = false;
      }
    },

    async loadAvailableCoupons() {
      this.couponLoading = true;
      this.availableUserCoupons = [];
      try {
        const res = await api.coupon.getUserOwnedCoupons();
        const list = (res.data || []) as UserCoupon[];
        const now = Date.now();
        this.availableUserCoupons = list.filter(c => {
          if (c.isUsed) return false;
          const end = c.validTo ? new Date(c.validTo).getTime() : null;
          if (end && end < now) return false;
          const min = c.minimumPurchase || 0;
          return this.selectedTotal >= min;
        });
      } catch (e) {
        console.error('加载优惠券失败', e);
      } finally {
        this.couponLoading = false;
        this.recalculateDiscount();
      }
    },

    formatCouponDiscount(c: UserCoupon): string {
      if (c.discountAmount) return `¥${c.discountAmount}`;
      if (c.discountPercentage) return `${c.discountPercentage}%`;
      return '—';
    },

    formatCouponDate(date?: string): string {
      if (!date) return '长期';
      return new Date(date).toLocaleDateString();
    },

    recalculateDiscount() {
      const total = this.selectedTotal || 0;
      if (!this.selectedUserCouponId) {
        this.selectedDiscount = 0;
        return;
      }
      const coupon = this.availableUserCoupons.find(
        c => c.id === this.selectedUserCouponId
      );
      if (!coupon) {
        this.selectedDiscount = 0;
        return;
      }
      let discount = 0;
      if (coupon.discountAmount) {
        discount = coupon.discountAmount;
      } else if (coupon.discountPercentage) {
        discount = (total * coupon.discountPercentage) / 100;
      }
      if (discount > total) discount = total;
      this.selectedDiscount = Number(discount.toFixed(2));
    },
    
    validateShippingAddress() {
      if (!this.shippingAddress.receiverName) {
        ElMessage({
          type: 'warning',
          message: '请填写收货人姓名'
        });
        return false;
      }
      if (!this.shippingAddress.phone) {
        ElMessage({
          type: 'warning',
          message: '请填写联系电话'
        });
        return false;
      }
      if (!this.shippingAddress.address) {
        ElMessage({
          type: 'warning',
          message: '请填写详细地址'
        });
        return false;
      }
      return true;
    },
    
    async initiatePayment(orderId: number): Promise<void> {
      try {
        console.log(orderId)
        const response = await api.order.payOrder(orderId);
        const paymentForm = (response.data as any)?.paymentForm || (response as any).paymentForm;

        // 直接在新窗口写入并提交支付宝表单，避免弹窗里 script 不执行导致不跳转
        if (paymentForm) {
          const payWindow = window.open('', '_blank');
          if (payWindow) {
            payWindow.document.open();
            payWindow.document.write(paymentForm);
            payWindow.document.close();
            const form = payWindow.document.forms[0];
            form && form.submit();
          } else {
            // 如果被拦截则回退到原有弹窗展示
            this.paymentForm = paymentForm;
        this.showPaymentForm = true;
          }
        } else {
          ElMessage({
            type: 'error',
            message: '未获取到支付表单'
          });
        }
        this.loading = false;
      } catch (error: unknown) {
        console.error('Failed to initiate payment:', error);
        const axiosError = error as AxiosError
        if (axiosError.response && axiosError.response.data) {
          ElMessage({
            type: 'error',
            message: (axiosError.response.data as any).msg || '发起支付失败'
          });
        }
        this.loading = false;
      }
    },
    
    closePaymentForm() {
      this.showPaymentForm = false;
      this.paymentForm = null;
      // Refresh cart after closing payment modal
      this.fetchCart();
    },
    
    // 处理图片加载错误
    handleImageError(event: any): void {
      // 防止无限循环触发error事件
      event.target.onerror = null;
      // 使用占位符图片
      event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E暂无图片%3C/text%3E%3C/svg%3E';
    },
    
    isMaxQuantity(item: any): boolean {
      if (!item.productId || !this.productStockpiles[item.productId]) return false;
      
      const stockpile = this.productStockpiles[item.productId];
      // 将amount转换为数字进行比较
      const amount = parseInt(stockpile.amount || 0, 10);
      // console.log(`商品 ${item.productId} 库存: ${amount}, 类型: ${typeof amount}`);
      
      // 只有当库存为0或小于0时才禁用按钮
      const result = amount <= 0;
      // console.log(`商品 ${item.productId} isMaxQuantity: ${result}`);
      return result;
    },
    
    getAvailableStock(productId: string | number): number | null {
      if (!this.productStockpiles[productId]) return null;
      
      const stockpile = this.productStockpiles[productId];
      // 将amount转换为数字
      return parseInt(stockpile.amount || 0, 10);
    },
    
    decreaseQuantity(cartItemId: number, quantity: number): void {
      if (quantity > 1) {
        this.updateQuantity(cartItemId, quantity - 1);
      }
    },
    
    increaseQuantity(cartItemId: number, quantity: number): void {
      const item = this.cart.items.find(item => (item.cartItemId || item.id) === cartItemId)
      if (item && !this.isMaxQuantity(item)) {
        this.updateQuantity(cartItemId, quantity + 1);
      }
    },
    
    // 处理减少数量按钮点击
    handleDecreaseQuantity(item: CartItem): void {
      console.log('handleDecreaseQuantity called', item);
      const cartItemId = this.getCartItemId(item);
      console.log('cartItemId:', cartItemId);
      if (cartItemId !== null) {
        this.decreaseQuantity(cartItemId, item.quantity);
      }
    },
    
    // 处理增加数量按钮点击
    handleIncreaseQuantity(item: CartItem): void {
      console.log('handleIncreaseQuantity called', item);
      const cartItemId = this.getCartItemId(item);
      console.log('cartItemId:', cartItemId);
      if (cartItemId !== null) {
        this.increaseQuantity(cartItemId, item.quantity);
      }
    },
    
    // 处理数量输入框变化
    handleQuantityChange(item: CartItem): void {
      const cartItemId = this.getCartItemId(item);
      if (cartItemId !== null) {
        this.updateQuantity(cartItemId, item.quantity);
      }
    },
    
    // 处理删除按钮点击
    handleRemoveItem(item: CartItem): void {
      const cartItemId = this.getCartItemId(item);
      if (cartItemId !== null) {
        this.removeItem(cartItemId);
      }
    }
  }
});
</script>

<style scoped>
.cart-page {
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

h1 {
  margin-bottom: 40px;
  margin-top: 80px;
  font-size: 36px;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-top: 40px;
}

.empty-cart p {
  font-size: 18px;
  color: #718096;
  margin-bottom: 30px;
}

.empty-cart .btn-primary {
  padding: 14px 40px;
  font-size: 16px;
  border-radius: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.empty-cart .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.cart-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 30px;
  font-weight: 600;
  color: white;
  border: none;
  font-size: 15px;
}

.cart-header .row {
  align-items: center;
}

.cart-items {
  padding: 0;
}

.cart-item {
  padding: 25px 30px;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.3s;
  background: white;
}

.cart-item:hover {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.cart-item:last-child {
  border-bottom: none;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.product-image:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.product-details h4 {
  margin: 0 0 8px 0;
  font-size: 17px;
  font-weight: 600;
  color: #2d3748;
}

.product-details p {
  margin: 0;
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
}

.price, .subtotal {
  font-weight: 700;
  font-size: 18px;
  color: #e53e3e;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f7fafc;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.quantity-btn {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.quantity-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.quantity-btn:active:not(:disabled) {
  transform: translateY(0);
}

.quantity-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  box-shadow: none;
}

.quantity-input {
  width: 60px;
  height: 36px;
  text-align: center;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  background: white;
  transition: all 0.2s;
}

.quantity-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.remove-btn {
  color: #e53e3e;
  background: #fff5f5;
  border: 2px solid #feb2b2;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 14px;
}

.remove-btn:hover {
  background: #e53e3e;
  color: white;
  border-color: #e53e3e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.cart-summary {
  padding: 30px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  align-items: center;
  border-top: 3px solid #667eea;
}

.cart-summary label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  cursor: pointer;
}

.cart-summary input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
}

.summary-info {
  display: inline-block;
  margin-right: 30px;
}

.summary-info p {
  margin: 8px 0;
  font-size: 16px;
  color: #4a5568;
}

.summary-info span {
  font-weight: 700;
  color: #2d3748;
  margin-left: 8px;
}

.total-price {
  font-size: 28px;
  font-weight: 800;
  color: #e53e3e;
  text-shadow: 1px 1px 2px rgba(229, 62, 62, 0.2);
}

.checkout-btn {
  padding: 14px 50px;
  font-size: 17px;
  font-weight: 700;
  border-radius: 50px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.checkout-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(245, 87, 108, 0.6);
}

.checkout-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-outline-danger {
  background: white;
  border: 2px solid #e53e3e;
  color: #e53e3e;
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline-danger:hover:not(:disabled) {
  background: #e53e3e;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.btn-outline-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stock-info {
  margin-top: 8px;
  font-size: 13px;
  text-align: center;
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  font-weight: 600;
}

.stock-info small {
  display: block;
  color: #48bb78;
  background: #f0fff4;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #9ae6b4;
}

/* Modal styles */
.checkout-modal, .payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.checkout-content {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.checkout-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 28px;
  height: 28px;
  stroke-width: 2.5;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
  max-height: calc(90vh - 160px);
}

.checkout-body {
  background: #f9fafb;
}

.checkout-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.checkout-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
}

.section-icon {
  width: 24px;
  height: 24px;
  stroke-width: 2;
  color: #f5576c;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.address-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.input-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  color: #9ca3af;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: #f9fafb;
}

.form-control:focus {
  outline: none;
  border-color: #f5576c;
  background: white;
  box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
}

.form-control::placeholder {
  color: #9ca3af;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
}

.summary-item:hover {
  background: #f3f4f6;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
}

.summary-item.discount .summary-value {
  color: #10b981;
}

.summary-item.total {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
  margin-top: 8px;
}

.summary-item.total .summary-label {
  font-size: 16px;
  color: #92400e;
  font-weight: 600;
}

.price-highlight {
  font-size: 24px !important;
  color: #dc2626 !important;
  font-weight: 700 !important;
}

.coupon-selector {
  position: relative;
}

.coupon-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 40px;
}

.coupon-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
}

.coupon-hint.loading {
  background: #dbeafe;
  color: #1e40af;
}

.coupon-hint.empty {
  background: #fef3c7;
  color: #92400e;
}

.loading-icon {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hint-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.payment-option:hover {
  border-color: #f5576c;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.15);
}

.payment-option:has(.payment-radio:checked) {
  border-color: #f5576c;
  background: linear-gradient(135deg, #fff5f7 0%, #ffe4e9 100%);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.2);
}

.payment-radio {
  display: none;
}

.payment-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-icon {
  width: 32px;
  height: 32px;
  color: #f5576c;
}

.payment-label span {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.check-icon {
  width: 24px;
  height: 24px;
  stroke-width: 3;
  color: #10b981;
  opacity: 0;
  transition: all 0.2s;
}

.payment-option:has(.payment-radio:checked) .check-icon {
  opacity: 1;
  transform: scale(1.1);
}

.modal-footer {
  padding: 20px 28px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f9fafb;
}

.checkout-footer {
  background: white;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.cancel-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.btn-primary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 87, 108, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .cart-page {
    padding: 20px 10px;
  }
  
  h1 {
    font-size: 28px;
    margin-top: 60px;
  }
  
  .cart-item {
    padding: 20px 15px;
  }
  
  .product-image {
    width: 80px;
    height: 80px;
  }
  
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .address-form .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .checkout-section {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #f3f3f3;
  border-top: 6px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.row {
  display: flex;
  flex-wrap: wrap;
}

.col-1 { 
  width: 8.33%; 
  display: flex;
  align-items: center;
  justify-content: center;
}
.col-2 { 
  width: 16.66%; 
  display: flex;
  align-items: center;
  justify-content: center;
}
.col-4 { 
  width: 33.33%; 
}
.col-6 { 
  width: 50%; 
}

.text-end {
  text-align: right;
}

.btn {
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: #007bff;
  border: 1px solid #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  border: 1px solid #6c757d;
  color: white;
}

.btn-outline-danger {
  background-color: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
}

.ms-3 {
  margin-left: 15px;
}

.stock-info {
  margin-top: 5px;
  font-size: 12px;
  color: #6c757d;
  text-align: center;
}

.stock-info small {
  display: block;
}
</style>