<template>
  <div class="forum-detail-page">
    <div class="forum-header" v-if="forum">
      <div class="cover-wrapper">
        <img v-if="forum.bookCover" :src="forum.bookCover" class="cover" />
      </div>
      <div class="title-area">
        <h1>{{ forum.name }}</h1>
        <p class="desc">{{ forum.description || '欢迎分享你的想法' }}</p>
        <div class="meta">
          <span>帖子 {{ forum.postCount ?? 0 }}</span>
          <span v-if="forum.bookTitle">书籍：{{ forum.bookTitle }}</span>
        </div>
        <button class="primary" @click="goCreatePost">发布帖子</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="post-section">
      <div v-if="posts.length === 0" class="empty">暂无帖子，快来发布第一条吧</div>
      <div v-else>
        <div v-for="post in posts" :key="post.id" class="post-card" @click="goPost(post.id)">
          <div class="post-title">
            <span v-if="post.isSticky" class="tag sticky">置顶</span>
            <span v-if="post.isEssence" class="tag essence">精华</span>
            {{ post.title }}
          </div>
          <div class="post-meta">
            <span>{{ post.username || '用户' }}</span>
            <span>{{ formatTime(post.createTime) }}</span>
            <span>回复 {{ post.replyCount ?? 0 }}</span>
            <span>赞 {{ post.likeCount ?? 0 }}</span>
          </div>
          <p class="post-content">{{ truncate(post.content) }}</p>
        </div>
        <div class="pager">
          <button :disabled="page === 0" @click="changePage(page - 1)">上一页</button>
          <span>第 {{ page + 1 }} 页</span>
          <button :disabled="(page + 1) * size >= total" @click="changePage(page + 1)">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import type { Forum } from '@/types/api'
import type { PostItem } from '@/types/api'

const route = useRoute()
const router = useRouter()

const forum = ref<Forum | null>(null)
const posts = ref<PostItem[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(0)
const size = 10
const total = ref(0)

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

const changePage = (p: number) => {
  page.value = p
  fetchPosts()
}

const goPost = (id: number) => {
  router.push(`/posts/${id}`)
}

const goCreatePost = () => {
  router.push(`/forums/${forumId()}/new-post`)
}

const formatTime = (t?: string) => (t ? new Date(t).toLocaleString() : '')
const truncate = (text?: string) => {
  if (!text) return ''
  return text.length > 80 ? text.slice(0, 80) + '...' : text
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
}
.forum-header {
  display: flex;
  gap: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}
.cover-wrapper {
  width: 120px;
  height: 160px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}
.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.title-area h1 {
  margin: 0;
  font-size: 22px;
}
.desc {
  margin: 8px 0;
  color: #666;
}
.meta {
  display: flex;
  gap: 12px;
  color: #999;
  font-size: 12px;
}
.primary {
  margin-top: 12px;
  padding: 8px 16px;
  background: #ff6b35;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.post-section {
  margin-top: 20px;
}
.post-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
  cursor: pointer;
}
.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.post-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
}
.tag.sticky {
  background: #ff6b35;
}
.tag.essence {
  background: #f0ad4e;
}
.post-meta {
  color: #999;
  font-size: 12px;
  display: flex;
  gap: 10px;
  margin: 6px 0;
}
.post-content {
  color: #555;
  margin: 0;
  line-height: 1.4;
}
.pager {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-top: 12px;
}
.pager button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}
.loading,
.error,
.empty {
  text-align: center;
  padding: 40px 0;
  color: #666;
}
.error {
  color: #d9534f;
}
</style>

