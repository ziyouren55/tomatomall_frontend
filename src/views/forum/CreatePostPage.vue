<template>
  <div class="create-post-page">
    <div class="card">
      <h1>发布帖子</h1>
      <p v-if="forumName" class="forum-name">所属论坛：{{ forumName }}</p>

      <div class="form-group">
        <label>标题</label>
        <input v-model="form.title" placeholder="请输入标题" />
      </div>

      <div class="form-group">
        <label>内容</label>
        <textarea v-model="form.content" rows="8" placeholder="请输入内容" />
      </div>

      <div class="form-group">
        <label>图片链接（用逗号分隔，可选）</label>
        <input v-model="imageInput" placeholder="https://example.com/a.jpg,https://example.com/b.jpg" />
      </div>

      <div class="actions">
        <button :disabled="submitting" @click="submit">
          {{ submitting ? '提交中...' : '发布' }}
        </button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const forumId = Number(route.params.id)

const form = reactive({
  title: '',
  content: ''
})

const imageInput = ref('')
const submitting = ref(false)
const error = ref('')
const success = ref('')
const forumName = ref('')

const fetchForum = async () => {
  try {
    const res = await api.forum.getForumById(forumId)
    forumName.value = res.data?.name || ''
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '加载论坛失败'
  }
}

const submit = async () => {
  if (!form.title.trim() || !form.content.trim()) {
    error.value = '标题和内容不能为空'
    return
  }
  submitting.value = true
  error.value = ''
  success.value = ''
  try {
    const images = imageInput.value
      ? imageInput.value.split(',').map(i => i.trim()).filter(i => i.length > 0)
      : []
    await api.post.createPost({
      forumId,
      title: form.title.trim(),
      content: form.content.trim(),
      imageUrlList: images
    })
    success.value = '发布成功，正在跳转...'
    setTimeout(() => router.push(`/forums/${forumId}`), 800)
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '发布失败'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchForum)
</script>

<style scoped>
.create-post-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px 12px;
}
.card {
  background: #fff;
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
h1 {
  margin: 0 0 8px;
}
.forum-name {
  color: #666;
  margin: 0 0 16px;
}
.form-group {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
input,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}
textarea {
  resize: vertical;
}
.actions button {
  padding: 10px 16px;
  background: #ff6b35;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.error {
  color: #d9534f;
  margin-top: 8px;
}
.success {
  color: #28a745;
  margin-top: 8px;
}
</style>

