<template>
  <div class="notif-order-completed">
    <div>订单 <strong>#{{ payload.orderId }}</strong> 已完成</div>
    <div>金额：¥{{ payload.amount ?? payload.total ?? '' }}</div>
    <div v-if="payload.storeId || payload.merchantId" style="margin-top:6px;">
      <small>店铺：{{ payload.storeId || '-' }} 商家：{{ payload.merchantId || '-' }}</small>
    </div>
    <div style="margin-top:8px;">
      <el-button type="primary" size="mini" @click.stop="goOrder">查看订单</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const props = defineProps<{ payload: any }>()
const router = useRouter()
const goOrder = () => {
  if (!props.payload || !props.payload.orderId) return
  const orderId = props.payload.orderId
  const merchantId = props.payload.merchantId ?? props.payload.storeId ?? null
  if (merchantId) {
    router.push(`/merchant/orders/${orderId}`).catch(()=>{})
  } else {
    router.push(`/order/${orderId}`).catch(()=>{})
  }
}
</script>

<style scoped>
.notif-order-completed { font-size: 13px; color: #333; }
</style>


