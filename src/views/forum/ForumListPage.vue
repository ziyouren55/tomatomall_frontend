<template>
  <div class="forum-list-page">
    <!-- 顶部横幅 -->
    <div class="page-banner">
      <div class="banner-content">
        <h1>📚 书籍论坛</h1>
        <p>和其他读者一起讨论、分享与发现好书</p>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="filter-bar">
      <div class="tabs">
        <button 
          :class="{ active: activeTab === 'active' }" 
          @click="switchTab('active')"
        >
          <span class="tab-icon">🔥</span>
          活跃论坛
        </button>
        <button 
          :class="{ active: activeTab === 'all' }" 
          @click="switchTab('all')"
        >
          <span class="tab-icon">📖</span>
          全部论坛
        </button>
      </div>
      
      <div class="search-box">
        <el-input
          v-model="keyword"
          placeholder="搜索论坛名称或书籍"
          size="large"
          clearable
          @keyup.enter="startSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="startSearch" :icon="Search">搜索</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <el-icon :size="40"><CircleClose /></el-icon>
      <p>{{ error }}</p>
      <el-button @click="fetchForums">重试</el-button>
    </div>

    <!-- 论坛网格 -->
    <div v-else class="forum-grid">
      <div 
        v-for="forum in forums" 
        :key="forum.id" 
        class="forum-card" 
        @click="goDetail(forum.id)"
      >
        <div class="card-cover">
          <img 
            v-if="forum.bookCover" 
            :src="forum.bookCover" 
            alt="cover" 
            class="cover-image" 
          />
          <div v-else class="cover-placeholder">
            <el-icon :size="40"><Reading /></el-icon>
          </div>
        </div>
        
        <div class="card-content">
          <h3 class="forum-name">{{ forum.name }}</h3>
          <p class="forum-desc">{{ forum.description || '欢迎讨论' }}</p>
          
          <div class="forum-meta">
            <div class="meta-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ forum.postCount ?? 0 }} 帖子</span>
            </div>
            <div v-if="forum.bookTitle" class="meta-item book-title">
              <el-icon><Reading /></el-icon>
              <span>{{ forum.bookTitle }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !error && forums.length === 0" class="empty-state">
      <el-icon :size="60"><FolderOpened /></el-icon>
      <p>暂无论坛</p>
    </div>

    <!-- 分页器 -->
    <div v-if="forums.length > 0" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="size"
        :total="totalPages * size"
        layout="prev, pager, next, jumper"
        @current-change="handlePageChange"
        background
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Loading, CircleClose, Reading, ChatDotRound, FolderOpened } from '@element-plus/icons-vue'
import api from '@/api'
import type { Forum } from '@/types/api'

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

const currentPage = computed({
  get: () => page.value + 1,
  set: (val) => { page.value = val - 1 }
})

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
    error.value = e?.response?.data?.msg || '加载失败，请稍后重试'
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
  if (!keyword.value.trim()) {
    isSearching.value = false
    page.value = 0
    fetchForums()
    return
  }
  isSearching.value = true
  page.value = 0
  fetchForums()
}

const handlePageChange = (newPage: number) => {
  page.value = newPage - 1
  fetchForums()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(fetchForums)
</script>

<style scoped>
.forum-list-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  padding-bottom: 60px;
}

/* 顶部横幅 */
.page-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.banner-content h1 {
  margin: 0 0 12px 0;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 1px;
}

.banner-content p {
  margin: 0;
  font-size: 16px;
  opacity: 0.95;
}

/* 筛选栏 */
.filter-bar {
  max-width: 1200px;
  margin: -30px auto 40px;
  padding: 0 24px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 12px;
  background: white;
  padding: 6px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.tabs button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tabs button:hover {
  background: #f5f5f5;
  color: #333;
}

.tabs button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.tab-icon {
  font-size: 18px;
}

.search-box {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

/* 状态显示 */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
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

.error-state p {
  margin: 16px 0;
  font-size: 15px;
}

/* 论坛网格 */
.forum-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.forum-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.forum-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-cover {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.forum-name {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.forum-desc {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.forum-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 13px;
}

.meta-item .el-icon {
  font-size: 16px;
}

.meta-item.book-title {
  color: #667eea;
  font-weight: 500;
}

/* 分页器 */
.pagination-wrapper {
  max-width: 1200px;
  margin: 40px auto 0;
  padding: 0 24px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-content h1 {
    font-size: 28px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .tabs {
    justify-content: center;
  }

  .search-box {
    max-width: 100%;
  }

  .forum-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}
</style>
