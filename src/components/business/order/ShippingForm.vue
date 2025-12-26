<template>
  <div class="shipping-form">
    <div class="form-group">
      <label>快递公司：</label>
      <input
        v-model="carrier"
        :placeholder="placeholder.carrier"
        class="form-control"
      />
    </div>
    <div class="form-group">
      <label>运单号：</label>
      <input
        v-model="trackingNo"
        :placeholder="placeholder.trackingNo"
        class="form-control"
      />
    </div>
    <div class="form-actions">
      <button
        @click="shipOffline"
        class="btn btn-outline-success btn-sm offline-btn"
        :disabled="loading"
      >
        线下交货
      </button>
      <button
        @click="$emit('ship', { carrier, trackingNo })"
        class="btn btn-primary"
        :disabled="loading || !carrier || !trackingNo"
      >
        {{ loading ? '发货中...' : '确认发货' }}
      </button>
      <button
        v-if="showCancel"
        @click="$emit('cancel')"
        class="btn btn-secondary"
        :disabled="loading"
      >
        取消
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义属性
interface Props {
  showCancel?: boolean
  loading?: boolean
  placeholder?: {
    carrier: string
    trackingNo: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  showCancel: true,
  loading: false,
  placeholder: () => ({
    carrier: '例如：顺丰',
    trackingNo: '运单号'
  })
})

// 定义事件
const emit = defineEmits<{
  ship: [data: { carrier: string; trackingNo: string }]
  cancel: []
}>()

// 表单数据
const carrier = ref('')
const trackingNo = ref('')

// 线下交货方法
const shipOffline = () => {
  if (!confirm('确认线下交货吗？线下交货表示您将直接与买家进行面对面交易。')) {
    return
  }

  // 自动填写线下交货信息并触发发货
  emit('ship', {
    carrier: 'offline',
    trackingNo: '000000'
  })
}

// 重置表单
const reset = () => {
  carrier.value = ''
  trackingNo.value = ''
}

// 暴露重置方法给父组件使用
defineExpose({
  reset
})
</script>

<style scoped>
.shipping-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 16px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-outline-success {
  background-color: transparent;
  border-color: #28a745;
  color: #28a745;
}

.btn-outline-success:hover:not(:disabled) {
  background-color: #28a745;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
  border-color: #545b62;
}

.offline-btn {
  flex-shrink: 0;
}
</style>
