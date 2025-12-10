<template>
  <div class="coupon-card" :class="{'expired': isExpired}">
    <div class="coupon-header">
      <span class="discount">{{ discountText }}</span>
      <span class="status-badge" v-if="isExpired">已过期</span>
      <span class="status-badge" v-else-if="isUsed">已使用</span>
      <span class="status-badge" v-else>可使用</span>
    </div>
    
    <div class="coupon-body">
      <h3>{{ displayName }}</h3>
      <p class="description">{{ displayDescription }}</p>
      
      <div class="coupon-meta">
        <div class="meta-item">
          <i class="icon calendar"></i>
          <span>有效期: {{ formatDate(validTo) }}</span>
        </div>
        <div class="meta-item" v-if="showPoints">
          <i class="icon coin"></i>
          <span>兑换积分: {{ coupon.pointsRequired }}</span>
        </div>
      </div>
    </div>
    
    <div class="coupon-footer">
      <button 
        v-if="showExchange && !isExpired" 
        @click="exchangeCoupon"
        class="btn-exchange"
      >
        兑换
      </button>
      
      <button 
        v-if="showUse && !isExpired && !isUsed" 
        @click="useCoupon"
        class="btn-use"
      >
        使用
      </button>
      
      <button 
        @click="viewDetail"
        class="btn-detail"
      >
        详情
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UserCouponList',
  props: {
    coupon: {
      // 兼容用户券+模板组合结构，放宽为 any
      type: Object as () => any,
      required: true
    },
    showExchange: {
      type: Boolean,
      default: false
    },
    showUse: {
      type: Boolean,
      default: false
    },
    showPoints: {
      type: Boolean,
      default: false
    }
  },
  emits: ['view-detail', 'exchange', 'use'],
  computed: {
    isExpired(): boolean {
      if (!this.validTo) return false;
      return new Date() > new Date(this.validTo);
    },
    isUsed(): boolean {
      const c: any = this.coupon;
      return c.isUsed === true || c.status === 1 || !!c.usedTime;
    },
    discountText(): string {
      const c: any = this.coupon;
      if (c.discountAmount) return `¥${c.discountAmount}`;
      if (c.discountPercentage) return `${c.discountPercentage}%`;
      if (c.discount) return `${c.discount}%`;
      return '优惠券';
    },
    validTo(): string | undefined {
      const c: any = this.coupon;
      return c.validTo || c.expiryDate || c.couponValidTo;
    },
    displayName(): string {
      const c: any = this.coupon;
      return c.couponName || c.name || '优惠券';
    },
    displayDescription(): string {
      const c: any = this.coupon;
      return c.couponDescription || c.description || '';
    },
    targetId(): number | string | undefined {
      const c: any = this.coupon;
      return c.couponId || c.id;
    }
  },
  methods: {
    formatDate(date?: string): string {
      if (!date) return '长期有效';
      return new Date(date).toLocaleDateString();
    },
    viewDetail(): void {
      if (!this.targetId) return;
      this.$emit('view-detail', this.targetId);
    },
    exchangeCoupon(): void {
      if (!this.targetId) return;
      this.$emit('exchange', this.targetId);
    },
    useCoupon(): void {
      if (!this.targetId) return;
      this.$emit('use', this.targetId);
    }
  }
});
</script>

<style scoped>
.coupon-card {
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  position: relative;
  max-width: 350px;
}

.coupon-card:hover {
  transform: translateY(-5px);
}

.coupon-card.expired {
  background: linear-gradient(135deg, #4a4a4a 0%, #7b7b7b 100%);
  opacity: 0.8;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.1);
}

.discount {
  font-size: 2.5rem;
  font-weight: bold;
}

.status-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.coupon-body {
  padding: 20px;
}

.coupon-body h3 {
  margin: 0 0 10px;
  font-size: 1.5rem;
}

.description {
  font-size: 0.95rem;
  opacity: 0.9;
  margin-bottom: 15px;
  min-height: 40px;
}

.coupon-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 15px;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 20px;
  height: 20px;
  display: inline-block;
  background-size: contain;
  background-repeat: no-repeat;
}

.icon.calendar {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z'/%3E%3C/svg%3E");
}

.icon.coin {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43.96 0 1.69.25 2.21.64l.68-1.32c-.75-.5-1.73-.82-2.89-.82-2.2 0-3.53 1.22-3.53 3 0 1.76 1.12 2.44 3.13 2.91 1.95.45 2.34 1.06 2.34 1.73 0 .76-.69 1.37-2.1 1.37-1.15 0-2.03-.33-2.6-.8l-.72 1.37c.85.62 1.99 1 3.32 1 2.42 0 3.85-1.19 3.85-3.11 0-1.84-1.16-2.55-3.29-3.02z'/%3E%3C/svg%3E");
}

.coupon-footer {
  display: flex;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.1);
  gap: 10px;
}

.btn-exchange, .btn-use, .btn-detail {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-exchange {
  background-color: #ffc107;
  color: #333;
}

.btn-exchange:hover {
  background-color: #e0a800;
}

.btn-use {
  background-color: #28a745;
  color: white;
}

.btn-use:hover {
  background-color: #218838;
}

.btn-detail {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-detail:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>