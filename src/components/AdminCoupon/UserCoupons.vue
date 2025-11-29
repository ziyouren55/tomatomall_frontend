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
          <td>{{ uc.status | statusText }}</td>
          <td>{{ formatDate(uc.obtainTime) }}</td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="showIssueForm" class="mt-4">
      <h3>发放优惠券</h3>
      <IssueCouponForm :userId="userId" @issued="handleIssued" />
    </div>
  </div>
</template>

<script>
import services from '@/api/services';
import IssueCouponForm from './IssueCouponForm.vue';

export default {
  components: { IssueCouponForm },
  data() {
    return {
      userId: '',
      userCoupons: [],
      showIssueForm: false
    };
  },
  filters: {
    statusText(status) {
      const statusMap = {
        0: '未使用',
        1: '已使用',
        2: '已过期'
      };
      return statusMap[status] || '未知';
    }
  },
  methods: {
    async fetchUserCoupons() {
      if (!this.userId) return;
      
      try {
        const response = await services.getUserCoupons(this.userId);
        this.userCoupons = response.data;
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
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  }
};
</script>