<template>
  <div class="merchant-pending-page">
    <h2>订单管理</h2>
    <div class="tabs" style="margin-bottom:12px;">
      <button :class="{ active: activeTab === 'pending' }" @click="setTab('pending')">待发货</button>
      <button :class="{ active: activeTab === 'processed' }" @click="setTab('processed')" style="margin-left:8px;">已处理</button>
    </div>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-if="orders.length === 0">当前没有{{ activeTab === 'pending' ? '待发货' : '已处理' }}订单</div>
      <div v-for="o in orders" :key="o.orderId" class="order">
        <div>
          <strong>订单 #{{ o.orderId }}</strong> - 状态: {{ o.status }} - 买家: {{ o.name || '匿名' }}
        </div>
        <div style="margin-top:6px;">
          <button @click="goDetail(o.orderId)">查看详情</button>
          <button v-if="activeTab === 'pending'" @click="openQuickShip(o.orderId)" style="margin-left:8px;">快速发货</button>
        </div>
      </div>
    </div>

    <div v-if="showShip" class="modal">
      <div class="modal-body">
        <h3>快速发货 - 订单 #{{ shipOrderId }}</h3>
        <ShippingForm
          :loading="shippingLoading"
          @ship="handleShip"
          @cancel="closeQuickShip"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'
import { useRouter } from 'vue-router'
import ShippingForm from '@/components/business/order/ShippingForm.vue'

const orders = ref<any[]>([])
const loading = ref(true)
const activeTab = ref<'pending'|'processed'>('pending')
const showShip = ref(false)
const shipOrderId = ref<number | null>(null)
const shippingLoading = ref(false)
const router = useRouter()

const load = async () => {
  loading.value = true
  try {
    let res
    if (activeTab.value === 'pending') {
      res = await api.order.getPendingOrdersForMerchant()
    } else {
      res = await api.order.getProcessedOrdersForMerchant()
    }
    if (res && res.data) orders.value = res.data
  } catch (e) {
    console.warn('load orders failed', e)
  } finally {
    loading.value = false
  }
}

const setTab = async (tab: 'pending'|'processed') => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  await load()
}

const goDetail = (orderId: number) => {
  router.push({ path: `/merchant/orders/${orderId}` })
}

const openQuickShip = (orderId: number) => {
  shipOrderId.value = orderId
  showShip.value = true
}

const closeQuickShip = () => {
  showShip.value = false
  shipOrderId.value = null
  shippingLoading.value = false
}

const handleShip = async (shipData: { carrier: string; trackingNo: string }) => {
  if (!shipOrderId.value) return
  try {
    shippingLoading.value = true
    await api.order.shipOrderForMerchant(shipOrderId.value, shipData)
    closeQuickShip()
    await load()
    alert('发货成功')
  } catch (e) {
    console.warn('quick ship failed', e)
    alert('发货失败')
  } finally {
    shippingLoading.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.merchant-pending-page { padding: 16px; }
.order { padding: 12px 0; border-bottom: 1px solid #eee; }
.modal { position: fixed; left:0; right:0; top:0; bottom:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3); }
.modal-body { background: #fff; padding: 16px; border-radius:6px; min-width:320px; }
</style>


