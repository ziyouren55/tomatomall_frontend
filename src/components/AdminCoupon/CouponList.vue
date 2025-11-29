<template>
  <div>
    <h2>优惠券列表</h2>
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名称</th>
          <th>折扣</th>
          <th>有效期</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="coupon in coupons" :key="coupon.id">
          <td>{{ coupon.id }}</td>
          <td>{{ coupon.name }}</td>
          <td>{{ coupon.discount }}%</td>
          <td>{{ formatDate(coupon.expiryDate) }}</td>
          <td>
            <button @click="viewDetail(coupon.id)" class="btn btn-info">查看</button>
            <button @click="editCoupon(coupon.id)" class="btn btn-warning">编辑</button>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="createNew" class="btn btn-primary">新建优惠券</button>
  </div>
</template>

<script>
import services from '@/api/services';

export default {
  data() {
    return {
      coupons: []
    };
  },
  mounted() {
    this.fetchCoupons();
  },
  methods: {
    async fetchCoupons() {
      try {
        const response = await services.getAllCoupons();
        this.coupons = response.data;
      } catch (error) {
        console.error('获取优惠券失败:', error);
      }
    },
    viewDetail(id) {
      this.$router.push(`/admin/coupons/${id}`);
    },
    editCoupon(id) {
      this.$router.push(`/admin/coupons/edit/${id}`);
    },
    createNew() {
      this.$router.push('/admin/coupons/create');
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    }
  }
};
</script>