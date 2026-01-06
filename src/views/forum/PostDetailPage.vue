<template>
  <div class="post-detail-page">
    <!-- 返回按钮 -->
    <div class="back-button-container">
      <BackButton text="返回" />
    </div>

    <!-- 加载状态 -->
    <div v-if="!post" class="loading-state">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <!-- 帖子内容 -->
    <div v-else class="post-container">
      <!-- 帖子卡片 -->
      <div class="post-card">
        <!-- 帖子头部 -->
        <div class="post-header">
          <div class="title-row">
            <el-tag v-if="post.isSticky" type="danger" effect="dark" class="post-tag sticky-tag">
              <el-icon><Top /></el-icon>
              <span>置顶</span>
            </el-tag>
            <el-tag v-if="post.isEssence" type="warning" effect="dark" class="post-tag essence-tag">
              <el-icon><Star /></el-icon>
              <span>精华</span>
            </el-tag>
            <h1 class="post-title">{{ post.title }}</h1>
          </div>
          
          <div class="post-meta">
            <div class="author-section">
              <UserMiniCard 
                v-if="post.username" 
                :username="post.username" 
                :size="40" 
                :showName="true" 
              />
              <span v-else class="anonymous">匿名用户</span>
            </div>
            
            <div class="meta-info">
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatTime(post.createTime) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ post.viewCount ?? 0 }} 浏览</span>
              </div>
              <div class="meta-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ post.replyCount ?? 0 }} 回复</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 帖子内容 -->
        <div class="post-content">
          <div class="content-text" v-html="formatContent(post.content)"></div>
          
          <!-- 图片列表 -->
          <div v-if="post.imageUrls?.length" class="image-gallery">
            <el-image
              v-for="(img, idx) in post.imageUrls"
              :key="idx"
              :src="img"
              :preview-src-list="post.imageUrls"
              :initial-index="idx"
              fit="cover"
              class="gallery-image"
            />
          </div>
        </div>

        <!-- 帖子操作 -->
        <div class="post-actions">
          <el-button
            :type="post.isLiked ? 'primary' : 'default'"
            :loading="likePostLoading"
            @click="likePost"
            size="large"
          >
            <el-icon><Star /></el-icon>
            {{ post.isLiked ? '已赞' : '点赞' }}
            <span class="count">{{ post.likeCount ?? 0 }}</span>
          </el-button>
          
          <el-button size="large">
            <el-icon><Share /></el-icon>
            分享
          </el-button>
        </div>
      </div>

      <!-- 回复输入框 -->
      <div class="reply-box">
        <div class="reply-header">
          <h3>
            <el-icon><ChatDotRound /></el-icon>
            发表回复
          </h3>
        </div>
        
        <el-input
          v-model="replyContent"
          type="textarea"
          :rows="4"
          placeholder="写下你的想法..."
          maxlength="500"
          show-word-limit
          class="reply-textarea"
        />
        
        <div class="reply-actions">
          <el-button
            type="primary"
            size="large"
            :disabled="!replyContent.trim()"
            :loading="replyLoading"
            @click="submitReply"
          >
            <el-icon><Promotion /></el-icon>
            {{ replyLoading ? '发布中...' : '发布回复' }}
          </el-button>
        </div>
      </div>

      <!-- 回复列表 -->
      <div class="reply-section">
        <div class="section-header">
          <h3>
            <el-icon><ChatLineRound /></el-icon>
            全部回复
            <span class="count">({{ replies.length }})</span>
          </h3>
        </div>

        <!-- 加载状态 -->
        <div v-if="replyLoadingList" class="loading-replies">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载回复中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="replies.length === 0" class="empty-replies">
          <el-icon :size="50"><ChatLineRound /></el-icon>
          <p>暂无回复</p>
          <p class="hint">快来发表第一条回复吧！</p>
        </div>

        <!-- 回复列表 -->
        <div v-else class="reply-list">
          <div v-for="reply in replies" :key="reply.id" class="reply-item">
            <div class="reply-header">
              <UserMiniCard
                v-if="reply.username"
                :username="reply.username"
                :size="36"
                :showName="true"
              />
              <span v-else class="anonymous">匿名用户</span>
              
              <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
            </div>

            <div class="reply-content">{{ reply.content }}</div>

            <div class="reply-footer">
              <el-button
                text
                :type="reply.isLiked ? 'primary' : 'default'"
                :loading="replyLikeLoading.has(reply.id)"
                @click="likeReply(reply.id)"
                size="small"
              >
                <el-icon><Star /></el-icon>
                {{ reply.isLiked ? '已赞' : '赞' }}
                <span v-if="reply.likeCount">{{ reply.likeCount }}</span>
              </el-button>
            </div>

            <!-- 子回复 -->
            <div v-if="reply.childReplies?.length" class="child-replies">
              <div v-for="child in reply.childReplies" :key="child.id" class="child-item">
                <div class="child-header">
                  <UserMiniCard
                    v-if="child.username"
                    :username="child.username"
                    :size="28"
                    :showName="true"
                  />
                  <span v-else class="anonymous">匿名用户</span>
                  
                  <span class="reply-time">{{ formatTime(child.createTime) }}</span>
                </div>

                <div class="child-content">
                  <span v-if="child.parentUsername" class="mention">
                    @{{ child.parentUsername }}
                  </span>
                  {{ child.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Loading,
  Top,
  Star,
  Clock,
  View,
  ChatDotRound,
  Share,
  Promotion,
  ChatLineRound
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import BackButton from '@/components/common/BackButton.vue'
import type { PostItem, ReplyItem } from '@/types/api'
import UserMiniCard from '@/components/common/UserMiniCard.vue'

const route = useRoute()
const post = ref<PostItem | null>(null)
const replies = ref<ReplyItem[]>([])
const replyContent = ref('')
const replyLoading = ref(false)
const replyLoadingList = ref(false)
const likePostLoading = ref(false)
const replyLikeLoading = ref<Set<number>>(new Set())

const postId = () => Number(route.params.id)

const fetchPost = async () => {
  try {
    const res = await api.post.getPostDetail(postId())
    post.value = res.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '加载帖子失败')
  }
}

const fetchReplies = async () => {
  replyLoadingList.value = true
  try {
    const res = await api.reply.getRepliesByPost(postId(), 0, 50)
    replies.value = res.data?.content || []
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '加载回复失败')
  } finally {
    replyLoadingList.value = false
  }
}

const submitReply = async () => {
  if (!replyContent.value.trim()) return
  replyLoading.value = true
  try {
    await api.reply.createReply({ 
      postId: postId(), 
      content: replyContent.value.trim() 
    })
    replyContent.value = ''
    ElMessage.success('回复发布成功')
    fetchReplies()
    // 更新帖子回复数
    if (post.value) {
      post.value.replyCount = (post.value.replyCount ?? 0) + 1
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '发布失败')
  } finally {
    replyLoading.value = false
  }
}

const likePost = async () => {
  if (!post.value) return
  likePostLoading.value = true
  try {
    const res = await api.post.likePost(postId())
    post.value = res.data
    ElMessage.success(post.value.isLiked ? '已点赞' : '已取消点赞')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '操作失败')
  } finally {
    likePostLoading.value = false
  }
}

const likeReply = async (replyId: number) => {
  const next = new Set(replyLikeLoading.value)
  next.add(replyId)
  replyLikeLoading.value = next
  
  try {
    const res = await api.reply.likeReply(replyId)
    const updated = res.data
    
    // 更新对应回复的计数与状态
    const updateReply = (list: ReplyItem[]): ReplyItem[] => list.map(r => {
      if (r.id === replyId) {
        return { ...r, likeCount: updated.likeCount, isLiked: updated.isLiked }
      }
      if (r.childReplies?.length) {
        return { ...r, childReplies: updateReply(r.childReplies) }
      }
      return r
    })
    
    replies.value = updateReply(replies.value)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '操作失败')
  } finally {
    const after = new Set(replyLikeLoading.value)
    after.delete(replyId)
    replyLikeLoading.value = after
  }
}

const formatTime = (t?: string) => {
  if (!t) return ''
  const date = new Date(t)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString()
}

const formatContent = (text?: string) => {
  if (!text) return ''
  return text.replace(/\n/g, '<br/>')
}

onMounted(() => {
  fetchPost()
  fetchReplies()
})
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 24px 16px 60px;
}

.back-button-container {
  max-width: 900px;
  margin: 0 auto 16px;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 100px 20px;
  color: #999;
}

.loading-state .el-icon {
  margin-bottom: 16px;
}

/* 帖子容器 */
.post-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 帖子卡片 */
.post-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.post-header {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.post-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  border-radius: 6px;
}

.post-tag .el-icon {
  font-size: 16px;
}

.sticky-tag {
  background: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.essence-tag {
  background: #e6a23c;
  border-color: #e6a23c;
  color: white;
}

.post-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
  line-height: 1.4;
  flex: 1;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.author-section {
  display: flex;
  align-items: center;
}

.anonymous {
  color: #999;
  font-size: 14px;
}

.meta-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 14px;
}

.meta-item .el-icon {
  font-size: 16px;
}

/* 帖子内容 */
.post-content {
  margin-bottom: 24px;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 20px;
}

.content-text :deep(br) {
  display: block;
  margin: 8px 0;
}

/* 图片画廊 */
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.gallery-image {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s;
}

.gallery-image:hover {
  transform: scale(1.05);
}

/* 帖子操作 */
.post-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.post-actions .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-actions .count {
  margin-left: 4px;
  font-weight: 600;
}

/* 回复输入框 */
.reply-box {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.reply-header {
  margin-bottom: 16px;
}

.reply-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reply-textarea {
  margin-bottom: 16px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
}

/* 回复区域 */
.reply-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-header h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header .count {
  color: #999;
  font-weight: 400;
  font-size: 16px;
}

/* 加载回复 */
.loading-replies {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 空状态 */
.empty-replies {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-replies .el-icon {
  margin-bottom: 16px;
  color: #ddd;
}

.empty-replies p {
  margin: 8px 0;
}

.empty-replies .hint {
  font-size: 14px;
  color: #bbb;
}

/* 回复列表 */
.reply-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: background 0.3s;
}

.reply-item:hover {
  background: #f0f2f5;
}

.reply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.reply-time {
  font-size: 13px;
  color: #999;
}

.reply-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
}

.reply-footer {
  display: flex;
  gap: 12px;
}

/* 子回复 */
.child-replies {
  margin-top: 16px;
  padding-left: 20px;
  border-left: 3px solid #e0e0e0;
}

.child-item {
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
}

.child-item:last-child {
  margin-bottom: 0;
}

.child-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.child-content {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
}

.mention {
  color: #667eea;
  font-weight: 500;
  margin-right: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-card {
    padding: 20px;
  }

  .post-title {
    font-size: 22px;
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-text {
    font-size: 15px;
  }

  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .gallery-image {
    height: 150px;
  }

  .post-actions {
    flex-direction: column;
  }

  .post-actions .el-button {
    width: 100%;
  }
}
</style>
