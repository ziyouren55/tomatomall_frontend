<template>
  <div class="store-list-core">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>
    <table v-else class="store-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名称</th>
          <th>描述</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in stores" :key="s.id" class="store-row">
          <td class="col-id">{{ s.id }}</td>
          <td class="col-name">
            <slot name="name" :item="s">{{ s.name }}</slot>
          </td>
          <td class="col-desc">{{ s.description || '-' }}</td>
          <td class="col-status"><span class="status-badge" :class="s.status">{{ s.status }}</span></td>
          <td class="actions-cell">
            <slot name="actions" :item="s">
              <button @click="$emit('delete', s.id)" class="action-delete">删除</button>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Store } from '@/types/api'

const props = defineProps({
  stores: { type: Array as PropType<Store[]>, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const emits = defineEmits(['delete'])
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
.col-id { width: 90px; font-weight:700; color:#666; }
.col-name .name-cell { display:flex; flex-direction:column; }
.store-name { font-weight:700; color:#333; text-decoration:none; font-size:1rem; }
.store-meta { font-size:12px; color:#999; margin-top:6px; }
.col-desc { color:#666; max-width:420px; }
.status-badge { display:inline-block; padding:6px 12px; border-radius:999px; font-weight:700; font-size:12px; }
.status-badge.ACTIVE { background:#e8f5e9; color:#2e7d32; }
.status-badge.INACTIVE { background:#fff3e0; color:#e65100; }
</style>


