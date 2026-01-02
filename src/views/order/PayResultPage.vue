<template>
  <div class="pay-result">
    <h2>支付结果</h2>
    <div class="status" :class="statusClass">
      {{ statusText }}
    </div>
    <div class="info">
      <p v-if="displayOrderNo"><strong>订单号：</strong>{{ displayOrderNo }}</p>
      <p v-if="amount"><strong>金额：</strong>¥{{ amount }}</p>
    </div>
    <div class="actions">
      <router-link
        v-if="orderId && !isNaN(Number(orderId))"
        class="btn primary"
        :to="`/order/${orderId}`"
      >查看订单</router-link>
      <router-link
        v-else
        class="btn primary"
        to="/order"
      >查看订单</router-link>
      <router-link class="btn" to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import api from '@/api';

export default defineComponent({
  name: 'PayResult',
  data() {
    return {
      orderDetail: null as any
    };
  },
  computed: {
    status(): string {
      return (this.$route.query.status as string) || (this.$route.query.pay as string) || 'success';
    },
    orderId(): string | undefined {
      return this.$route.query.orderId as string | undefined;
    },
    amount(): string | undefined {
      return this.$route.query.amount as string | undefined;
    },
    displayOrderNo(): string | undefined {
      return this.orderDetail?.orderNo || this.orderId;
    },
    statusText(): string {
      const map: Record<string, string> = {
        success: '支付成功',
        SUCCESS: '支付成功',
        PAID: '支付成功',
        FAILED: '支付失败',
        TIMEOUT: '支付超时',
      };
      return map[this.status] || '支付结果未知';
    },
    statusClass(): string {
      return this.status && this.status.toLowerCase() === 'success' ? 'ok' : 'fail';
    }
  },
  async mounted() {
    // 如果有orderId，尝试获取订单详情来显示订单号
    if (this.orderId) {
      try {
        const res = await api.order.getOrderById(Number(this.orderId));
        this.orderDetail = res;
      } catch (e) {
        console.error('获取订单详情失败:', e);
      }
    }
  }
});
</script>

<style scoped>
.pay-result {
  max-width: 520px;
  margin: 80px auto;
  padding: 24px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  text-align: center;
}
.status {
  font-size: 20px;
  font-weight: 700;
  margin: 16px 0;
}
.status.ok {
  color: #16a34a;
}
.status.fail {
  color: #dc2626;
}
.info p {
  margin: 6px 0;
  color: #444;
}
.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
.btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
}
.btn.primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: #fff;
  border: none;
}
</style>

