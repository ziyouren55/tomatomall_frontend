<template>
  <div class="post-detail-page" v-if="post">
  <div class="post-card">
      <div class="post-header">
        <div class="title">
          <span v-if="post.isSticky" class="tag sticky">置顶</span>
          <span v-if="post.isEssence" class="tag essence">精华</span>
          {{ post.title }}
        </div>
        <div class="meta">
          <span v-if="post.username">
            <UserMiniCard :username="post.username" :size="36" :showName="true" />
          </span>
          <span v-else>用户</span>
          <span>{{ formatTime(post.createTime) }}</span>
          <span>浏览 {{ post.viewCount ?? 0 }}</span>
          <span>回复 {{ post.replyCount ?? 0 }}</span>
        </div>
      </div>
      <div class="content" v-html="formatContent(post.content)"></div>
      <div v-if="post.imageUrls?.length" class="image-list">
        <img v-for="(img, idx) in post.imageUrls" :key="idx" :src="img" />
      </div>
      <div class="actions">
        <button @click="likePost" :disabled="likePostLoading">
          {{ post.isLiked ? '取消赞' : '👍 赞' }} {{ post.likeCount ?? 0 }}
        </button>
      </div>
    </div>

    <div class="reply-box">
      <h3>回复</h3>
      <textarea v-model="replyContent" placeholder="写下你的想法..." />
      <button :disabled="replyLoading || !replyContent.trim()" @click="submitReply">
        {{ replyLoading ? '提交中...' : '发布回复' }}
      </button>
    </div>

    <div class="reply-list">
      <div v-if="replyLoadingList" class="loading">加载回复...</div>
      <div v-else>
        <div v-for="reply in replies" :key="reply.id" class="reply-item">
          <div class="reply-meta">
            <span v-if="reply.username">
              <UserMiniCard :username="reply.username" :size="28" :showName="true" />
            </span>
            <span v-else>用户</span>
            <span>{{ formatTime(reply.createTime) }}</span>
          </div>
          <div class="reply-content">{{ reply.content }}</div>
          <div class="reply-actions">
            <button @click="likeReply(reply.id)" :disabled="replyLikeLoading.has(reply.id)">
              {{ reply.isLiked ? '取消赞' : '👍' }} {{ reply.likeCount ?? 0 }}
            </button>
          </div>
          <div v-if="reply.childReplies?.length" class="child-replies">
            <div v-for="child in reply.childReplies" :key="child.id" class="child-item">
              <div class="reply-meta">
                <span v-if="child.username">
                  <UserMiniCard :username="child.username" :size="24" :showName="true" />
                </span>
                <span v-else>用户</span>
                <span>{{ formatTime(child.createTime) }}</span>
              </div>
              <div class="reply-content">
                <span v-if="child.parentUsername" class="mention">@{{ child.parentUsername }} </span>
                {{ child.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
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
  const res = await api.post.getPostDetail(postId())
  post.value = res.data
}

const fetchReplies = async () => {
  replyLoadingList.value = true
  try {
    const res = await api.reply.getRepliesByPost(postId(), 0, 50)
    replies.value = res.data?.content || []
  } finally {
    replyLoadingList.value = false
  }
}

const submitReply = async () => {
  if (!replyContent.value.trim()) return
  replyLoading.value = true
  try {
    await api.reply.createReply({ postId: postId(), content: replyContent.value.trim() })
    replyContent.value = ''
    fetchReplies()
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
  } finally {
    likePostLoading.value = false
  }
}

const likeReply = async (replyId: number) => {
  const target = replies.value.find(r => r.id === replyId)
  const next = new Set(replyLikeLoading.value)
  next.add(replyId)
  replyLikeLoading.value = next
  try {
    const res = await api.reply.likeReply(replyId)
    const updated = res.data
    // 更新对应回复（含子回复）的计数与状态
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
  } finally {
    const after = new Set(replyLikeLoading.value)
    after.delete(replyId)
    replyLikeLoading.value = after
  }
}

const formatTime = (t?: string) => (t ? new Date(t).toLocaleString() : '')
const formatContent = (text?: string) => (text || '').replace(/\n/g, '<br/>')

onMounted(() => {
  fetchPost()
  fetchReplies()
})
</script>

<style scoped>
.post-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}
.post-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.post-header .title {
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}
.meta {
  color: #999;
  font-size: 12px;
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.content {
  margin: 12px 0;
  line-height: 1.6;
  color: #333;
}
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.image-list img {
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  background: #f6f6f6;
}
.actions {
  margin-top: 10px;
}
.actions button {
  padding: 6px 12px;
  border: 1px solid #ff6b35;
  color: #ff6b35;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}
.reply-box {
  margin-top: 18px;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.reply-box textarea {
  width: 100%;
  min-height: 100px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 8px;
  resize: vertical;
}
.reply-box button {
  margin-top: 10px;
  padding: 8px 14px;
  background: #ff6b35;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.reply-list {
  margin-top: 16px;
}
.reply-item {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 10px;
}
.reply-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 10px;
}
.reply-content {
  margin: 6px 0;
  color: #333;
  line-height: 1.5;
}
.reply-actions button {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}
.child-replies {
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid #f0f0f0;
}
.child-item {
  margin-bottom: 6px;
}
.mention {
  color: #ff6b35;
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
.loading {
  text-align: center;
  color: #666;
  padding: 30px 0;
}
</style>

