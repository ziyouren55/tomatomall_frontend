<template>
  <div class="notif-order-paid">
    <div>订单 <strong>#{{ payload.orderId }}</strong> 已支付</div>
    <div>金额：¥{{ payload.amount ?? payload.total ?? '' }}</div>
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
.notif-order-paid { font-size: 13px; color: #333; }
</style>


