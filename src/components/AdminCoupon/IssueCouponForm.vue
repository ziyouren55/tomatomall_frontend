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

<script>
import services from '@/api/services';

export default {
  props: ['userId'],
  data() {
    return {
      availableCoupons: [],
      issueData: {
        couponId: null,
        remark: ''
      }
    };
  },
  async mounted() {
    await this.fetchAvailableCoupons();
  },
  methods: {
    async fetchAvailableCoupons() {
      try {
        const response = await services.getAllCoupons();
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
      
      try {
        const issueVO = {
          userId: this.userId,
          couponId: this.issueData.couponId,
          remark: this.issueData.remark
        };
        
        await services.issueCouponToUser(issueVO);
        this.$emit('issued');
        this.$toast.success('优惠券发放成功');
        this.issueData.remark = '';
      } catch (error) {
        console.error('发放优惠券失败:', error);
        this.$toast.error('发放失败，请重试');
      }
    }
  }
};
</script>