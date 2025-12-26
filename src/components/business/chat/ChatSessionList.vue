<template>
  <div class="chat-session-list">
    <div class="session-header">
      <h3>聊天会话</h3>
      <span v-if="totalUnread > 0" class="unread-badge">{{ totalUnread }}</span>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="sessions.length === 0" class="empty">
      暂无聊天会话
    </div>

    <div v-else class="session-items">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === currentSessionId }"
        @click="selectSession(session)"
      >
        <div class="session-avatar">
          <img
            :src="getSessionAvatar(session)"
            :alt="getSessionName(session)"
            class="avatar-img"
          />
        </div>

        <div class="session-info">
          <div class="session-name">{{ getSessionName(session) }}</div>
          <div class="last-message">{{ session.lastMessage || '暂无消息' }}</div>
          <div class="session-time">{{ formatTime(session.lastMessageTime) }}</div>
        </div>

        <div v-if="getUnreadCount(session) > 0" class="unread-count">
          {{ getUnreadCount(session) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { ChatSessionVO } from '@/types/api'
import chatApi from '@/api/modules/chat.ts'
import store from '@/store'
import { chatState, updateUnreadCount } from '@/services/chatService.ts'

interface Props {
  currentSessionId?: number
}

interface Emits {
  (e: 'select-session', session: ChatSessionVO): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用store
const sessions = ref<ChatSessionVO[]>([])
const loading = ref(false)

const totalUnread = computed(() => {
  return sessions.value.reduce((total, session) => {
    return total + getUnreadCount(session)
  }, 0)
})

// 监听全局聊天状态变化，同步更新本地会话列表
watch(() => chatState.sessions, (newSessions) => {
  if (newSessions && newSessions.length > 0) {
    // 同步全局状态到本地组件状态
    sessions.value = [...newSessions]
  }
}, { deep: true, immediate: true })

const defaultAvatar = 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2'

function getSessionAvatar(session: ChatSessionVO): string {
  // 根据当前用户角色显示对方头像
  const currentUser = store.state.user.userInfo
  if (currentUser?.id === session.customerId) {
    // 当前用户是顾客，显示商家头像
    return session.merchantAvatar || defaultAvatar
  } else {
    // 当前用户是商家，显示顾客头像
    return session.customerAvatar || defaultAvatar
  }
}

function getSessionName(session: ChatSessionVO): string {
  // 根据当前用户角色显示对方名称
  const currentUser = store.state.user.userInfo
  if (currentUser?.id === session.customerId) {
    // 当前用户是顾客，显示商家名称
    return session.merchantName || '商家'
  } else {
    // 当前用户是商家，显示顾客名称
    return session.customerName || '顾客'
  }
}

function getUnreadCount(session: ChatSessionVO): number {
  // 根据当前用户角色返回对应的未读消息数
  const currentUser = store.state.user.userInfo
  if (currentUser?.id === session.customerId) {
    return session.unreadCountCustomer || 0
  } else {
    return session.unreadCountMerchant || 0
  }
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return ''

  const time = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - time.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return time.toLocaleDateString()
}

async function loadSessions() {
  loading.value = true
  try {
    const response = await chatApi.getChatSessions()
    if (response && response.code === '200') {
      sessions.value = response.data || []
      // 同步更新全局聊天状态
      chatState.sessions = sessions.value
      updateUnreadCount()
    }
  } catch (error) {
    console.error('加载聊天会话失败:', error)
    // 如果API调用失败，但全局状态已有数据，使用全局状态
    if (chatState.sessions.length > 0) {
      sessions.value = [...chatState.sessions]
    }
  } finally {
    loading.value = false
  }
}

function selectSession(session: ChatSessionVO) {
  emit('select-session', session)
}

onMounted(() => {
  loadSessions()
})

// 暴露刷新方法给父组件
defineExpose({
  refresh: loadSessions
})
</script>

<style scoped>
.chat-session-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e5e5;
}

.session-header {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.unread-badge {
  background: #f56c6c;
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
}

.loading, .empty {
  padding: 40px 16px;
  text-align: center;
  color: #999;
}

.session-items {
  flex: 1;
  overflow-y: auto;
}

.session-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.session-item:hover {
  background-color: #f8f9fa;
}

.session-item.active {
  background-color: #e6f7ff;
}

.session-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.session-time {
  font-size: 11px;
  color: #999;
}

.unread-count {
  background: #f56c6c;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 500;
  min-width: 18px;
  text-align: center;
}
</style>
