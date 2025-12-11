<template>
  <div class="order-detail" v-loading="loading">
    <div class="header">
      <h2>订单详情</h2>
      <div class="actions">
        <el-button size="small" @click="$router.push('/order')">返回订单列表</el-button>
        <el-button size="small" type="primary" @click="$router.push('/')">返回首页</el-button>
      </div>
    </div>

    <el-alert
      v-if="errorMessage"
      type="error"
      :closable="false"
      class="mb"
      :title="errorMessage"
    />

    <div v-if="order" class="card">
      <div class="section">
        <h3>基本信息</h3>
        <p><strong>订单号：</strong>{{ order.orderId }}</p>
        <p><strong>状态：</strong>{{ statusText(order.status) }}</p>
        <p><strong>创建时间：</strong>{{ formatDate(order.createTime) }}</p>
        <p><strong>支付方式：</strong>{{ order.paymentMethod }}</p>
        <p><strong>支付金额：</strong>￥{{ order.totalAmount?.toFixed(2) || '0.00' }}</p>
      </div>

      <div class="section">
        <h3>收货信息</h3>
        <p><strong>收货人：</strong>{{ order.name }}</p>
        <p><strong>电话：</strong>{{ order.phone }}</p>
        <p><strong>地址：</strong>{{ order.address }}</p>
      </div>

      <div class="section">
        <h3>商品明细</h3>
        <div v-if="items.length" class="items">
          <div v-for="item in items" :key="item.cartItemId || item.productId || item.title" class="item">
            <img :src="item.cover" :alt="item.title" @error="handleImageError" />
            <div class="meta">
              <div class="title">{{ item.title }}</div>
              <div class="desc">{{ item.description }}</div>
              <div class="price">单价：￥{{ item.price?.toFixed(2) || '0.00' }}</div>
              <div class="qty">数量：{{ item.quantity }}</div>
              <div class="subtotal">小计：￥{{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty">暂无商品明细</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import api from '@/api';
import type { AxiosError } from 'axios';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'OrderDetail',
  data() {
    return {
      order: null as any,
      loading: false,
      errorMessage: '',
      items: [] as any[]
    };
  },
  created() {
    this.fetchDetail();
  },
  methods: {
    getToken(): string | null {
      return localStorage.getItem('token');
    },
    ensureAuth(): boolean {
      const token = this.getToken();
      if (!token) {
        this.errorMessage = '请先登录后查看订单详情';
        this.$router.push({ name: 'Login' });
        return false;
      }
      return true;
    },
    async fetchDetail() {
      if (!this.ensureAuth()) return;
      const orderId = this.$route.params.orderId || this.$route.query.orderId;
      if (!orderId) {
        this.errorMessage = '缺少订单号';
        return;
      }
      try {
        this.loading = true;
        const res = await api.order.getOrderById(Number(orderId));
        if (res && (res as any).data) {
          this.order = (res as any).data;
        } else {
          this.order = res;
        }
        this.items = this.order?.orderItems || this.order?.cartItems || [];
      } catch (e: unknown) {
        const err = e as AxiosError<any>;
        this.errorMessage = err.response?.data?.msg || err.response?.data?.message || '获取订单详情失败';
        ElMessage.error(this.errorMessage);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString: string | undefined) {
      if (!dateString) return '';
      const d = new Date(dateString);
      return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    },
    statusText(status: string) {
      const map: Record<string, string> = {
        PENDING: '待支付',
        PAID: '已支付',
        SUCCESS: '支付成功',
        DELIVERED: '已发货',
        COMPLETED: '已完成',
        FAILED: '支付失败',
        CANCELLED: '已取消',
        TIMEOUT: '支付超时'
      };
      return map[status] || status;
    },
    handleImageError(e: Event) {
      const target = e.target as HTMLImageElement;
      if (target) {
        target.onerror = null;
        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23eee"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENO IMG%3C/text%3E%3C/svg%3E';
      }
    }
  }
});
</script>

<style scoped>
.order-detail {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.actions button + button {
  margin-left: 8px;
}
.card {
  background: #fff;
  border: 1px solid #e6e8eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
}
.section {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}
.section h3 {
  margin-bottom: 10px;
  font-size: 16px;
}
.items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.item {
  display: flex;
  gap: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
}
.item img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border: 1px solid #eee;
  border-radius: 6px;
}
.meta {
  flex: 1;
}
.title {
  font-weight: 650;
  margin-bottom: 6px;
}
.desc {
  color: #666;
  font-size: 12px;
  margin-bottom: 4px;
}
.price, .qty, .subtotal {
  font-size: 13px;
  color: #333;
  line-height: 1.6;
}
.status-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
  background: #eef2ff;
  color: #4f46e5;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.info-grid p {
  margin: 4px 0;
}
.price, .qty, .subtotal {
  font-size: 13px;
  color: #333;
}
.empty {
  color: #777;
  font-style: italic;
}
.mb {
  margin-bottom: 12px;
}
</style>

