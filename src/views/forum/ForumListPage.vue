<template>
  <div class="forum-list-page">
    <div class="page-header">
      <h1>书籍论坛</h1>
      <p>和其他读者一起讨论、分享与发现</p>
      <div class="actions">
        <button :class="{ active: activeTab === 'active' }" @click="switchTab('active')">活跃论坛</button>
        <button :class="{ active: activeTab === 'all' }" @click="switchTab('all')">全部论坛</button>
        <div class="search-box">
          <input v-model="keyword" placeholder="按论坛名称搜索" @keyup.enter="startSearch" />
          <button @click="startSearch">搜索</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="forum-grid">
      <div v-for="forum in forums" :key="forum.id" class="forum-card" @click="goDetail(forum.id)">
        <img v-if="forum.bookCover" :src="forum.bookCover" alt="cover" class="cover" />
        <div class="info">
          <h3>{{ forum.name }}</h3>
          <p class="desc">{{ forum.description || '欢迎讨论' }}</p>
          <div class="meta">
            <span>帖子 {{ forum.postCount ?? 0 }}</span>
            <span v-if="forum.bookTitle">书籍：{{ forum.bookTitle }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pager">
      <button :disabled="page === 0" @click="changePage(page - 1)">上一页</button>
      <span>第 {{ page + 1 }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="page + 1 >= totalPages" @click="changePage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import type { Forum } from '@/api/modules/forum'

const router = useRouter()
const activeTab = ref<'active' | 'all'>('active')
const forums = ref<Forum[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(0)
const size = 12
const totalPages = ref(1)
const keyword = ref('')
const isSearching = ref(false)

const fetchForums = async () => {
  loading.value = true
  error.value = ''
  try {
    let res
    if (isSearching.value && keyword.value.trim()) {
      res = await api.forum.searchForums(keyword.value.trim(), page.value, size)
    } else if (activeTab.value === 'active') {
      res = await api.forum.getActiveForums(page.value, size)
    } else {
      res = await api.forum.getForums(page.value, size)
    }
    forums.value = res.data?.content || []
    totalPages.value = res.data?.totalPages || 1
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '加载失败'
  } finally {
    loading.value = false
  }
}

const switchTab = (tab: 'active' | 'all') => {
  if (activeTab.value !== tab) {
    activeTab.value = tab
    isSearching.value = false
    keyword.value = ''
    page.value = 0
    fetchForums()
  }
}

const goDetail = (id: number) => {
  router.push(`/forums/${id}`)
}

const startSearch = () => {
  if (!keyword.value.trim()) return
  isSearching.value = true
  page.value = 0
  fetchForums()
}

const changePage = (p: number) => {
  if (p < 0) return
  page.value = p
  fetchForums()
}

onMounted(fetchForums)
</script>

<style scoped>
.forum-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
}
.page-header {
  text-align: center;
  margin-bottom: 24px;
}
.page-header h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}
.page-header p {
  color: #666;
  margin: 8px 0 16px;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.actions button {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #ff6b35;
  background: #fff;
  color: #ff6b35;
  cursor: pointer;
}
.actions button.active {
  background: #ff6b35;
  color: #fff;
}
.search-box {
  display: flex;
  gap: 8px;
  align-items: center;
}
.search-box input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 200px;
}
.search-box button {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ff6b35;
  background: #ff6b35;
  color: #fff;
  cursor: pointer;
}
.forum-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.forum-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  padding: 16px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.forum-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}
.cover {
  width: 72px;
  height: 96px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}
.info h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}
.desc {
  margin: 6px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}
.meta {
  display: flex;
  gap: 12px;
  color: #999;
  font-size: 12px;
}
.loading,
.error {
  text-align: center;
  color: #666;
  padding: 40px 0;
}
.error {
  color: #d9534f;
}
.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}
.pager button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
</style>

