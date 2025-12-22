<template>
  <div class="notif-order-shipped">
    <div>订单 <strong>#{{ payload.orderId }}</strong> 已发货</div>
    <div>快递：{{ payload.carrier ?? payload.express ?? '' }} 运单号：{{ payload.trackingNo ?? payload.tracking ?? '' }}</div>
    <div style="margin-top:8px;">
      <el-button type="primary" size="mini" @click.stop="goOrder">查看订单</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ payload: any }>()
const emit = defineEmits(['open'])
const goOrder = () => {
  emit('open')
}
</script>

<style scoped>
.notif-order-shipped { font-size: 13px; color: #333; }
</style>


