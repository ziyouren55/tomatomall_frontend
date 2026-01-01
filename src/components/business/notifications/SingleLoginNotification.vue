<!-- 此组件现在主要用于注册表，但实际显示由ElMessageBox处理 -->

<script setup lang="ts">
// 此组件保留用于通知注册表兼容性
// 实际的单点登录处理已移至notificationService.ts

const props = defineProps<{
  message: string
  timestamp: number
}>()
</script>

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
