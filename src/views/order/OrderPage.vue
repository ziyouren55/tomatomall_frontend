<template>
  <div class="order-page">
    <h1>我的订单
      <button 
        @click="refreshOrders" 
        class="btn btn-outline-primary"
        style="margin-left: 20px; font-size: 14px; padding: 6px 12px;"
        :disabled="loading"
      >
        {{ loading ? '刷新中...' : '刷新' }}
      </button>
    </h1>
    
    <!-- 订单筛选 Tabs -->
    <div class="order-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: selectedTab === 'all' }"
        @click="setTab('all')"
      >全部</button>
      <button 
        class="tab-btn" 
        :class="{ active: selectedTab === 'ongoing' }"
        @click="setTab('ongoing')"
      >进行中</button>
      <button 
        class="tab-btn" 
        :class="{ active: selectedTab === 'completed' }"
        @click="setTab('completed')"
      >已完成</button>
    </div>
    
    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
      <button @click="refreshOrders" class="btn btn-outline-primary" style="margin-left: 10px; font-size: 12px; padding: 4px 8px;">
        重试
      </button>
    </div>
    
    <!-- Empty Orders Message -->
    <div v-if="!loading && orders.length === 0 && !errorMessage" class="empty-orders">
      <p>您还没有任何订单，快去选购喜欢的商品吧！</p>
      <router-link to="/" class="btn btn-primary">去购物</router-link>
    </div>
    
    <!-- Orders List -->
    <div v-else-if="!loading && filteredOrders.length > 0" class="orders-container">
      <div v-for="order in filteredOrders" :key="order.orderId" class="order-card">
        <div class="order-header">
          <div class="order-number">
            订单号：{{ order.orderId }}
          </div>
          <div class="order-date">
            {{ formatDate(order.createTime) }}
          </div>
          <div class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </div>
        </div>
        
        <!-- 订单基本信息 -->
        <div class="order-summary">
          <div class="payment-method">
            <strong>支付方式：</strong>{{ order.paymentMethod }}
          </div>
        </div>
        
        <!-- 订单商品信息 -->
        <div class="order-items">
          <h4 class="items-title">订单商品</h4>
          <div v-if="order.cartItems && order.cartItems.length > 0" class="items-list">
            <div v-for="item in order.cartItems" :key="item.cartItemId" class="item-card">
              <div class="item-image">
                <img 
                  :src="item.cover" 
                  :alt="item.title"
                  @error="handleImageError"
                />
              </div>
              <div class="item-info">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-price">¥{{ item.price.toFixed(2) }} × {{ item.quantity }}</div>
              </div>
              <div class="item-subtotal">
                小计: ¥{{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>
          <div v-else class="no-items">
            暂无商品信息
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-address">
            <p><strong>收货人：</strong>{{ order.name }}</p>
            <p><strong>联系电话：</strong>{{ order.phone }}</p>
            <p><strong>收货地址：</strong>{{ order.address }}</p>
          </div>
          
          <div class="order-total">
            总计：<span class="total-price">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
          
          <div class="order-actions">
            <button 
              v-if="order.status === 'PENDING'" 
              @click="payOrder(order.orderId)" 
              class="btn btn-primary"
              :disabled="paymentLoading === order.orderId"
            >
              {{ paymentLoading === order.orderId ? '处理中...' : '去支付' }}
            </button>
            <button 
              v-if="order.status === 'SUCCESS'"
              @click="viewOrderDetails(order.orderId)"
              class="btn btn-outline-primary"
            >
              查看详情
            </button>
          </div>
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
            <p>订单号: {{ currentOrderId }}</p>
            <p>正在准备支付...</p>
          </div>
          
          <div v-if="paymentForm && !formSubmitted" class="payment-fallback">
            <p>如果页面没有自动跳转到支付页面，请点击下面的按钮：</p>
            <button @click="submitPaymentForm" class="btn btn-primary">立即支付</button>
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
// 导入订单服务 - 确保路径正确
import { defineComponent } from 'vue'
import api from '@/api';
import type { AxiosError } from 'axios';
import type { Order, ErrorResponse } from '@/types/api';

export default defineComponent({
  name: 'OrderPage',
  data() {
    return {
      orders: [] as Order[],
      loading: false,
      paymentLoading: null as number | null, // 记录正在支付的订单ID
      errorMessage: '',
      showPaymentForm: false,
      paymentForm: null as string | null,
      currentOrderId: null as number | null,
      formSubmitted: false,
      selectedTab: 'all' as 'all' | 'ongoing' | 'completed'
    };
  },
  computed: {
    filteredOrders(): Order[] {
      if (!this.orders) return [];
      if (this.selectedTab === 'all') return this.orders;

      const ongoingStatuses = ['PENDING', 'PAID', 'SUCCESS', 'DELIVERED'];
      const completedStatuses = ['COMPLETED'];

      if (this.selectedTab === 'ongoing') {
        return this.orders.filter(o => ongoingStatuses.includes(o.status));
      }
      if (this.selectedTab === 'completed') {
        return this.orders.filter(o => completedStatuses.includes(o.status));
      }
      return this.orders;
    }
  },
  created() {
    this.fetchOrders();
  },
  methods: {
    getToken(): string | null {
      return localStorage.getItem('token');
    },

    ensureAuth(): boolean {
      const token = this.getToken();
      if (!token) {
        ElMessage({
          type: 'warning',
          message: '请先登录后查看订单'
        });
        this.$router.push({ name: 'Login' });
        return false;
      }
      return true;
    },

    // 获取订单列表
    async fetchOrders(): Promise<void> {
      if (!this.ensureAuth()) return;
      this.loading = true;
      this.errorMessage = '';
      
      try {
        // 使用API模块获取当前用户的订单列表
        const response = await api.order.getOrders();
        
        if (response.code === '200') {
          this.orders = response.data || [];
        } else {
          this.errorMessage = response.msg || '获取订单列表失败，请稍后重试';
          this.orders = [];
        }
      } catch (error: unknown) {
        console.error('获取订单列表失败:', error);
        const axiosError = error as AxiosError<ErrorResponse>
        this.errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.msg || '获取订单列表失败，请稍后重试';
        this.orders = [];
      } finally {
        this.loading = false;
      }
    },

    setTab(tab: 'all' | 'ongoing' | 'completed') {
      this.selectedTab = tab;
    },
    
    // 刷新订单列表
    refreshOrders() {
      this.fetchOrders();
    },
    
    // 发起支付
    async payOrder(orderId: number): Promise<void> {
      this.paymentLoading = orderId;
      
      try {
        // 使用API模块调用支付接口
        const response = await api.order.payOrder(orderId);
        
        if (response.code === '200' && response.data && response.data.paymentForm) {
          // 创建一个新的窗口
          const paymentWindow = window.open('', '_blank');
          
          // 将支付表单写入新窗口
          if (paymentWindow) {
            paymentWindow.document.write(response.data.paymentForm);
            paymentWindow.document.close();
          } else {
            alert('浏览器阻止了弹出窗口，请允许弹出窗口后重试');
          }
          
          // 刷新订单状态
          setTimeout(() => {
            this.refreshOrders();
          }, 3000);
        } else {
          // 处理其他情况
          alert('支付请求失败或返回数据格式不正确');
          console.error('支付响应数据:', response);
        }
      } catch (error: unknown) {
        console.error('支付失败:', error);
        const axiosError = error as AxiosError<ErrorResponse>
        alert(axiosError.response?.data?.message || axiosError.response?.data?.msg || '支付失败，请稍后重试');
      } finally {
        this.paymentLoading = null;
      }
    },
    
    // 关闭支付表单
    closePaymentForm() {
      this.showPaymentForm = false;
      this.paymentForm = null;
      this.currentOrderId = null;
      this.formSubmitted = false;
      // 关闭支付窗口后刷新订单状态
      this.refreshOrders();
    },
    
    // 查看订单详情
    async viewOrderDetails(orderId: number): Promise<void> {
      try {
        await api.order.getOrderById(orderId);
        
        // 可以跳转到订单详情页面
        this.$router.push({
          name: 'OrderDetail',
          params: { orderId }
        });
        
        // 或者显示详情模态框
        // console.log('订单详情:', response.data);
        
      } catch (error: unknown) {
        console.error('获取订单详情失败:', error);
        const axiosError = error as AxiosError<ErrorResponse>
        alert(axiosError.response?.data?.message || axiosError.response?.data?.msg || '获取订单详情失败');
      }
    },
    
    // 格式化日期
    formatDate(dateString: string | undefined): string {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    // 获取状态文本
    getStatusText(status: string): string {
      const statusMap: Record<string, string> = {
        'PENDING': '待支付',
        'PAID': '已支付',
        'SUCCESS': '支付成功',
        'DELIVERED': '已发货',
        'COMPLETED': '已完成',
        'FAILED': '支付失败',
        'CANCELLED': '已取消',
        'TIMEOUT': '支付超时'
      };
      return statusMap[status] || status;
    },
    
    // 获取状态样式类
    getStatusClass(status: string): string {
      const classMap: Record<string, string> = {
        'PENDING': 'status-pending',
        'PAID': 'status-success',
        'SUCCESS': 'status-success',
        'DELIVERED': 'status-success',
        'COMPLETED': 'status-success',
        'FAILED': 'status-failed',
        'CANCELLED': 'status-timeout',
        'TIMEOUT': 'status-timeout'
      };
      return classMap[status] || '';
    },
    
    submitPaymentForm() {
      const formElement = document.querySelector('.payment-modal form') as HTMLFormElement | null;
      if (formElement) {
        this.formSubmitted = true;
        formElement.submit();
      }
    },
    
    // 处理图片加载错误
    handleImageError(event: Event) {
      const target = event.target as HTMLImageElement | null;
      if (!target) return;
      
      // 防止无限循环
      target.onerror = null;
      // 设置占位符图片
      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E暂无图片%3C/text%3E%3C/svg%3E';
    }
  }
});
</script>


<style scoped>
.order-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f5f5;
}

.order-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #007bff;
  background: #fff;
  color: #007bff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

.tab-btn:hover {
  transform: translateY(-1px);
}

h1 {
  margin-top: 50px;
  margin-bottom: 30px;
}

.empty-orders {
  text-align: center;
  padding: 20px 0;
}

.orders-container {
  display: flex;
  flex-direction: column;
  gap: 25px; /* 增加订单之间的间距 */
}

.order-card {
  background: #fff;
  border-radius: 12px; /* 增加圆角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 增强阴影 */
  overflow: hidden;
  border: 2px solid #e9ecef; /* 添加边框 */
  transition: all 0.3s ease; /* 添加过渡效果 */
  position: relative;
}

.order-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); /* 悬停时增强阴影 */
  transform: translateY(-2px); /* 轻微上移效果 */
}

/* 为每个订单添加左侧色条 */
.order-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #007bff, #0056b3);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px; /* 增加内边距 */
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); /* 渐变背景 */
  border-bottom: 2px solid #dee2e6; /* 加粗分隔线 */
  position: relative;
}

.order-number {
  font-weight: bold;
  font-size: 16px;
  color: #2c3e50;
}

.order-date {
  color: #6c757d;
  font-size: 14px;
}

.order-status {
  padding: 6px 16px; /* 增加内边距 */
  border-radius: 20px; /* 更圆润的胶囊形状 */
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.status-pending {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-success {
  background: linear-gradient(135deg, #d4edda, #81c784);
  color: #155724;
  border: 1px solid #81c784;
}

.status-failed {
  background: linear-gradient(135deg, #f8d7da, #e57373);
  color: #721c24;
  border: 1px solid #e57373;
}

.status-timeout {
  background: linear-gradient(135deg, #e9ecef, #bdbdbd);
  color: #495057;
  border: 1px solid #bdbdbd;
}

/* 订单摘要信息 */
.order-summary {
  padding: 15px 25px;
  background-color: #fafafa;
  border-bottom: 1px solid #e0e0e0;
}

.payment-method {
  font-size: 14px;
  color: #555;
}

/* 订单商品信息样式 */
.order-items {
  padding: 15px 25px;
  background-color: #fafafa;
  border-bottom: 1px solid #e0e0e0;
}

.items-title {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #dee2e6;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.item-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-title {
  font-weight: 600;
  color: #343a40;
  margin-bottom: 5px;
}

.item-price {
  color: #6c757d;
  font-size: 13px;
}

.item-subtotal {
  font-weight: 600;
  color: #dc3545;
}

.no-items {
  text-align: center;
  color: #6c757d;
  padding: 10px;
  font-style: italic;
}

.order-footer {
  padding: 20px 25px; /* 增加内边距 */
  border-top: 2px solid #dee2e6; /* 加粗分隔线 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  position: relative;
}

/* 为页脚添加上边框装饰 */
.order-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 25px;
  right: 25px;
  height: 2px;
  background: linear-gradient(to right, #007bff, #0056b3);
}

.order-address {
  flex: 1;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  margin-right: 20px;
}

.order-address p {
  margin: 5px 0;
  font-size: 14px;
  color: #495057;
}

.order-address strong {
  color: #2c3e50;
}

.order-total {
  font-size: 18px;
  margin: 0 20px;
  padding: 15px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.total-price {
  font-weight: bold;
  color: #dc3545;
  font-size: 20px;
}

.order-actions {
  text-align: right;
}

/* 为整个订单容器添加编号装饰 */
.order-card {
  counter-increment: order-counter;
}

.order-card::after {
  content: counter(order-counter);
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

.orders-container {
  counter-reset: order-counter;
}

/* Modal styles */
.payment-modal {
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
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #dee2e6;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.modal-body {
  padding: 25px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #dc3545;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

.btn-outline-primary {
  background-color: transparent;
  border: 2px solid #007bff;
  color: #007bff;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

/* Error message */
.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-page {
    padding: 15px;
  }

  .orders-container {
    gap: 20px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 15px 20px;
  }

  .order-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    padding: 15px 20px;
  }

  .order-address {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .order-total {
    margin: 0;
    text-align: center;
  }

  .order-actions {
    text-align: center;
  }
  
  .item-card {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  
  .item-image {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
  
  .item-subtotal {
    align-self: flex-end;
  }
}
</style>