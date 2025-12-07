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
          <th>优惠券ID</th>
          <th>名称</th>
          <th>折扣</th>
          <th>状态</th>
          <th>获取时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="uc in userCoupons" :key="uc.id">
          <td>{{ uc.couponId }}</td>
          <td>{{ uc.couponName }}</td>
          <td>{{ uc.discount }}%</td>
          <td>{{ statusText(uc.status) }}</td>
          <td>{{ formatDate(uc.obtainTime) }}</td>
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

interface UserCoupon {
  id: number
  couponId: number
  couponName: string
  discount: number
  status: number
  obtainTime: string | Date
  [key: string]: any
}

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
    statusText(status: number): string {
      const statusMap: Record<number, string> = {
        0: '未使用',
        1: '已使用',
        2: '已过期'
      };
      return statusMap[status] || '未知';
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
        // 后端返回的可能是Coupon[]，但我们需要UserCoupon格式
        // 这里使用类型断言，因为实际返回的数据结构可能不同
        this.userCoupons = (response.data || []) as unknown as UserCoupon[];
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
    formatDate(date: string | Date): string {
      return new Date(date).toLocaleString();
    }
  }
});
</script>