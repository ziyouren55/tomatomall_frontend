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
            class="partner-avatar clickable-avatar"
            @click="navigateToPartnerProfile"
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
                class="clickable-avatar"
                @click="navigateToUserProfile(message.senderId)"
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
        <div class="input-toolbar">
          <el-button
            class="emoji-btn"
            @click="toggleEmojiPicker"
            :disabled="!currentSession"
            text
          >
            😊
          </el-button>
        </div>
        <div class="input-container">
          <el-input
            v-model="newMessage"
            placeholder="输入消息..."
            :disabled="!currentSession"
            @keyup.enter="sendMessage"
            ref="messageInputRef"
            type="textarea"
            :rows="2"
            resize="none"
          />
          <el-button
            class="send-btn"
            type="primary"
            :disabled="!canSend"
            @click="sendMessage"
            :loading="sending"
          >
            发送
          </el-button>
        </div>
        
        <!-- Emoji选择器 -->
        <div v-if="showEmojiPicker" class="emoji-picker" @click.stop>
          <div class="emoji-header">
            <span>选择表情</span>
            <el-button text @click="showEmojiPicker = false" class="close-emoji">✕</el-button>
          </div>
          <div class="emoji-categories">
            <el-button
              v-for="category in emojiCategories"
              :key="category.name"
              :class="{ active: currentEmojiCategory === category.name }"
              @click="currentEmojiCategory = category.name"
              text
              size="small"
            >
              {{ category.icon }}
            </el-button>
          </div>
          <div class="emoji-list">
            <span
              v-for="emoji in currentEmojis"
              :key="emoji"
              class="emoji-item"
              @click="insertEmoji(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Present } from '@element-plus/icons-vue'
import type { ChatSessionVO, ChatMessageVO } from '@/types/api'
import chatApi from '@/api/modules/chat.ts'
import api from '@/api'
import store from '@/store'
import { addMessageListener, removeMessageListener, sendChatMessage, chatState, testWebSocketConnection } from '@/services/chatService.ts'
import ChatCouponDialog from './ChatCouponDialog.vue'
import { UserRole } from '@/utils/constants.ts'

interface Props {
  session: ChatSessionVO | null
}

const props = defineProps<Props>()

const router = useRouter()

// 使用store
const messages = ref<ChatMessageVO[]>([])
const loadingMessages = ref(false)
const newMessage = ref('')
const sending = ref(false)
const messagesContainer = ref<HTMLElement>()

// Emoji相关状态
const showEmojiPicker = ref(false)
const currentEmojiCategory = ref('smileys')

// Emoji分类数据
const emojiCategories = [
  { name: 'smileys', icon: '😊', label: '笑脸' },
  { name: 'gestures', icon: '👍', label: '手势' },
  { name: 'animals', icon: '🐱', label: '动物' },
  { name: 'food', icon: '🍕', label: '食物' },
  { name: 'activities', icon: '⚽', label: '活动' },
  { name: 'objects', icon: '💡', label: '物品' },
  { name: 'symbols', icon: '❤️', label: '符号' }
]

// Emoji数据
const emojis = {
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠',
    '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️',
    '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨',
    '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞'
  ],
  gestures: [
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️',
    '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
    '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
    '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
    '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠',
    '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'
  ],
  animals: [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵',
    '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤',
    '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
    '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
    '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖'
  ],
  food: [
    '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭',
    '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅',
    '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒',
    '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞',
    '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖',
    '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪',
    '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲',
    '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘'
  ],
  activities: [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
    '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
    '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊',
    '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿',
    '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️',
    '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗'
  ],
  objects: [
    '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️',
    '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷',
    '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟',
    '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️',
    '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌',
    '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵',
    '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰'
  ],
  symbols: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
    '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
    '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️',
    '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️',
    '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹'
  ]
}

// 优惠券弹窗相关
const showCouponDialog = ref(false)

const defaultAvatar = 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2'

const currentSession = computed(() => props.session)

// 用户名映射缓存，避免重复请求
const usernameCache = ref<Record<number, string>>({})

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

// 当前分类的emoji列表
const currentEmojis = computed(() => {
  return emojis[currentEmojiCategory.value as keyof typeof emojis] || []
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
  
  console.log('[CHAT DEBUG] isOwnMessage check:', {
    currentUserId: currentUser?.id,
    messageSenderId: message.senderId,
    isOwn: isOwn
  })

  return isOwn
}

// 获取用户ID对应的用户名（带缓存）
async function getUsernameById(userId: number): Promise<string> {
  if (usernameCache.value[userId]) {
    return usernameCache.value[userId]
  }

  try {
    const response = await api.user.getUserById(userId)
    if (response && response.code === '200' && response.data?.username) {
      usernameCache.value[userId] = response.data.username
      return response.data.username
    }
  } catch (error) {
    console.error('获取用户名失败:', error)
  }

  return '' // 返回空字符串表示获取失败
}

// 跳转到用户个人详情页
async function navigateToUserProfile(userId: number) {
  const username = await getUsernameById(userId)
  if (username) {
    router.push(`/users/${username}`)
  } else {
    ElMessage.error('无法获取用户信息')
  }
}

// 跳转到聊天对方的个人详情页
async function navigateToPartnerProfile() {
  if (!currentSession.value) return

  const currentUser = currentUserInfo.value
  // 根据当前用户角色确定对方的ID
  let partnerId: number | undefined
  if (currentUser?.id === currentSession.value.customerId) {
    partnerId = currentSession.value.merchantId
  } else {
    partnerId = currentSession.value.customerId
  }

  if (partnerId) {
    await navigateToUserProfile(partnerId)
  }
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
    console.log('[CHAT DEBUG] Attempting to send message:', content.substring(0, 50))
    console.log('[CHAT DEBUG] Current session:', currentSession.value.id)
    console.log('[CHAT DEBUG] WebSocket state:', chatState.connected)
    
    // 通过WebSocket发送消息（senderRole由后端根据用户身份确定）
    const messageSent = sendChatMessage({
      sessionId: currentSession.value.id,
      content,
      messageType: 'TEXT'
    })

    console.log('[CHAT DEBUG] sendChatMessage returned:', messageSent)

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
      console.log('[CHAT DEBUG] Message sent successfully, added temp message')
    } else {
      console.error('[CHAT DEBUG] sendChatMessage returned false')
      throw new Error('WebSocket未连接或发送失败')
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败: ' + (error as Error).message)
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

// 切换Emoji选择器显示
function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

// 插入Emoji到输入框
function insertEmoji(emoji: string) {
  newMessage.value += emoji
  // 不关闭选择器，方便连续选择
  // showEmojiPicker.value = false
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
  
  // 点击外部关闭emoji选择器
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  removeMessageListener(onNewMessage)
  document.removeEventListener('click', handleClickOutside)
})

// 点击外部关闭emoji选择器
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const emojiPicker = document.querySelector('.emoji-picker')
  const emojiBtn = document.querySelector('.emoji-btn')
  
  if (showEmojiPicker.value && 
      emojiPicker && 
      !emojiPicker.contains(target) && 
      emojiBtn &&
      !emojiBtn.contains(target)) {
    showEmojiPicker.value = false
  }
}

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

.clickable-avatar {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.clickable-avatar:hover {
  opacity: 0.8;
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
  background: #95ec69;
  color: #333;
  border-color: #95ec69;
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
  position: relative;
}

.input-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.emoji-btn {
  font-size: 20px;
  padding: 4px 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.emoji-btn:hover {
  transform: scale(1.2);
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-container :deep(.el-textarea) {
  flex: 1;
}

.input-container :deep(.el-textarea__inner) {
  padding: 8px 12px;
  border-radius: 8px;
  resize: none;
}

.send-btn {
  height: 56px;
  padding: 0 24px;
  border-radius: 8px;
}

/* Emoji选择器样式 */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 16px;
  width: 360px;
  max-height: 400px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e5e5;
  font-weight: 500;
}

.close-emoji {
  font-size: 18px;
  color: #999;
  padding: 0;
  min-height: auto;
}

.emoji-categories {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.emoji-categories :deep(.el-button) {
  font-size: 20px;
  padding: 6px 10px;
  min-height: auto;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.emoji-categories :deep(.el-button.active) {
  background-color: #e6f7ff;
}

.emoji-categories :deep(.el-button:hover) {
  background-color: #f5f5f5;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 12px;
  overflow-y: auto;
  max-height: 280px;
  scrollbar-width: thin;
}

.emoji-item {
  font-size: 24px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;
}

.emoji-item:hover {
  background-color: #f0f0f0;
  transform: scale(1.2);
}

.emoji-item:active {
  transform: scale(1.1);
}

/* 滚动条样式 */
.emoji-categories::-webkit-scrollbar,
.emoji-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.emoji-categories::-webkit-scrollbar-track,
.emoji-list::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-categories::-webkit-scrollbar-thumb,
.emoji-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.emoji-categories::-webkit-scrollbar-thumb:hover,
.emoji-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
