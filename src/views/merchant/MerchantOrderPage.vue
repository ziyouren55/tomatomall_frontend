<template>
  <div class="merchant-order-page">
    <h2>订单详情（商家视图）</h2>
    <div v-if="order">
      <div>订单号：{{ order.orderId }}</div>
      <div>状态：{{ order.status }}</div>
      <div>买家：{{ order.name || '匿名' }} / {{ order.phone || '' }}</div>
    <div style="margin-top:12px;">
      <template v-if="canShip">
        <button @click="showShip = true">标记已发货</button>
      </template>
      <div v-if="showShip" style="margin-top:8px;">
        <ShippingForm
          :loading="shippingLoading"
          @ship="handleShip"
          @cancel="showShip = false"
        />
      </div>
    </div>
      <hr/>
      <div v-if="order.orderItems && order.orderItems.length">
        <div v-for="item in order.orderItems" :key="item.productId" class="item">
          <div><strong>{{ item.title }}</strong> x {{ item.quantity }}</div>
          <div>单价：¥{{ item.price }} 小计：¥{{ item.subtotal }}</div>
          <div>店铺：{{ item.storeName || item.storeId }}</div>
        </div>
      </div>
      <div v-else>该订单没有属于你的商品</div>
    </div>
    <div v-else class="empty">正在加载...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import ShippingForm from '@/components/business/order/ShippingForm.vue'

const route = useRoute()
const order = ref<any>(null)
const showShip = ref(false)
const shippingLoading = ref(false)

const canShip = computed(() => {
  if (!order.value || !order.value.status) return false
  return order.value.status === 'PAID' || order.value.status === 'SUCCESS'
})

const load = async () => {
  const orderId = Number(route.params.orderId)
  try {
    const res = await api.order.getOrderForMerchant(orderId)
    if (res && res.data) order.value = res.data
  } catch (e) {
    console.warn('load merchant order failed', e)
  }
}

onMounted(() => {
  load()
})

const handleShip = async (shipData: { carrier: string; trackingNo: string }) => {
  if (!order.value) return
  const orderId = Number(order.value.orderId)
  try {
    shippingLoading.value = true
    await api.order.shipOrderForMerchant(orderId, shipData)
    showShip.value = false
    // reload order to reflect new status
    await load()
  } catch (e) {
    console.warn('ship failed', e)
  } finally {
    shippingLoading.value = false
  }
}
</script>

<style scoped>
.merchant-order-page { padding: 16px; }
.item { padding: 8px 0; border-bottom: 1px solid #eee; }
</style>


