<template>
  <div class="admin-schools">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
          <h1>🏫 学校管理</h1>
        </div>
        <p class="header-subtitle">管理系统中的学校信息数据</p>
      </div>
      
      <!-- 统计信息 -->
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalSchools }}</div>
            <div class="stat-label">学校总数</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">📄</div>
          <div class="stat-info">
            <div class="stat-value">{{ currentPageCount }}</div>
            <div class="stat-label">当前页</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="search-section">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            v-model="q" 
            placeholder="搜索学校名称..." 
            @keyup.enter="searchSchools"
            class="search-input"
          />
          <button v-if="q" @click="clearSearch" class="clear-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <button @click="searchSchools" class="btn-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          搜索
        </button>
      </div>

      <div class="action-section">
        <label class="btn-import">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          导入CSV
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleImportFile" 
            accept=".csv"
            style="display: none;"
          />
        </label>
        <button @click="fetchPage" class="btn-refresh">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          刷新
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 内容区域 -->
    <div v-else class="content-area">
      <!-- 空状态 -->
      <div v-if="items.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>未找到学校</h3>
        <p>{{ q ? '没有找到匹配的学校，请尝试其他关键词' : '暂无学校数据' }}</p>
      </div>

      <!-- 学校列表 -->
      <div v-else>
        <div class="schools-grid">
          <div v-for="school in items" :key="school.code" class="school-card">
            <div class="card-header">
              <div class="school-icon">🏫</div>
              <div class="school-info">
                <h3 class="school-name">{{ school.name }}</h3>
                <div class="school-meta">
                  <span class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="10" r="3"></circle>
                      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"></path>
                    </svg>
                    {{ school.province_name || school.provinceCode }}
                  </span>
                  <span class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {{ school.city_name || school.cityCode }}
                  </span>
                </div>
                <div class="school-details">
                  <span v-if="school.level" class="detail-badge level">{{ school.level }}</span>
                  <span v-if="school.type" class="detail-badge type">{{ school.type }}</span>
                  <span v-if="school.supervisor" class="detail-badge supervisor">{{ school.supervisor }}</span>
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <span class="school-code">代码: {{ school.code }}</span>
              <div class="card-actions">
                <button @click="edit(school)" class="btn-edit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  编辑
                </button>
                <button @click="remove(school)" class="btn-delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页器 -->
        <div class="pagination">
          <button @click="prev" :disabled="page === 0" class="page-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            上一页
          </button>
          <div class="page-info">
            <span class="page-number">第 {{ page + 1 }} 页</span>
            <span class="page-size">每页 {{ size }} 条</span>
          </div>
          <button @click="next" :disabled="items.length < size" class="page-btn">
            下一页
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="showEdit" class="modal-overlay" @click="closeEdit">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            编辑学校信息
          </h3>
          <button class="close-btn" @click="closeEdit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              学校名称
            </label>
            <input v-model="editModel.name" class="form-input" placeholder="请输入学校名称" />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              城市代码
            </label>
            <input v-model="editModel.city_code" class="form-input" placeholder="请输入城市代码" />
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              学校代码
            </label>
            <input v-model="editModel.code" class="form-input" placeholder="学校代码" disabled />
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeEdit" class="btn-cancel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            取消
          </button>
          <button @click="saveEdit" class="btn-confirm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import type { School } from '@/types/api'

const items = ref<School[]>([])
const loading = ref(false)
const page = ref(0)
const size = ref(20)
const q = ref('')
const showEdit = ref(false)
const editModel = ref<any>({})
const fileInput = ref<HTMLInputElement | null>(null)

// 统计数据
const totalSchools = computed(() => items.value.length)
const currentPageCount = computed(() => items.value.length)

// 搜索学校
function searchSchools() {
  page.value = 0
  fetchPage()
}

// 清除搜索
function clearSearch() {
  q.value = ''
  searchSchools()
}

async function fetchPage() {
  loading.value = true
  try {
    const res: any = await api.location.adminPageSchools(page.value, size.value, q.value || undefined)
    if (res && res.code === '200') {
      const dat = res.data
      if (Array.isArray(dat)) {
        items.value = dat
      } else if (dat && Array.isArray(dat.content)) {
        items.value = dat.content
      } else {
        items.value = []
      }
    } else {
      items.value = []
      ElMessage.warning('获取学校列表失败')
    }
  } catch (error) {
    console.error('获取学校列表失败:', error)
    ElMessage.error('获取学校列表失败')
    items.value = []
  } finally {
    loading.value = false
  }
}

function prev() {
  if (page.value > 0) {
    page.value--
    fetchPage()
  }
}

function next() {
  page.value++
  fetchPage()
}

function edit(s: School) {
  editModel.value = { ...s }
  showEdit.value = true
}

function closeEdit() {
  showEdit.value = false
  editModel.value = {}
}

async function saveEdit() {
  if (!editModel.value.name || !editModel.value.name.trim()) {
    ElMessage.warning('请输入学校名称')
    return
  }
  
  try {
    await api.location.adminUpdateSchool(editModel.value.code, editModel.value)
    ElMessage.success('保存成功')
    closeEdit()
    fetchPage()
  } catch (e) {
    console.error('保存失败:', e)
    ElMessage.error('保存失败')
  }
}

async function remove(s: School) {
  try {
    await api.location.adminDeleteSchool(s.code)
    ElMessage.success('删除成功')
    fetchPage()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

async function handleImportFile(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  
  const f = target.files[0]
  const fd = new FormData()
  fd.append('file', f)
  
  try {
    const res: any = await api.location.adminImportSchools(fd)
    if (res && res.code === '200') {
      const successCount = res.data?.success || 0
      ElMessage.success(`导入完成: ${successCount} 条`)
      fetchPage()
    } else {
      ElMessage.error('导入失败')
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  }
  
  // 清空文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

onMounted(async () => {
  await fetchPage()
})
</script>

<style scoped>
/* 页面容器 */
.admin-schools {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 100px 24px 40px;
}

/* 页面头部 */
.page-header {
  max-width: 1400px;
  margin: 0 auto 32px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(79, 70, 229, 0.3);
  color: white;
}

.header-content {
  margin-bottom: 32px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.header-icon {
  width: 48px;
  height: 48px;
  stroke-width: 2;
}

.page-header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.95;
  padding-left: 64px;
}

/* 统计卡片 */
.stats-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.95rem;
  opacity: 0.9;
}

/* 工具栏 */
.toolbar {
  max-width: 1400px;
  margin: 0 auto 24px;
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* 搜索区域 */
.search-section {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 300px;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 48px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.clear-btn {
  position: absolute;
  right: 12px;
  width: 24px;
  height: 24px;
  border: none;
  background: #e5e7eb;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #d1d5db;
}

.clear-btn svg {
  width: 14px;
  height: 14px;
  stroke-width: 2;
  color: #6b7280;
}

.btn-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

.btn-search svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

/* 操作区域 */
.action-section {
  display: flex;
  gap: 12px;
}

.btn-import,
.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  white-space: nowrap;
}

.btn-import {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-import:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-refresh {
  background: #f3f4f6;
  color: #374151;
}

.btn-refresh:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-import svg,
.btn-refresh svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

/* 加载状态 */
.loading-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 24px;
  text-align: center;
  color: #6b7280;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 内容区域 */
.content-area {
  max-width: 1400px;
  margin: 0 auto;
}

/* 空状态 */
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 80px 40px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  color: #111827;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
}

/* 学校网格 */
.schools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* 学校卡片 */
.school-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.school-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  padding: 24px;
  display: flex;
  gap: 16px;
  flex: 1;
}

.school-icon {
  font-size: 2.5rem;
  line-height: 1;
  flex-shrink: 0;
}

.school-info {
  flex: 1;
  min-width: 0;
}

.school-name {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  word-wrap: break-word;
}

.school-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-item svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  flex-shrink: 0;
}

.school-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.detail-badge.level {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.detail-badge.type {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.detail-badge.supervisor {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.card-footer {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.school-code {
  font-size: 0.875rem;
  color: #6b7280;
  font-family: 'Courier New', monospace;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #eff6ff;
  color: #2563eb;
}

.btn-edit:hover {
  background: #dbeafe;
}

.btn-delete {
  background: #fef2f2;
  color: #dc2626;
}

.btn-delete:hover {
  background: #fee2e2;
}

.btn-edit svg,
.btn-delete svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* 分页器 */
.pagination {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

.page-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.page-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.page-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.page-number {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.page-size {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 编辑弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 560px;
  max-width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 24px 24px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header svg {
  width: 24px;
  height: 24px;
  color: #4f46e5;
  stroke-width: 2;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
}

.close-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 0.95rem;
}

.form-label svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  color: #6b7280;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.modal-footer {
  padding: 20px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-confirm {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

.btn-cancel svg,
.btn-confirm svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .schools-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .admin-schools {
    padding: 80px 16px 24px;
  }

  .page-header {
    padding: 24px;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }

  .header-subtitle {
    padding-left: 0;
    font-size: 0.95rem;
  }

  .stats-card {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-section {
    flex-direction: column;
    min-width: auto;
  }

  .action-section {
    flex-direction: column;
  }

  .btn-import,
  .btn-refresh,
  .btn-search {
    width: 100%;
    justify-content: center;
  }

  .schools-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
  }

  .page-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-card {
    width: 95%;
  }
}
</style>


