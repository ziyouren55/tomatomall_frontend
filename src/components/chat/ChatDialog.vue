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
              <span class="ws-status" :class="{ connected: chatState.connected }">
                WS: {{ chatState.connected ? '已连接' : '未连接' }}
              </span>
            </div>
          </div>
        </div>
        <div class="chat-actions">
          <!-- 商家专用：发放优惠券按钮 -->
          <el-button
            v-if="isMerchant"
            type="success"
            @click="showCouponDialog = true"
            size="small"
            :disabled="!currentSession"
          >
            <el-icon><Present /></el-icon>
            发优惠券
          </el-button>

          <el-button type="default" @click="testConnection" size="small">
            调试WS
          </el-button>
          <el-button type="default" @click="archiveSession" size="small">
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

    <!-- 优惠券发放弹窗 -->
    <ChatCouponDialog
      v-model:visible="showCouponDialog"
      :session="currentSession"
      @coupon-issued="onCouponIssued"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Present } from '@element-plus/icons-vue'
import type { ChatSessionVO, ChatMessageVO } from '@/api/modules/chat'
import chatApi from '@/api/modules/chat'
import store from '@/store'
import { addMessageListener, removeMessageListener, sendChatMessage, chatState, testWebSocketConnection } from '@/services/chatService'
import ChatCouponDialog from './ChatCouponDialog.vue'
import { UserRole } from '@/utils/constants'

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

// 优惠券弹窗相关
const showCouponDialog = ref(false)

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

// 当前用户信息（响应式）
const currentUserInfo = computed(() => store.state.user.userInfo)

const partnerAvatar = computed(() => {
  if (!currentSession.value) return defaultAvatar
  const currentUser = currentUserInfo.value
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

// 判断当前用户是否为商家
const isMerchant = computed(() => {
  const currentUser = currentUserInfo.value
  return currentUser?.role === UserRole.MERCHANT
})

// 判断是否是自己的消息
function isOwnMessage(message: ChatMessageVO): boolean {
  const currentUser = currentUserInfo.value
  const isOwn = currentUser?.id !== undefined && message.senderId === currentUser.id

  return isOwn
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
      // 确保滚动到底部，添加一个小延迟以防图片等内容还没加载完成
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      }, 100)
    }
  })
}

// 加载消息
async function loadMessages() {
  if (!currentSession.value) return

  loadingMessages.value = true
  try {
    // 并行执行两个请求：获取消息和标记已读
    const [messagesResponse, markReadResponse] = await Promise.all([
      chatApi.getSessionMessages(currentSession.value.id),
      chatApi.markSessionAsRead(currentSession.value.id)
    ])

    // 处理消息加载
    if (messagesResponse && messagesResponse.code === '200' && messagesResponse.data) {
      // 反转消息顺序，因为API返回的是倒序的
      messages.value = messagesResponse.data.data.reverse()
      scrollToBottom()
    }

    // 处理标记已读
    if (markReadResponse && markReadResponse.code === '200') {
      // 标记已读成功，触发父组件刷新会话列表以更新红点
      emit('session-read')
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
      // 发送成功后，立即在本地添加消息到列表（发送方能立即看到自己的消息）
      const currentUser = store.state.user.userInfo
      const tempMessage: ChatMessageVO = {
        id: Date.now(), // 临时ID，后端消息会替换这个
        sessionId: currentSession.value.id,
        senderId: currentUser?.id || 0,
        senderRole: '', // 暂时为空，后端消息会包含正确的值
        senderName: currentUser?.name || '',
        senderAvatar: currentUser?.avatar || '',
        content: content,
        messageType: 'TEXT',
        status: 'SENT',
        createdAt: new Date().toISOString()
      }

      messages.value.push(tempMessage)
      newMessage.value = ''
      scrollToBottom()

      // 真正的后端消息会通过WebSocket推送来更新这条临时消息
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

// 测试WebSocket连接
function testConnection() {
  const status = testWebSocketConnection()

  if (import.meta.env.DEV) {
    console.log('[CHAT WS] Connection status:', status)
  }

  ElMessage.info(`WS状态: ${status.chatStateConnected ? '已连接' : '未连接'}, 监听器: ${status.listenersCount}`)
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
    // 检查是否是重复消息（发送方收到后端推送的真实消息）
    // 查找最近5秒内发送的相同内容的消息
    const existingIndex = messages.value.findIndex(m =>
      m.sessionId === message.sessionId &&
      m.senderId === message.senderId &&
      m.content === message.content &&
      Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000 // 5秒内
    )

    if (existingIndex >= 0) {
      // 替换临时消息为真实消息
      messages.value[existingIndex] = message
    } else {
      // 添加新消息
      messages.value.push(message)

      // 限制显示的消息数量，避免性能问题
      const MAX_DISPLAY_MESSAGES = 100
      if (messages.value.length > MAX_DISPLAY_MESSAGES) {
        messages.value = messages.value.slice(-MAX_DISPLAY_MESSAGES)
      }
    }
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

// 监听消息变化，确保每次有新消息时都滚动到底部
watch(() => messages.value, (newMessages) => {
  if (newMessages && newMessages.length > 0) {
    // 使用nextTick确保DOM更新后再滚动
    nextTick(() => {
      scrollToBottom()
    })
  }
}, { deep: true })

// 监听用户信息变化，确保用户状态加载完成后重新计算消息显示
watch(() => currentUserInfo.value, (newUser, oldUser) => {
  if (import.meta.env.DEV) {
    console.log('User info changed:', { oldUser: oldUser?.id, newUser: newUser?.id })
  }
  // 用户信息变化时会自动重新计算computed属性和重新渲染
}, { immediate: true })

onMounted(() => {
  addMessageListener(onNewMessage)
})

onUnmounted(() => {
  removeMessageListener(onNewMessage)
})

const emit = defineEmits<{
  'session-archived': []
  'session-read': []
}>()

// 优惠券发放成功回调
function onCouponIssued() {
  // 可以在这里添加一些提示或者刷新消息列表等操作
  ElMessage.success('优惠券已发放给对方！')
}
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
  min-height: 0; /* 确保flex子项能够缩小 */
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
  gap: 8px;
}

.ws-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #f56c6c;
  color: white;
}

.ws-status.connected {
  background: #67c23a;
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
  height: 0; /* 关键：让flex子项占据剩余空间 */
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  background: #f8f9fa;
  min-height: 200px;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #ccc transparent; /* Firefox */
}

/* Webkit browsers (Chrome, Safari, Edge) */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #999;
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
  padding-bottom: 16px; /* 确保最后一条消息不会被遮挡 */
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
