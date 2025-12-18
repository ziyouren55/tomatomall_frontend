<template>
  <div class="coupon-detail">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <i class="error-icon">⚠️</i>
      <p>{{ error }}</p>
      <button @click="fetchCoupon" class="retry-btn">重试</button>
    </div>
    
    <div v-else-if="coupon" class="detail-content">
      <div class="coupon-header">
        <h1>{{ coupon.name }}</h1>
        <div class="coupon-status" :class="statusClass">
          {{ statusText }}
        </div>
      </div>
      
      <div class="coupon-info">
        <div class="info-card">
          <div class="info-item">
            <label>优惠券ID:</label>
            <span>{{ coupon.id }}</span>
          </div>
          <div class="info-item">
            <label>优惠:</label>
            <span class="discount-value">{{ discountText }}</span>
          </div>
          <div class="info-item">
            <label>门槛:</label>
            <span>满 {{ coupon.minimumPurchase || 0 }} 可用</span>
          </div>
          <div class="info-item">
            <label>有效期:</label>
            <span>{{ formatRange(coupon.validFrom, coupon.validTo) }}</span>
          </div>
          <div class="info-item">
            <label>创建时间:</label>
            <span>{{ formatDate(coupon.createTime) }}</span>
          </div>
          <div class="info-item">
            <label>兑换所需积分:</label>
            <span>{{ coupon.pointsRequired ?? 0 }} 积分</span>
          </div>
        </div>
        
        <div class="description-section">
          <h3>优惠券描述</h3>
          <p>{{ coupon.description || '暂无描述' }}</p>
        </div>
        
        <div class="terms-section">
          <h3>使用条款</h3>
          <ul>
            <li v-for="(term, index) in coupon.terms" :key="index">{{ term }}</li>
            <li v-if="!coupon.terms || coupon.terms.length === 0">无特殊使用条款</li>
          </ul>
        </div>
      </div>
      
      <div class="action-buttons">
        <button v-if="canExchange" @click="exchangeCoupon" class="btn-exchange">
          <i class="icon-exchange"></i> 兑换优惠券
        </button>
        
        <button v-if="canUse" @click="useCoupon" class="btn-use">
          <i class="icon-use"></i> 立即使用
        </button>
        
        <button @click="goBack" class="btn-back">
          <i class="icon-back"></i> 返回
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';
import type { Coupon } from '@/types/api'

export default defineComponent({
  name: 'CouponDetail',
  props: {
    couponId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      coupon: null as Coupon | null,
      loading: false,
      error: null as string | null
    };
  },
  computed: {
    discountText(): string {
      const coupon = this.coupon as any;
      if (!coupon) return '';
      if (coupon.discountAmount) return `¥${coupon.discountAmount}`;
      if (coupon.discountPercentage) return `${coupon.discountPercentage}%`;
      return '优惠券';
    },
    statusText(): string {
      if (!this.coupon) return '';
      
      const end = (this.coupon as any).validTo || (this.coupon as any).expiryDate;
      if (end && new Date() > new Date(end)) {
        return '已过期';
      }
      
      if (this.coupon.status === 1 || (this.coupon as any).isUsed) {
        return '已使用';
      }
      
      return '可使用';
    },
    statusClass(): string {
      if (this.statusText === '已过期') return 'expired';
      if (this.statusText === '已使用') return 'used';
      return 'active';
    },
    canExchange(): boolean {
      // 只要未过期且可使用的优惠券都可以兑换（包括 0 积分的优惠券）
      if (!this.coupon) return false;
      return this.statusText === '可使用';
    },
    canUse(): boolean {
      // 只有未使用且未过期的优惠券才能使用
      if (!this.coupon) return false;
      return this.statusText === '可使用';
    }
  },
  mounted() {
    this.fetchCoupon();
  },
  methods: {
    async fetchCoupon(): Promise<void> {
      this.loading = true;
      this.error = null;
      
      try {
        const idVal = (this.couponId ?? (this as any).$route?.params?.id) as string | number | undefined;
        const couponIdNum = Number(idVal);
        if (!idVal || Number.isNaN(couponIdNum)) {
          throw new Error('优惠券ID格式错误');
        }
        const response = await api.coupon.getCouponDetail(couponIdNum);
        this.coupon = response.data;
      } catch (error) {
        this.error = '获取优惠券详情失败，请稍后重试';
        console.error('获取优惠券详情失败:', error);
      } finally {
        this.loading = false;
      }
    },
    formatDate(date: string | undefined): string {
      if (!date) return '';
      return new Date(date).toLocaleString();
    },
    formatRange(start?: string | undefined, end?: string | undefined): string {
      const s = start ? new Date(start).toLocaleDateString() : '即时';
      const e = end ? new Date(end).toLocaleDateString() : '长期';
      return `${s} ~ ${e}`;
    },
    exchangeCoupon() {
      if (this.coupon?.id) {
        this.$emit('exchange', this.coupon.id);
      }
    },
    useCoupon() {
      if (this.coupon?.id) {
        this.$emit('use', this.coupon.id);
      }
    },
    goBack() {
      this.$router.go(-1);
    }
  }
});
</script>

<style scoped>
.coupon-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(37, 117, 252, 0.3);
  border-radius: 50%;
  border-top-color: #2575fc;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: #e74c3c;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.retry-btn {
  margin-top: 15px;
  padding: 8px 20px;
  background: #2575fc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #1a68e8;
}

.coupon-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.coupon-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.coupon-status {
  display: inline-block;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
}

.coupon-status.active {
  background: #28a745;
  color: white;
}

.coupon-status.used {
  background: #6c757d;
  color: white;
}

.coupon-status.expired {
  background: #dc3545;
  color: white;
}

.info-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  width: 150px;
  font-weight: 500;
  color: #666;
}

.info-item span {
  flex: 1;
}

.discount-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
}

.description-section, .terms-section {
  margin-bottom: 25px;
}

.description-section h3, .terms-section h3 {
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.description-section p {
  line-height: 1.6;
  color: #555;
}

.terms-section ul {
  padding-left: 20px;
}

.terms-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.btn-exchange, .btn-use, .btn-back {
  flex: 1;
  min-width: 200px;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
}

.btn-exchange {
  background: #ffc107;
  color: #333;
}

.btn-exchange:hover {
  background: #e0a800;
}

.btn-use {
  background: #28a745;
  color: white;
}

.btn-use:hover {
  background: #218838;
}

.btn-back {
  background: #6c757d;
  color: white;
}

.btn-back:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-exchange, .btn-use, .btn-back {
    width: 100%;
  }
}
</style>