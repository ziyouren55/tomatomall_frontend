<template>
  <div>
    <NavigationBar />
    <div class="container">
      <CouponDetail 
        :coupon-id="String($route.params.id || '')" 
        @exchange="handleExchange"
        @use="handleUse"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationBar from '@/components/business/NavigationBar.vue';
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
        const res = await api.coupon.exchangeCoupon(couponId);
        if (res && res.code === '200') {
          alert('优惠券兑换成功！');
          // 刷新优惠券详情
          this.$emit('refresh');
        } else {
          const msg = res?.msg || (res as any)?.message || '';
          if (typeof msg === 'string' && msg.includes('积分不足')) {
            alert('积分不足，兑换失败!');
          } else {
            alert(`兑换失败: ${msg || '未知错误'}`);
          }
        }
      } catch (error: any) {
        console.error('兑换优惠券失败:', error);
        const msg = error?.response?.data?.msg || error?.response?.data?.message || error?.message;
        if (typeof msg === 'string' && msg.includes('积分不足')) {
          alert('积分不足，兑换失败!');
        } else {
          alert(`兑换失败: ${msg || '未知错误'}`);
        }
      }
    },
    handleUse(couponId: number): void {
      // 跳转到订单页面并携带优惠券ID
      this.$router.push({
        name: 'Order',
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