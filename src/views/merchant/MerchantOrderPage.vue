<template>
  <div class="merchant-order-page">
    <h2>订单详情（商家视图）</h2>
    <div v-if="order">
      <div>订单号：{{ order.orderId }}</div>
      <div>状态：{{ order.status }}</div>
      <div>买家：{{ order.name || '匿名' }} / {{ order.phone || '' }}</div>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route = useRoute()
const order = ref<any>(null)

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
</script>

<style scoped>
.merchant-order-page { padding: 16px; }
.item { padding: 8px 0; border-bottom: 1px solid #eee; }
</style>


