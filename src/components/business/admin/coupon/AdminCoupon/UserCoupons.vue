<template>
  <div>
    <h2>用户优惠券管理</h2>
    <div class="form-group">
      <label>输入用户ID:</label>
      <div class="input-group">
        <input v-model="userId" type="number" class="form-control">
        <button @click="fetchUserCoupons" class="btn btn-primary"> 查询 </button>
      </div>
    </div>
    
    <table v-if="userCoupons.length" class="table">
      <thead>
        <tr>
          <th>用户券ID</th>
          <th>券名称</th>
          <th>优惠</th>
          <th>状态</th>
          <th>有效期至</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="uc in userCoupons" :key="uc.id">
          <td>{{ uc.id }}</td>
          <td>{{ uc.couponName }}</td>
          <td>{{ discountText(uc) }}</td>
          <td>{{ statusText(uc) }}</td>
          <td>{{ formatDate(uc.validTo) }}</td>
        </tr>
      </tbody>
    </table>
    
      <div v-if="showIssueForm" class="mt-4">
      <h3>发放优惠券</h3>
      <IssueCouponForm :userId="parseInt(userId, 10)" @issued="handleIssued" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';
import IssueCouponForm from './IssueCouponForm.vue';

type UserCoupon = Record<string, any>

export default defineComponent({
  name: 'UserCoupons',
  components: { IssueCouponForm },
  data() {
    return {
      userId: '',
      userCoupons: [] as UserCoupon[],
      showIssueForm: false
    };
  },
  methods: {
    statusText(uc: UserCoupon): string {
      if (!uc) return '未知';
      const expired = uc.validTo && new Date(uc.validTo).getTime() < Date.now();
      if (expired) return '已过期';
      if (uc.isUsed || uc.status === 1 || uc.usedTime) return '已使用';
      return '未使用';
    },
    async fetchUserCoupons(): Promise<void> {
      if (!this.userId) return;
      
      const userIdNum = typeof this.userId === 'string' ? parseInt(this.userId, 10) : this.userId;
      if (isNaN(userIdNum)) {
        alert('请输入有效的用户ID');
        return;
      }
      
      try {
        const response = await api.coupon.getUserCoupons(userIdNum);
        this.userCoupons = (response.data || []) as UserCoupon[];
        this.showIssueForm = true;
      } catch (error) {
        console.error('获取用户优惠券失败:', error);
        this.userCoupons = [];
        this.showIssueForm = false;
      }
    },
    handleIssued() {
      this.fetchUserCoupons(); // 刷新列表
    },
    discountText(uc: UserCoupon): string {
      if (uc.discountAmount) return `¥${uc.discountAmount}`;
      if (uc.discountPercentage) return `${uc.discountPercentage}%`;
      if (uc.discount) return `${uc.discount}%`;
      return '-';
    },
    formatDate(date?: string | Date): string {
      if (!date) return '—';
      return new Date(date).toLocaleString();
    }
  }
});
</script>