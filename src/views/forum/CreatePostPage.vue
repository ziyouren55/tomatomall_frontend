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
        <label>图片上传（可选，最多5张）</label>
        <div class="upload-box">
          <input type="file" accept="image/*" multiple @change="handleFiles" :disabled="uploading || images.length >= 5" />
          <span class="tip">支持多选，自动上传并填充链接</span>
        </div>
        <div class="thumb-list" v-if="images.length">
          <div v-for="(img, idx) in images" :key="idx" class="thumb">
            <img :src="img" alt="img" />
            <button type="button" @click="removeImage(idx)" :disabled="submitting || uploading">移除</button>
          </div>
        </div>
        <p class="error" v-if="uploadError">{{ uploadError }}</p>
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

const images = ref<string[]>([])
const submitting = ref(false)
const error = ref('')
const success = ref('')
const forumName = ref('')
const uploading = ref(false)
const uploadError = ref('')

const fetchForum = async () => {
  try {
    const res = await api.forum.getForumById(forumId)
    forumName.value = res.data?.name || ''
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '加载论坛失败'
  }
}

const handleFiles = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return
  uploadError.value = ''
  uploading.value = true
  try {
    const remain = 5 - images.value.length
    const list = Array.from(files).slice(0, remain)
    for (const file of list) {
      const res = await api.image.uploadImage(file, 'forum')
      if (res.data) {
        images.value.push(res.data)
      }
    }
  } catch (err: any) {
    uploadError.value = err?.response?.data?.msg || '上传失败，请重试'
  } finally {
    uploading.value = false
    if (input) input.value = ''
  }
}

const removeImage = (idx: number) => {
  images.value.splice(idx, 1)
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
    await api.post.createPost({
      forumId,
      title: form.title.trim(),
      content: form.content.trim(),
      imageUrlList: images.value
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
.upload-box {
  display: flex;
  align-items: center;
  gap: 10px;
}
.upload-box input {
  padding: 6px 0;
}
.upload-box .tip {
  font-size: 12px;
  color: #888;
}
.thumb-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.thumb {
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.thumb img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}
.thumb button {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
</style>

