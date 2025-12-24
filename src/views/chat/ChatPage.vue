<template>
  <div class="chat-page">
    <div class="chat-container">
      <!-- 会话列表 -->
      <div class="chat-sidebar">
        <ChatSessionList
          :current-session-id="currentSession?.id"
          @select-session="onSelectSession"
          ref="sessionListRef"
        />
      </div>

      <!-- 聊天对话界面 -->
      <div class="chat-main">
        <ChatDialog
          :session="currentSession"
          @session-archived="onSessionArchived"
          @session-read="onSessionRead"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { ChatSessionVO } from '@/api/modules/chat'
import chatApi from '@/api/modules/chat'
import ChatSessionList from '@/components/chat/ChatSessionList.vue'
import ChatDialog from '@/components/chat/ChatDialog.vue'
import { initChatService, stopChatService } from '@/services/chatService'
import store from '@/store'

const route = useRoute()
// 使用store
const currentSession = ref<ChatSessionVO | null>(null)
const sessionListRef = ref()

// 检查用户是否已登录
function checkAuth() {
  const isLoggedIn = !!store.state.user.token
  if (!isLoggedIn) {
    ElMessage.error('请先登录')
    // 这里可以添加跳转到登录页的逻辑
    return false
  }
  return true
}

// 选择会话
function onSelectSession(session: ChatSessionVO) {
  currentSession.value = session
}

// 会话被删除
function onSessionArchived() {
  currentSession.value = null
  // 刷新会话列表
  if (sessionListRef.value) {
    sessionListRef.value.refresh()
  }
}

// 会话被标记为已读
function onSessionRead() {
  // 刷新会话列表以更新红点显示
  if (sessionListRef.value) {
    sessionListRef.value.refresh()
  }
}

// 从路由参数加载会话
async function loadSessionFromRoute() {
  const sessionId = route.query.sessionId as string
  const isLoggedIn = !!store.state.user.token
  if (sessionId && isLoggedIn) {
    try {
      const response = await chatApi.getChatSession(parseInt(sessionId))
      if (response && response.code === '200' && response.data) {
        currentSession.value = response.data
      }
    } catch (error) {
      console.error('加载会话失败:', error)
    }
  }
}

// 监听路由参数变化
watch(() => route.query.sessionId, () => {
  loadSessionFromRoute()
})

onMounted(async () => {
  if (!checkAuth()) return

  // 初始化聊天WebSocket服务
  try {
    const backendBase = (import.meta.env.VITE_BACKEND_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') as string
    await initChatService(backendBase)
    // 从路由参数加载会话
    await loadSessionFromRoute()
  } catch (error) {
    console.error('初始化聊天服务失败:', error)
    ElMessage.error('聊天服务初始化失败')
  }
})

onUnmounted(() => {
  // 停止聊天WebSocket服务
  stopChatService()
})
</script>

<style scoped>
.chat-page {
  height: calc(100vh - 80px); /* 减去顶部导航栏的高度 */
  background: #f8f9fa;
}

.chat-container {
  height: 100%;
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin: 16px;
}

.chat-sidebar {
  width: 320px;
  border-right: 1px solid #e5e5e5;
}

.chat-main {
  flex: 1;
  min-width: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    margin: 8px;
  }

  .chat-sidebar {
    width: 280px;
  }
}

@media (max-width: 480px) {
  .chat-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e5e5;
  }

  .chat-container {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 88px);
  }

  .chat-sidebar {
    height: 200px;
  }

  .chat-main {
    height: calc(100vh - 288px);
  }
}
</style>
