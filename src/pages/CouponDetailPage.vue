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

<script>
import NavigationBar from '@/components/NavigationBar.vue';
import CouponDetail from '@/components/AdminCoupon/CouponDetail.vue';
import services from '@/api/services';

export default {
  components: {
    NavigationBar,
    CouponDetail
  },
  methods: {
    async handleExchange(couponId) {
      try {
        await services.exchangeCoupon(couponId);
        this.$toast.success('优惠券兑换成功！');
        // 刷新优惠券详情
        this.$emit('refresh');
      } catch (error) {
        console.error('兑换优惠券失败:', error);
        this.$toast.error(`兑换失败: ${error.response?.data?.message || '未知错误'}`);
      }
    },
    handleUse(couponId) {
      // 跳转到订单页面或打开使用模态框
      this.$router.push({ 
        name: 'OrderPage', 
        query: { couponId } 
      });
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 15px;
}
</style>