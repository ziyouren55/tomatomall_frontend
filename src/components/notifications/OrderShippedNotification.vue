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
import { useRouter } from 'vue-router'
import { resolveNotificationPath } from '@/utils/notificationRouteResolver'
const props = defineProps<{ payload: any }>()
const router = useRouter()
const goOrder = () => {
  const path = resolveNotificationPath(props.payload)
  if (path) router.push(path).catch(()=>{})
}
</script>

<style scoped>
.notif-order-shipped { font-size: 13px; color: #333; }
</style>


