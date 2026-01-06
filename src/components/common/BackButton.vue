<template>
  <el-button 
    :type="type" 
    :size="size"
    :plain="plain"
    :circle="circle"
    :icon="ArrowLeft"
    @click="handleBack"
    class="back-button"
  >
    <span v-if="!circle">{{ text }}</span>
  </el-button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

interface Props {
  text?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'large' | 'default' | 'small'
  plain?: boolean
  circle?: boolean
  fallbackPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '返回',
  type: 'default',
  size: 'default',
  plain: false,
  circle: false,
  fallbackPath: '/'
})

const router = useRouter()

const handleBack = () => {
  // 如果有历史记录，返回上一页
  if (window.history.length > 1) {
    router.back()
  } else {
    // 否则跳转到指定的fallback路径
    router.push(props.fallbackPath)
  }
}
</script>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
