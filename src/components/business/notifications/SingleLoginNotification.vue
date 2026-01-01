<!-- 单点登录通知组件 -->
<!-- 当单点登录发生时，通过通知系统显示此组件 -->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authService } from '@/services/authService'

const props = defineProps<{
  message: string
  timestamp: number
}>()

const isVisible = ref(true)
const timeString = ref('')

// 格式化时间显示
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleString('zh-CN')
  }
}

// 重新登录
const handleRelogin = async () => {
  try {
    isVisible.value = false
    await authService.forceLogout(props.message)
  } catch (error) {
    console.error('Relogin failed:', error)
  }
}

onMounted(() => {
  timeString.value = formatTime(props.timestamp)
})
</script>

<template>
  <div v-if="isVisible" class="single-login-modal-overlay" @click.self="handleRelogin">
    <div class="single-login-modal">
      <!-- 头部 -->
      <div class="modal-header">
        <div class="warning-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3>账号安全提醒</h3>
      </div>

      <!-- 主体内容 -->
      <div class="modal-body">
        <div class="main-message">
          {{ message || '您的账号在其他设备上登录，您已被迫下线' }}
        </div>
        <div class="sub-message">
          为确保账号安全，请重新登录以继续使用
        </div>
        <div class="time-info">
          <span class="time-label">登录时间：</span>
          {{ timeString }}
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="modal-footer">
        <button class="relogin-btn" @click="handleRelogin">
          立即重新登录
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.single-login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.single-login-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  color: white;
  padding: 24px;
  text-align: center;
}

.warning-icon {
  margin: 0 auto 12px;
  width: 48px;
  height: 48px;
  color: white;
}

.warning-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 2;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.main-message {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.sub-message {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
}

.time-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
  margin-top: 16px;
}

.time-label {
  font-weight: 500;
}

.modal-footer {
  padding: 16px 24px 24px;
  text-align: center;
}

.relogin-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.relogin-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.relogin-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .single-login-modal {
    margin: 20px;
    width: calc(100% - 40px);
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 12px 20px 20px;
  }
}
</style>
