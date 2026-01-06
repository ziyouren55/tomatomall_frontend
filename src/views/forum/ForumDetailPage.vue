<template>
  <div class="forum-detail-page">
    <!-- 返回按钮 -->
    <div class="back-button-container">
      <BackButton text="返回论坛列表" fallback-path="/forums" />
    </div>

    <!-- 论坛头部 -->
    <div class="forum-header" v-if="forum">
      <div class="header-background"></div>
      <div class="header-content">
        <div class="cover-section">
          <div class="cover-wrapper">
            <img v-if="forum.bookCover" :src="forum.bookCover" class="cover-image" />
            <div v-else class="cover-placeholder">
              <el-icon :size="60"><Reading /></el-icon>
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <h1 class="forum-title">{{ forum.name }}</h1>
          <p class="forum-description">{{ forum.description || '欢迎分享你的想法' }}</p>
          
          <div class="forum-stats">
            <div class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ total }} 帖子</span>
            </div>
            <div v-if="forum.bookTitle" class="stat-item book-info">
              <el-icon><Reading /></el-icon>
              <span>{{ forum.bookTitle }}</span>
            </div>
          </div>
          
          <el-button 
            type="primary" 
            size="large" 
            @click="goCreatePost"
            class="create-post-btn"
          >
            <el-icon><EditPen /></el-icon>
            发布新帖
          </el-button>
        </div>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div class="post-section">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <el-icon :size="40"><CircleClose /></el-icon>
        <p>{{ error }}</p>
        <el-button @click="fetchPosts">重试</el-button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="posts.length === 0" class="empty-state">
        <el-icon :size="60"><Document /></el-icon>
        <p>暂无帖子</p>
        <p class="empty-hint">快来发布第一条帖子吧！</p>
        <el-button type="primary" @click="goCreatePost">发布帖子</el-button>
      </div>

      <!-- 帖子列表 -->
      <div v-else class="post-list">
        <div 
          v-for="post in posts" 
          :key="post.id" 
          class="post-card" 
          @click="goPost(post.id)"
        >
          <div class="post-header">
            <div class="post-title-row">
              <el-tag v-if="post.isSticky" type="danger" effect="dark" class="post-tag sticky-tag">
                <el-icon><Top /></el-icon>
                <span>置顶</span>
              </el-tag>
              <el-tag v-if="post.isEssence" type="warning" effect="dark" class="post-tag essence-tag">
                <el-icon><Star /></el-icon>
                <span>精华</span>
              </el-tag>
              <h3 class="post-title">{{ post.title }}</h3>
            </div>
          </div>
          
          <p class="post-content">{{ truncate(post.content) }}</p>
          
          <div class="post-footer">
            <div class="author-info">
              <el-avatar :size="32" class="avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ post.username || '匿名用户' }}</span>
              <span class="post-time">{{ formatTime(post.createTime) }}</span>
            </div>
            
            <div class="post-stats">
              <div class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ post.replyCount ?? 0 }}</span>
              </div>
              <div class="stat-item">
                <el-icon><Star /></el-icon>
                <span>{{ post.likeCount ?? 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页器 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="size"
            :total="total"
            layout="prev, pager, next, jumper"
            @current-change="handlePageChange"
            background
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Reading, 
  ChatDotRound, 
  EditPen, 
  Loading, 
  CircleClose, 
  Document,
  Top,
  Star,
  User
} from '@element-plus/icons-vue'
import api from '@/api'
import BackButton from '@/components/common/BackButton.vue'
import type { Forum, PostItem } from '@/types/api'

const route = useRoute()
const router = useRouter()

const forum = ref<Forum | null>(null)
const posts = ref<PostItem[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(0)
const size = 10
const total = ref(0)

const currentPage = computed({
  get: () => page.value + 1,
  set: (val) => { page.value = val - 1 }
})

const forumId = () => Number(route.params.id)

const fetchForum = async () => {
  try {
    const res = await api.forum.getForumById(forumId())
    forum.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '加载论坛信息失败'
  }
}

const fetchPosts = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.post.getPostsByForum(forumId(), page.value, size)
    posts.value = res.data?.content || []
    total.value = res.data?.totalElements || 0
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '加载帖子失败'
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage: number) => {
  page.value = newPage - 1
  fetchPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goPost = (id: number) => {
  router.push(`/posts/${id}`)
}

const goCreatePost = () => {
  router.push(`/forums/${forumId()}/new-post`)
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

const truncate = (text?: string) => {
  if (!text) return ''
  return text.length > 120 ? text.slice(0, 120) + '...' : text
}

onMounted(() => {
  fetchForum()
  fetchPosts()
})

watch(() => route.params.id, () => {
  page.value = 0
  fetchForum()
  fetchPosts()
})
</script>

<style scoped>
.forum-detail-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 60px;
}

.back-button-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px 0;
}

/* 论坛头部 */
.forum-header {
  position: relative;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.9;
}

.header-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.cover-section {
  flex-shrink: 0;
}

.cover-wrapper {
  width: 160px;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  background: white;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: rgba(0, 0, 0, 0.3);
}

.info-section {
  flex: 1;
  color: white;
}

.forum-title {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.forum-description {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
}

.forum-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
}

.stat-item .el-icon {
  font-size: 18px;
}

.stat-item.book-info {
  color: rgba(255, 255, 255, 1);
  font-weight: 500;
}

.create-post-btn {
  background: white;
  color: #667eea;
  border: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.create-post-btn:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* 帖子区域 */
.post-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 状态显示 */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.loading-state .el-icon,
.error-state .el-icon,
.empty-state .el-icon {
  margin-bottom: 16px;
  color: #999;
}

.error-state {
  color: #f56c6c;
}

.error-state .el-icon {
  color: #f56c6c;
}

.empty-hint {
  color: #999;
  font-size: 14px;
  margin: 8px 0 24px;
}

/* 帖子列表 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.post-header {
  margin-bottom: 12px;
}

.post-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.post-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.post-tag .el-icon {
  font-size: 14px;
}

.sticky-tag {
  background: #f56c6c;
  border-color: #f56c6c;
}

.essence-tag {
  background: #e6a23c;
  border-color: #e6a23c;
}

.post-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
  flex: 1;
}

.post-content {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.post-time {
  font-size: 13px;
  color: #999;
}

.post-stats {
  display: flex;
  gap: 16px;
}

.post-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 13px;
}

.post-stats .stat-item .el-icon {
  font-size: 16px;
}

/* 分页器 */
.pagination-wrapper {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 16px;
  }

  .cover-wrapper {
    width: 140px;
    height: 190px;
  }

  .forum-title {
    font-size: 24px;
  }

  .forum-stats {
    justify-content: center;
  }

  .post-card {
    padding: 16px;
  }

  .post-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
