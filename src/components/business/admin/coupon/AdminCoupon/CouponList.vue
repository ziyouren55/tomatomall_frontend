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

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';
import type { Coupon } from '@/types/api';

export default defineComponent({
  name: 'CouponList',
  data() {
    return {
      coupons: [] as Coupon[]
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
    formatDate(date: string | Date | undefined): string {
      if (!date) return '长期有效';
      return new Date(date).toLocaleDateString();
    }
  }
});
</script>