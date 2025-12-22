<template>
  <div class="notifications-page">
    <h2>消息中心</h2>
    <div class="actions">
      <el-button type="primary" @click="load">刷新</el-button>
      <el-button @click="markAllRead">全部标为已读</el-button>
    </div>

    <div v-if="items.length" class="notif-list">
      <div v-for="item in items" :key="item.id" class="notif-item" :class="{ unread: !item.readFlag }" @click="open(item)">
        <div class="left">
          <div class="type">{{ item.type }}</div>
          <div class="payload" v-html="formatPayload(item)"></div>
        </div>
        <div class="right">
          <div class="time">{{ formatTime(item.createdAt) }}</div>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      暂无消息
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'
import type { Notification } from '@/api/modules/notification'

const items = ref<Notification[]>([])

const load = async () => {
  try {
    const res = await api.notification.getNotifications(0, 50)
    const body = (res as any) && (res as any).data ? (res as any).data : null
    // backend may return various shapes; normalize to an array of items
    let arr = []
    if (!body) arr = []
    else if (Array.isArray(body.data)) arr = body.data
    else if (body.data && Array.isArray(body.data.data)) arr = body.data.data
    else if (body.data && Array.isArray(body.data.content)) arr = body.data.content
    else if (Array.isArray((body as any).content)) arr = (body as any).content
    else arr = []

    // parse payload JSON string if necessary
    items.value = arr.map((it: any) => {
      try {
        if (it.payload && typeof it.payload === 'string') {
          it.__payload = JSON.parse(it.payload)
        } else {
          it.__payload = it.payload || {}
        }
      } catch (e) {
        it.__payload = {}
      }
      return it
    })
  } catch (e) {
    console.warn('load notifications failed', e)
    items.value = []
  }
}

const formatPayload = (it: Notification) => {
  const p = (it as any).__payload || {}
  // friendly for order notifications
  if (p.orderId || p.amount) {
    const orderId = p.orderId ?? p.orderid ?? ''
    const amount = p.amount ?? p.total ?? ''
    return `订单 <strong>#${orderId}</strong> 已支付，金额 ¥${amount}`
  }
  // fallback: stringify small object
  try {
    const s = typeof p === 'string' ? p : JSON.stringify(p)
    return s.length > 200 ? s.slice(0, 200) + '...' : s
  } catch (e) {
    return ''
  }
}

const formatTime = (ts: any) => {
  try {
    const d = ts ? new Date(ts) : new Date()
    return d.toLocaleString()
  } catch (e) {
    return ts as string
  }
}

const open = async (it: Notification) => {
  if (!it) return
  // mark read via bulk API
  try {
    await api.notification.markRead([it.id])
    it.readFlag = true
    // notify nav to refresh badge (delta -1)
    try { window.dispatchEvent(new CustomEvent('notificationChanged', { detail: { delta: -1 } })) } catch (e) {}
  } catch (e) {
    console.warn('mark read failed', e)
  }
  // if payload contains orderId, navigate to order detail
  const p = (it as any).__payload || {}
  const orderId = p.orderId ?? p.orderid ?? null
  if (orderId) {
    try {
      const router = (await import('@/router')).default
      // if payload contains merchant/store info, go to merchant order view
      const merchantId = p.merchantId ?? p.merchantid ?? null
      if (merchantId) {
        router.push(`/merchant/orders/${orderId}`).catch(()=>{})
      } else {
        router.push(`/order/${orderId}`).catch(()=>{})
      }
    } catch (e) {}
  }
}

const markAllRead = async () => {
  try {
    // compute how many were unread
    const unreadBefore = items.value.filter(i => !i.readFlag).length
    await api.notification.markAllRead()
    // optimistic UI
    items.value = items.value.map(i => ({ ...i, readFlag: true }))
    // notify nav (delta negative of unreadBefore)
    try { window.dispatchEvent(new CustomEvent('notificationChanged', { detail: { delta: -unreadBefore } })) } catch (e) {}
  } catch (e) {
    console.warn('mark all read failed', e)
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.notifications-page {
  padding: 24px;
}
.actions {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}
.notif-list {
  display: block;
}
.notif-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #eee;
}
.notif-item.unread {
  background: #fff9f5;
}
.type {
  font-weight: 600;
  margin-bottom: 6px;
}
.payload {
  color: #666;
}
.time {
  color: #999;
  font-size: 12px;
}
.empty {
  color: #999;
  padding: 40px;
  text-align: center;
}
</style>


