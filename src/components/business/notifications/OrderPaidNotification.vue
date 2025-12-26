<template>
  <div class="notif-order-paid">
    <div>订单 <strong>#{{ payload.orderId }}</strong> 已支付</div>
    <div>金额：¥{{ payload.amount ?? payload.total ?? '' }}</div>
    <div style="margin-top:8px;">
      <el-button type="primary" size="small" @click.stop="goOrder">查看订单</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ payload: any }>()
const emit = defineEmits(['open'])
const goOrder = () => {
  // delegate open action to parent so parent can mark read and update badge
  emit('open')
}
</script>

<style scoped>
.notif-order-paid { font-size: 13px; color: #333; }
</style>


