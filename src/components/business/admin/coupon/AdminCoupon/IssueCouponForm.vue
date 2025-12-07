<template>
  <div>
    <form @submit.prevent="issueCoupon">
      <div class="form-row">
        <div class="form-group col-md-6">
          <label>选择优惠券</label>
          <select v-model="issueData.couponId" class="form-control" required>
            <option v-for="coupon in availableCoupons" :key="coupon.id" :value="coupon.id">
              {{ coupon.name }} ({{ coupon.discount }}%)
            </option>
          </select>
        </div>
        <div class="form-group col-md-6">
          <label>备注</label>
          <input v-model="issueData.remark" type="text" class="form-control">
        </div>
      </div>
      <button type="submit" class="btn btn-success">发放优惠券</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';
import type { Coupon } from '@/types/api';

export default defineComponent({
  name: 'IssueCouponForm',
  props: {
    userId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['issued'],
  data() {
    return {
      availableCoupons: [] as Coupon[],
      issueData: {
        couponId: null as number | null,
        remark: ''
      }
    };
  },
  async mounted() {
    await this.fetchAvailableCoupons();
  },
  methods: {
    async fetchAvailableCoupons(): Promise<void> {
      try {
        const response = await api.coupon.getAllCoupons();
        this.availableCoupons = response.data;
        if (this.availableCoupons.length) {
          this.issueData.couponId = this.availableCoupons[0].id;
        }
      } catch (error) {
        console.error('获取优惠券列表失败:', error);
      }
    },
    async issueCoupon() {
      if (!this.userId || !this.issueData.couponId) return;
      
      const userIdNum = typeof this.userId === 'string' ? parseInt(this.userId, 10) : this.userId;
      if (isNaN(userIdNum as number)) {
        alert('用户ID格式错误');
        return;
      }
      
      try {
        const issueVO = {
          userId: userIdNum as number,
          couponId: this.issueData.couponId,
          remark: this.issueData.remark
        };
        
        await api.coupon.issueCouponToUser(issueVO);
        this.$emit('issued');
        alert('优惠券发放成功');
        this.issueData.remark = '';
      } catch (error) {
        console.error('发放优惠券失败:', error);
        alert('发放失败，请重试');
      }
    }
  }
});
</script>