<template>
  <div class="chat-dialog">
    <div v-if="!currentSession" class="no-session">
      <div class="no-session-content">
        <div class="icon">💬</div>
        <h3>选择一个会话开始聊天</h3>
        <p>从左侧列表中选择一个聊天会话</p>
      </div>
    </div>

    <div v-else class="chat-content">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-partner">
          <img
            :src="partnerAvatar"
            :alt="partnerName"
            class="partner-avatar"
          />
          <div class="partner-info">
            <div class="partner-name">{{ partnerName }}</div>
            <div class="partner-status">
              <span :class="['status-dot', { online: isOnline }]"></span>
              {{ isOnline ? '在线' : '离线' }}
            </div>
          </div>
        </div>
        <div class="chat-actions">
          <el-button type="text" @click="archiveSession" size="small">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="loadingMessages" class="loading-messages">
          加载消息中...
        </div>

        <div v-else-if="messages.length === 0" class="no-messages">
          暂无消息，开始聊天吧！
        </div>

        <div v-else class="messages-list">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-item"
            :class="{ 'own-message': isOwnMessage(message) }"
          >
            <div class="message-avatar" v-if="!isOwnMessage(message)">
              <img
                :src="message.senderAvatar || defaultAvatar"
                :alt="message.senderName"
              />
            </div>

            <div class="message-content">
              <div v-if="!isOwnMessage(message)" class="message-sender">
                {{ message.senderName }}
              </div>
              <div class="message-bubble" :class="{ 'own-bubble': isOwnMessage(message) }">
                {{ message.content }}
              </div>
              <div class="message-time">
                {{ formatMessageTime(message.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息输入框 -->
      <div class="message-input">
        <div class="input-container">
          <el-input
            v-model="newMessage"
            placeholder="输入消息..."
            :disabled="!currentSession"
            @keyup.enter="sendMessage"
            ref="messageInputRef"
          >
            <template #suffix>
              <el-button
                type="primary"
                :disabled="!canSend"
                @click="sendMessage"
                :loading="sending"
              >
                发送
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import type { ChatSessionVO, ChatMessageVO } from '@/api/modules/chat'
import chatApi from '@/api/modules/chat'
import store from '@/store'
import { addMessageListener, removeMessageListener, sendChatMessage } from '@/services/chatService'

interface Props {
  session: ChatSessionVO | null
}

const props = defineProps<Props>()

// 使用store
const messages = ref<ChatMessageVO[]>([])
const loadingMessages = ref(false)
const newMessage = ref('')
const sending = ref(false)
const messagesContainer = ref<HTMLElement>()
const messageInputRef = ref()

const defaultAvatar = 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2'

const currentSession = computed(() => props.session)

const partnerName = computed(() => {
  if (!currentSession.value) return ''
  const currentUser = store.state.user.userInfo
  // 根据当前用户角色显示对方名称
  if (currentUser?.id === currentSession.value.customerId) {
    return currentSession.value.merchantName || '商家'
  } else {
    return currentSession.value.customerName || '顾客'
  }
})

const partnerAvatar = computed(() => {
  if (!currentSession.value) return defaultAvatar
  const currentUser = store.state.user.userInfo
  // 根据当前用户角色显示对方头像
  if (currentUser?.id === currentSession.value.customerId) {
    return currentSession.value.merchantAvatar || defaultAvatar
  } else {
    return currentSession.value.customerAvatar || defaultAvatar
  }
})

const isOnline = computed(() => {
  // 简单实现，实际可以根据用户的在线状态
  return true
})

const canSend = computed(() => {
  return newMessage.value.trim().length > 0 && !sending.value
})

// 判断是否是自己的消息
function isOwnMessage(message: ChatMessageVO): boolean {
  const currentUser = store.state.user.userInfo
  return message.senderId === currentUser?.id
}

// 格式化消息时间
function formatMessageTime(timeStr: string): string {
  const time = new Date(timeStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(time.getFullYear(), time.getMonth(), time.getDate())

  if (messageDate.getTime() === today.getTime()) {
    // 今天的消息
    return time.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (messageDate.getTime() === today.getTime() - 86400000) {
    // 昨天的消息
    return '昨天 ' + time.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else {
    // 其他日期
    return time.toLocaleDateString('zh-CN') + ' ' + time.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 加载消息
async function loadMessages() {
  if (!currentSession.value) return

  loadingMessages.value = true
  try {
    const response = await chatApi.getSessionMessages(currentSession.value.id)
    if (response && response.code === '200' && response.data) {
      // 反转消息顺序，因为API返回的是倒序的
      messages.value = response.data.data.reverse()
      scrollToBottom()
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    ElMessage.error('加载消息失败')
  } finally {
    loadingMessages.value = false
  }
}

// 发送消息
async function sendMessage() {
  if (!canSend.value || !currentSession.value) return

  const content = newMessage.value.trim()
  if (!content) return

  sending.value = true

  try {
    // 通过WebSocket发送消息（senderRole由后端根据用户身份确定）
    const messageSent = sendChatMessage({
      sessionId: currentSession.value.id,
      content,
      messageType: 'TEXT'
    })

    if (messageSent) {
      newMessage.value = ''
      // 消息会通过WebSocket监听器自动添加到列表中
    } else {
      throw new Error('发送失败')
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  } finally {
    sending.value = false
  }
}

// 归档会话
async function archiveSession() {
  if (!currentSession.value) return

  try {
    await ElMessageBox.confirm('确定要删除这个聊天会话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await chatApi.archiveSession(currentSession.value.id)
    if (response && response.code === '200') {
      ElMessage.success('会话已删除')
      // 触发父组件刷新会话列表
      emit('session-archived')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除会话失败:', error)
      ElMessage.error('删除会话失败')
    }
  }
}

// 监听新消息
function onNewMessage(message: ChatMessageVO) {
  if (message.sessionId === currentSession.value?.id) {
    messages.value.push(message)
    scrollToBottom()
  }
}

// 监听会话变化
watch(() => props.session, (newSession) => {
  if (newSession) {
    loadMessages()
  } else {
    messages.value = []
  }
}, { immediate: true })

onMounted(() => {
  addMessageListener(onNewMessage)
})

onUnmounted(() => {
  removeMessageListener(onNewMessage)
})

defineEmits<{
  'session-archived': []
}>()
</script>

<style scoped>
.chat-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.no-session {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.no-session-content {
  text-align: center;
  color: #999;
}

.no-session-content .icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.chat-partner {
  display: flex;
  align-items: center;
}

.partner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.partner-info {
  display: flex;
  flex-direction: column;
}

.partner-name {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 2px;
}

.partner-status {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  margin-right: 6px;
}

.status-dot.online {
  background: #67c23a;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

.loading-messages, .no-messages {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  margin-bottom: 12px;
}

.message-item.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 8px;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.own-message .message-avatar {
  margin-right: 0;
  margin-left: 8px;
}

.message-content {
  max-width: 60%;
  display: flex;
  flex-direction: column;
}

.message-sender {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 18px;
  background: white;
  border: 1px solid #e5e5e5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.own-bubble {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  align-self: flex-start;
}

.own-message .message-time {
  align-self: flex-end;
}

.message-input {
  padding: 16px;
  background: white;
  border-top: 1px solid #e5e5e5;
}

.input-container {
  display: flex;
  gap: 12px;
}

.input-container :deep(.el-input) {
  flex: 1;
}

.input-container :deep(.el-input__suffix) {
  right: 12px;
}
</style>
