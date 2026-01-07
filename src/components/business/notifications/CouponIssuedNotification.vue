<template>
  <div class="notif-coupon-issued">
    <div>🎁 您收到了一张新优惠券</div>
    <div><strong>{{ payload.couponName }}</strong></div>
    <div style="margin-top:8px;">
      <el-button type="primary" size="small" @click.stop="goCoupons">查看优惠券</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ payload: any }>()
const emit = defineEmits(['open'])

const goCoupons = () => {
  // delegate open action to parent so parent can mark read and update badge
  emit('open')
}
</script>

<style scoped>
.notif-coupon-issued {
  font-size: 13px;
  color: #333;
}
</style>
