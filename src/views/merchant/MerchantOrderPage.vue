<template>
  <div class="merchant-order-page">
    <h2>订单详情（商家视图）</h2>
    <div v-if="order">
      <div>订单号：{{ order.orderId }}</div>
      <div>状态：{{ order.status }}</div>
      <div class="customer-info">
        <span>买家：</span>
        <img
          :src="customerAvatar"
          :alt="order.name || '顾客'"
          class="customer-avatar clickable-avatar"
          @click="navigateToCustomerProfile"
        />
        <span>{{ order.name || '匿名' }} / {{ order.phone || '' }}</span>
        <el-button
          type="primary"
          size="small"
          @click="startChatWithCustomer"
          :loading="chatLoading"
          style="margin-left: 12px;"
        >
          <el-icon><ChatDotRound /></el-icon>
          联系买家
        </el-button>
      </div>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound } from '@element-plus/icons-vue'
import api from '@/api'
import chatApi from '@/api/modules/chat'
import ShippingForm from '@/components/business/order/ShippingForm.vue'

const route = useRoute()
const router = useRouter()
const order = ref<any>(null)
const showShip = ref(false)
const shippingLoading = ref(false)
const chatLoading = ref(false)
const defaultAvatar = 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2'

// 用户名映射缓存，避免重复请求
const usernameCache = ref<Record<number, string>>({})

const canShip = computed(() => {
  if (!order.value || !order.value.status) return false
  return order.value.status === 'PAID' || order.value.status === 'SUCCESS'
})

// 顾客头像
const customerAvatar = computed(() => {
  // 这里可以根据顾客ID获取头像，或者使用默认头像
  // 暂时使用默认头像，后续可以通过API获取顾客详情来获取真实头像
  return defaultAvatar
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

// 获取用户ID对应的用户名（带缓存）
async function getUsernameById(userId: number): Promise<string> {
  if (usernameCache.value[userId]) {
    return usernameCache.value[userId]
  }

  try {
    const response = await api.user.getUserById(userId)
    if (response && response.code === '200' && response.data?.username) {
      usernameCache.value[userId] = response.data.username
      return response.data.username
    }
  } catch (error) {
    console.error('获取用户名失败:', error)
  }

  return '' // 返回空字符串表示获取失败
}

// 跳转到顾客的个人详情页
async function navigateToCustomerProfile() {
  if (!order.value || !order.value.userId) {
    ElMessage.error('无法获取顾客信息')
    return
  }

  const username = await getUsernameById(order.value.userId)
  if (username) {
    router.push(`/users/${username}`)
  } else {
    ElMessage.error('无法获取顾客信息')
  }
}

// 开始与顾客聊天
async function startChatWithCustomer() {
  if (!order.value || !order.value.userId) {
    ElMessage.error('无法获取顾客信息')
    return
  }

  chatLoading.value = true
  try {
    const response = await chatApi.createChatSessionWithCustomer({
      customerId: order.value.userId
    })

    if (response && response.code === '200' && response.data) {
      // 跳转到聊天页面，并传递会话ID
      router.push({
        path: '/chat',
        query: { sessionId: response.data.id }
      })
    } else {
      ElMessage.error('创建聊天会话失败')
    }
  } catch (error) {
    console.error('发起聊天失败:', error)
    ElMessage.error('发起聊天失败，请稍后重试')
  } finally {
    chatLoading.value = false
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

.customer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.customer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.customer-avatar:hover {
  opacity: 0.8;
}

.clickable-avatar {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.clickable-avatar:hover {
  opacity: 0.8;
}
</style>


