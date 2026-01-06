<template>
  <div class="verification-page">
    <div class="page-header">
      <button class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回个人中心
      </button>
      <h1>🎓 学生认证</h1>
      <p class="subtitle">完成认证后可享受学生专属优惠</p>
    </div>

    <div class="verification-content">
      <SchoolVerificationForm 
        @submitted="handleSubmitted" 
        @cancel="goBack" 
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import SchoolVerificationForm from '@/components/business/user/SchoolVerificationForm.vue'

const router = useRouter()

function goBack() {
  router.push('/user/private')
}

function handleSubmitted() {
  // 认证提交成功后，延迟跳转回个人中心
  setTimeout(() => {
    router.push('/user/private')
  }, 2000)
}
</script>

<style scoped>
.verification-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-4px);
}

.page-header h1 {
  font-size: 36px;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.verification-content {
  max-width: 900px;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .verification-page {
    padding: 20px 10px;
  }

  .page-header h1 {
    font-size: 28px;
    margin-top: 50px;
  }

  .back-button {
    position: static;
    margin-bottom: 20px;
    width: fit-content;
  }
}
</style>
