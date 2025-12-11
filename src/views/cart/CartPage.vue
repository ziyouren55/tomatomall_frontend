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
              :value="item.cartItemId || item.id"
              @change="calculateSelectedTotal"
            >
          </div>
          <div class="col-4 product-info">
            <img 
              :src="item.cover" 
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
                @click="decreaseQuantity((item.cartItemId || item.id)!, item.quantity)" 
                :disabled="item.quantity <= 1"
                class="quantity-btn"
              >-</button>
              <input 
                type="number" 
                v-model.number="item.quantity" 
                min="1" 
                @change="updateQuantity((item.cartItemId || item.id)!, item.quantity)"
                class="quantity-input"
              >
              <button 
                @click="increaseQuantity((item.cartItemId || item.id)!, item.quantity)" 
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
            <button @click="removeItem((item.cartItemId || item.id)!)" class="remove-btn">删除</button>
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
      <div class="modal-content">
        <div class="modal-header">
          <h2>订单确认</h2>
          <button @click="showCheckoutModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="shipping-address">
            <h3>收货地址</h3>
            <div class="form-group">
              <label for="name">收货人姓名</label>
              <input id="name" v-model="shippingAddress.receiverName" type="text" class="form-control">
            </div>
            <div class="form-group">
              <label for="phone">联系电话</label>
              <input id="phone" v-model="shippingAddress.phone" type="text" class="form-control">
            </div>
            <div class="form-group">
              <label for="zipcode">邮政编码</label>
              <input id="zipcode" v-model="shippingAddress.zipCode" type="text" class="form-control">
            </div>
            <div class="form-group">
              <label for="address">详细地址</label>
              <textarea id="address" v-model="shippingAddress.address" class="form-control"></textarea>
            </div>
          </div>
          
          <div class="order-summary">
            <h3>订单摘要</h3>
            <p>选中商品: {{ selectedItems.length }} 件</p>
            <p>订单总额: ¥{{ selectedTotal.toFixed(2) }}</p>
          </div>
          
          <div class="payment-method">
            <h3>支付方式</h3>
            <div class="form-check">
              <input 
                class="form-check-input" 
                type="radio" 
                id="alipay" 
                value="ALIPAY" 
                v-model="paymentMethod" 
                checked
              >
              <label class="form-check-label" for="alipay">支付宝</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCheckoutModal = false" class="btn btn-secondary">取消</button>
          <button @click="submitOrder" class="btn btn-primary">提交订单</button>
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
            <p>订单号: {{ (currentOrder as any)?.orderId || (currentOrder as any)?.id }}</p>
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

interface CartItem {
  id?: number
  cartItemId?: number
  productId: number
  quantity: number
  price?: number
  title?: string
  description?: string
  cover?: string
  [key: string]: any
}

interface Cart {
  items: CartItem[]
  total: number
  totalAmount: number
}

interface ShippingAddress {
  receiverName: string
  phone: string
  zipCode: string
  address: string
}

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
      productStockpiles: {} as Record<number, any> // 存储商品库存信息
    };
  },
  computed: {
    isAllSelected(): boolean {
      return this.cart.items && 
             this.cart.items.length > 0 && 
             this.selectedItems.length === this.cart.items.length;
    }
  },
  created() {
    this.fetchCart();
  },
  methods: {
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
            const response = await api.product.getProductStockpile(item.productId);
            // console.log(`商品 ${item.productId} 库存API响应:`, response);
            
            if (response && response.code === '200' && response.data) {
              // 存储库存信息，键为商品ID
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
        this.selectedItems = this.cart.items.map(item => item.cartItemId || item.id).filter((id): id is number => typeof id === 'number');
      } else {
        this.selectedItems = [];
      }
      this.calculateSelectedTotal();
    },
    
    calculateSelectedTotal() {
      this.selectedTotal = 0;
      if (!this.cart.items) return;
      
      for (const item of this.cart.items) {
        const id = item.cartItemId || item.id
        if (id && this.selectedItems.includes(id)) {
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
      
      this.showCheckoutModal = true;
    },
    
    async submitOrder() {
      if (!this.validateShippingAddress()) {
        return;
      }
      
      try {
        this.loading = true;
        
        // 构建订单数据，确保符合 OrderData 接口
        const selectedCartItems = this.cart.items.filter(item => {
          const id = item.cartItemId || item.id
          return id && this.selectedItems.includes(id)
        }).map(item => ({
          id: (item.cartItemId || item.id)!,
          productId: item.productId,
          quantity: item.quantity
        }))
        
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
    
    getAvailableStock(productId: number): number | null {
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
    }
  }
});
</script>

<style scoped>
.cart-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 50px;
  margin-top: 100px;
}

.empty-cart {
  text-align: center;
  padding: 50px 0;
}

.cart-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cart-header {
  background-color: #f8f9fa;
  padding: 15px;
  font-weight: bold;
  border-bottom: 1px solid #dee2e6;
}

.cart-items {
  padding: 10px 0;
}

.cart-item {
  padding: 15px;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 4px;
}

.product-details h4 {
  margin: 0;
  font-size: 16px;
}

.product-details p {
  margin: 5px 0 0;
  color: #6c757d;
  font-size: 14px;
}

.price, .subtotal {
  font-weight: bold;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  background: #f8f9fa;
  border: 1px solid #ced4da;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-input {
  width: 50px;
  height: 30px;
  text-align: center;
  border: 1px solid #ced4da;
  margin: 0 5px;
}

.remove-btn {
  color: #dc3545;
  background: none;
  border: none;
  cursor: pointer;
}

.cart-summary {
  padding: 20px;
  background-color: #f8f9fa;
  align-items: center;
}

.summary-info {
  display: inline-block;
  margin-right: 20px;
}

.summary-info p {
  margin: 5px 0;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #dc3545;
}

.checkout-btn {
  padding: 8px 30px;
}

/* Modal styles */
.checkout-modal, .payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.row {
  display: flex;
  flex-wrap: wrap;
}

.col-1 { width: 8.33%; }
.col-2 { width: 16.66%; }
.col-4 { width: 33.33%; }
.col-6 { width: 50%; }

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