<template>
  <div>
    <NavigationBar />
    <div class="container">
      <CouponDetail 
        :coupon-id="$route.params.id" 
        @exchange="handleExchange"
        @use="handleUse"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationBar from '@/components/common/NavigationBar.vue';
import CouponDetail from '@/components/business/admin/coupon/AdminCoupon/CouponDetail.vue';
import api from '@/api';

export default defineComponent({
  name: 'CouponDetailPage',
  components: {
    NavigationBar,
    CouponDetail
  },
  emits: ['refresh'],
  methods: {
    async handleExchange(couponId: number): Promise<void> {
      try {
        await api.coupon.exchangeCoupon(couponId);
        this.$toast.success('优惠券兑换成功！');
        // 刷新优惠券详情
        this.$emit('refresh');
      } catch (error: any) {
        console.error('兑换优惠券失败:', error);
        this.$toast.error(`兑换失败: ${error.response?.data?.message || '未知错误'}`);
      }
    },
    handleUse(couponId: number): void {
      // 跳转到订单页面或打开使用模态框
      this.$router.push({ 
        name: 'OrderPage', 
        query: { couponId } 
      });
    }
  }
});
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 15px;
}
</style>