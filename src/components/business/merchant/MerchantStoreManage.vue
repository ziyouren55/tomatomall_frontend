<template>
  <div class="merchant-store-list">
    <StoreListCore :stores="stores" :loading="loading" :error="error" @delete="onDelete">
      <template #name="{ item }">
        <div class="name-cell">
          <router-link :to="`/merchant/stores/${item.id}`" class="store-name">{{ item.name }}</router-link>
          <div class="store-meta">ID: {{ item.id }} · 商家ID: {{ item.merchantId || '-' }}</div>
        </div>
      </template>
      <template #actions="{ item }">
        <router-link :to="`/merchant/stores/${item.id}/edit`" class="action-link">编辑</router-link>
        <router-link :to="`/merchant/stores/${item.id}/warehouse`" class="action-link">仓库</router-link>
        <button @click="onDelete(item.id)" class="action-delete">删除</button>
      </template>
    </StoreListCore>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import storeApi from '@/api/modules/store'
import type { Store } from '@/api/modules/store'
import { ElMessage } from 'element-plus'
import StoreListCore from '@/components/business/store/StoreListCore.vue'

const stores = ref<Store[]>([])
const loading = ref(false)
const error = ref('')

const fetchStores = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await storeApi.getMerchantStores(0, 50)
    // 支持后端分页包装：res.data.data 或者直接返回数组/内容字段
    const payload = res?.data?.data ?? res?.data?.content ?? res?.data
    if (Array.isArray(payload)) {
      stores.value = payload
    } else if (Array.isArray(payload?.content)) {
      stores.value = payload.content
    } else {
      stores.value = []
    }
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

const onDelete = async (id?: number) => {
  if (!id) return
  if (!confirm('确认删除？')) return
  try {
    await storeApi.deleteStore(id)
    ElMessage({ type: 'success', message: '删除成功' })
    stores.value = stores.value.filter(s => s.id !== id)
  } catch (e: any) {
    ElMessage({ type: 'error', message: e?.message || String(e) })
  }
}

onMounted(() => {
  fetchStores()
  // WebSocket / STOMP subscribe for merchant notifications
  try {
    const socket = new SockJS((import.meta.env.VITE_API_BASE_URL || '') + '/ws')
    const client = Stomp.over(socket)
    client.debug = (msg: any) => console.log('[STOMP DEBUG]', msg)
    client.connect({}, () => {
      console.log('[WS] stomp connected')
      client.subscribe('/topic/merchant/notifications', (message: any) => {
        console.log('[WS] message on /topic/merchant/notifications', message)
        try {
          const body = JSON.parse(message.body)
          console.log('[WS] parsed payload', body)
          // 简单提示并可扩展为添加到通知中心
          // @ts-ignore
          ElMessage({ type: 'info', message: '收到新订单通知：' + (body.orderId || '') })
        } catch (e) {
          console.warn('[WS] parse failed', e)
        }
      }, (err: any) => {
        console.error('[WS] subscribe error', err)
      })
    }, (err: any) => {
      console.error('[WS] stomp connect error', err)
    })
    socket.onclose = () => console.warn('[WS] socket closed')
    // 保存到变量以便卸载时断开
    // @ts-ignore
    window.__merchantStompClient = client
  } catch (e) {
    console.warn('ws init failed', e)
  }
})

onUnmounted(() => {
  try {
    // @ts-ignore
    const client = window.__merchantStompClient
    if (client) client.disconnect()
  } catch (e) {}
})
</script>

<style scoped>
.store-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
}
.store-table thead {
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: #fff;
  border-radius: 8px 8px 0 0;
}
.store-table th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.4px;
}
.store-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.18s ease;
  position: relative;
}
.store-table tbody tr:hover {
  background-color: #fbfbfb;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  transform: translateY(-2px);
}
.store-table td {
  padding: 14px 16px;
  color: #333;
  overflow: hidden;
  word-wrap: break-word;
}
.actions-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}
.action-link {
  color: #ff6b35;
  text-decoration: none;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(255,107,53,0.06);
}
.action-link:hover { background: rgba(255,107,53,0.12); }
.action-delete {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}
.action-delete:hover { opacity: 0.95; }
.store-row { transition: background 0.15s ease, transform 0.12s ease; }
.col-id { width: 90px; font-weight: 700; color: #666; }
.col-name .name-cell { display: flex; flex-direction: column; }
.store-name { font-weight:700; color:#333; text-decoration:none; font-size:1rem; }
.store-meta { font-size:12px; color:#999; margin-top:6px; }
.col-desc { color:#666; max-width:420px; }
.status-badge { display:inline-block; padding:6px 12px; border-radius:999px; font-weight:700; font-size:12px; }
.status-badge.ACTIVE { background:#e8f5e9; color:#2e7d32; }
.status-badge.INACTIVE { background:#fff3e0; color:#e65100; }
</style>

