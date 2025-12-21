<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2>优惠券列表</h2>
        <p class="sub">查看、编辑并创建新的优惠券</p>
      </div>
      <div class="actions">
        <select v-model="selectedCouponId" class="select">
          <option disabled value="">选择一个优惠券用于全体发放</option>
          <option v-for="c in coupons" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <button @click="issueAll" class="btn ghost">全体发放</button>
        <button @click="toIssue" class="btn ghost">发放优惠券</button>
        <button @click="createNew" class="btn-primary">+ 新建优惠券</button>
      </div>
    </div>

    <div class="card-grid">
      <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card">
        <div class="card-header">
          <div>
            <div class="name">{{ coupon.name }}</div>
            <div class="id">ID: {{ coupon.id }}</div>
          </div>
          <div class="badge" :class="coupon.isActive ? 'on' : 'off'">
            {{ coupon.isActive ? '进行中' : '下架' }}
          </div>
        </div>

        <div class="card-body">
          <div class="metric">
            <span class="label">优惠</span>
            <span class="value highlight">{{ discountText(coupon) }}</span>
          </div>
          <div class="metric">
            <span class="label">门槛</span>
            <span class="value">满 {{ coupon.minimumPurchase || 0 }} 可用</span>
          </div>
          <div class="metric">
            <span class="label">有效期</span>
            <span class="value">{{ formatRange(coupon.validFrom, coupon.validTo) }}</span>
          </div>
          <div class="metric" v-if="coupon.pointsRequired">
            <span class="label">积分兑换</span>
            <span class="value">{{ coupon.pointsRequired }} 分</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn ghost" @click="viewDetail(coupon.id)">查看</button>
          <button class="btn" @click="editCoupon(coupon.id)">编辑</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';
import type { Coupon } from '@/types/api.ts';

export default defineComponent({
  name: 'CouponList',
  data() {
    return {
      coupons: [] as Coupon[],
      selectedCouponId: '' as string | number
    };
  },
  mounted() {
    this.fetchCoupons();
  },
  methods: {
    async fetchCoupons(): Promise<void> {
      try {
        const response = await api.coupon.getAllCoupons();
        this.coupons = response.data;
      } catch (error) {
        console.error('获取优惠券失败:', error);
      }
    },
    viewDetail(id: number): void {
      this.$router.push(`/admin/coupons/${id}`);
    },
    editCoupon(id: number): void {
      this.$router.push(`/admin/coupons/edit/${id}`);
    },
    createNew(): void {
      this.$router.push('/admin/coupons/create');
    },
    toIssue(): void {
      this.$router.push('/admin/coupons/issue');
    },
    async issueAll(): Promise<void> {
      if (!this.selectedCouponId) {
        alert('请选择要发放的优惠券');
        return;
      }
      try {
        await api.coupon.issueCouponToAll(Number(this.selectedCouponId));
        alert('已向全体用户发放该优惠券');
      } catch (e) {
        console.error('全体发放失败', e);
        alert('发放失败，请稍后重试');
      }
    },
    discountText(coupon: any): string {
      if (coupon.discountAmount) return `¥${coupon.discountAmount}`;
      if (coupon.discountPercentage) return `${coupon.discountPercentage}%`;
      if (coupon.discount) return `${coupon.discount}%`;
      return '-';
    },
    formatRange(start?: string | Date, end?: string | Date): string {
      const s = start ? new Date(start).toLocaleDateString() : '即时';
      const e = end ? new Date(end).toLocaleDateString() : '长期';
      return `${s} ~ ${e}`;
    }
  }
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}
.sub {
  margin: 4px 0 0;
  color: #666;
  font-size: 13px;
}
.btn-primary {
  background: linear-gradient(135deg, #2575fc 0%, #6a11cb 100%);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.btn.ghost {
  background: #f1f3f5;
  color: #333;
  border: 1px solid #e5e7eb;
}
.btn.ghost:hover { background: #e2e6ea; }
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.coupon-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #f0f2f5;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.name {
  font-size: 16px;
  font-weight: 600;
}
.id {
  color: #999;
  font-size: 12px;
}
.badge {
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}
.badge.on {
  background: #e8f5e9;
  color: #2e7d32;
}
.badge.off {
  background: #fbe9e7;
  color: #d84315;
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.metric {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #555;
}
.label {
  color: #777;
}
.value {
  font-weight: 600;
}
.highlight {
  color: #e74c3c;
}
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}
.btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #2575fc;
  color: #fff;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn:hover { background: #1f66dc; }
.btn.ghost {
  background: #f1f3f5;
  color: #333;
}
.btn.ghost:hover { background: #e2e6ea; }
.select {
  min-width: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 10px;
}

@media (max-width: 640px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
