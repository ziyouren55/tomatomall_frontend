<template>
  <div class="admin-school-verifications">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
          <h1>🎓 学校认证审核</h1>
        </div>
        <p class="header-subtitle">审核学生提交的学校认证申请</p>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <div class="stat-value">{{ pendingCount }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
        <div class="stat-card approved">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ approvedCount }}</div>
            <div class="stat-label">已通过</div>
          </div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <div class="stat-value">{{ rejectedCount }}</div>
            <div class="stat-label">已驳回</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 过滤和操作栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">
          <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          筛选状态
        </label>
        <select v-model="filterStatus" @change="fetchList" class="select-filter">
          <option value="">全部状态</option>
          <option value="PENDING">⏳ 待审核</option>
          <option value="VERIFIED">✅ 已通过</option>
          <option value="REJECTED">❌ 已驳回</option>
        </select>
      </div>
      
      <div class="action-buttons">
        <button class="btn-secondary" @click="fetchList">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          刷新
        </button>
        <button class="btn-primary" @click="goToSchoolManager">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
          学校管理
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
        <div class="empty-icon">📋</div>
        <h3>暂无认证记录</h3>
        <p>当前筛选条件下没有找到任何认证申请</p>
      </div>

      <!-- 认证列表 -->
      <div v-else class="verification-list">
        <div v-for="item in items" :key="item.id" class="verification-card" :class="getStatusClass(item.status)">
          <!-- 状态标签 -->
          <div class="status-badge" :class="getStatusClass(item.status)">
            {{ getStatusText(item.status) }}
          </div>

          <div class="card-content">
            <!-- 左侧：证件图片 -->
            <div class="certificate-section">
              <div class="certificate-preview" v-if="item.certificateUrl" @click="openImage(item.certificateUrl)">
                <img :src="item.certificateUrl" alt="学生证件" />
                <div class="preview-overlay">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <span>点击查看大图</span>
                </div>
              </div>
              <div v-else class="no-certificate">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>无证件图片</span>
              </div>
            </div>

            <!-- 中间：认证信息 -->
            <div class="info-section">
              <div class="school-name">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                {{ item.schoolName }}
              </div>
              
              <div class="info-row">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="info-label">用户ID:</span>
                <span class="info-value">{{ item.userId }}</span>
              </div>

              <div class="info-row">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span class="info-label">提交时间:</span>
                <span class="info-value">{{ formatDate(item.submittedAt) }}</span>
              </div>

              <div v-if="item.verifiedAt" class="info-row">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="info-label">审核时间:</span>
                <span class="info-value">{{ formatDate(item.verifiedAt) }}</span>
              </div>

              <div v-if="item.rejectedReason" class="reject-reason">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <span class="info-label">驳回原因:</span>
                  <p class="reason-text">{{ item.rejectedReason }}</p>
                </div>
              </div>
            </div>

            <!-- 右侧：操作按钮 -->
            <div class="actions-section">
              <button v-if="item.status === 'PENDING'" class="btn-approve" @click="approve(item.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                通过
              </button>
              <button v-if="item.status === 'PENDING'" class="btn-reject" @click="openRejectModal(item)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                驳回
              </button>
              <div v-else class="status-indicator">
                <svg v-if="item.status === 'VERIFIED'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                {{ getStatusText(item.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 驳回原因弹窗 -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            驳回认证申请
          </h3>
          <button class="close-btn" @click="closeRejectModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <label class="input-label">请输入驳回原因（必填）</label>
          <textarea 
            v-model="rejectReason" 
            rows="5" 
            placeholder="请详细说明驳回的原因，以便学生了解并重新提交..."
            class="reject-textarea"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button @click="closeRejectModal" class="btn-cancel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            取消
          </button>
          <button @click="rejectConfirm" class="btn-confirm" :disabled="!rejectReason.trim()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            确认驳回
          </button>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
      <div class="image-modal-card" @click.stop>
        <div class="image-modal-header">
          <h3>证件预览</h3>
          <button class="close-btn" @click="closeImageModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="image-modal-body">
          <img :src="modalImageUrl" alt="证件大图" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import type { SchoolVerification } from '@/types/api'
import { useRouter } from 'vue-router'

const items = ref<SchoolVerification[]>([])
const loading = ref(false)
const filterStatus = ref<string>('')
const showRejectModal = ref(false)
const rejectReason = ref('')
const rejectTargetId = ref<number | null>(null)
const showImageModal = ref(false)
const modalImageUrl = ref<string>('')

// 统计数据
const pendingCount = computed(() => items.value.filter(item => item.status === 'PENDING').length)
const approvedCount = computed(() => items.value.filter(item => item.status === 'VERIFIED').length)
const rejectedCount = computed(() => items.value.filter(item => item.status === 'REJECTED').length)

// 获取状态文本
function getStatusText(status: string | undefined): string {
  const statusMap: Record<string, string> = {
    'PENDING': '待审核',
    'VERIFIED': '已通过',
    'REJECTED': '已驳回',
    'UNVERIFIED': '未认证'
  }
  return statusMap[status || ''] || status || '未知'
}

// 获取状态样式类
function getStatusClass(status: string | undefined): string {
  const classMap: Record<string, string> = {
    'PENDING': 'status-pending',
    'VERIFIED': 'status-verified',
    'REJECTED': 'status-rejected'
  }
  return classMap[status || ''] || ''
}

// 格式化日期
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function fetchList() {
  loading.value = true
  try {
    const res = await api.user.adminListSchoolVerifications(filterStatus.value || undefined)
    if (res && res.code === '200') {
      items.value = res.data || []
    } else {
      items.value = []
      ElMessage.warning('获取认证列表失败')
    }
  } catch (error) {
    console.error('获取认证列表失败:', error)
    ElMessage.error('获取认证列表失败')
    items.value = []
  } finally {
    loading.value = false
  }
}

async function approve(id: number | undefined) {
  if (!id) return
  
  try {
    await api.user.adminApproveSchoolVerification(id)
    ElMessage.success('认证已通过')
    await fetchList()
  } catch (error) {
    console.error('审核通过失败:', error)
    ElMessage.error('审核通过失败')
  }
}

function openRejectModal(item: SchoolVerification) {
  rejectTargetId.value = item.id || null
  rejectReason.value = item.rejectedReason || ''
  showRejectModal.value = true
}

function closeRejectModal() {
  showRejectModal.value = false
  rejectTargetId.value = null
  rejectReason.value = ''
}

async function rejectConfirm() {
  if (!rejectTargetId.value) return
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  
  try {
    await api.user.adminRejectSchoolVerification(rejectTargetId.value, rejectReason.value)
    ElMessage.success('认证已驳回')
    closeRejectModal()
    await fetchList()
  } catch (error) {
    console.error('驳回失败:', error)
    ElMessage.error('驳回失败')
  }
}

function openImage(url: string | undefined) {
  if (!url) return
  modalImageUrl.value = url
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
  modalImageUrl.value = ''
}

const router = useRouter()
function goToSchoolManager() {
  router.push('/admin/schools')
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
/* 页面容器 */
.admin-school-verifications {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 100px 24px 40px;
}

/* 页面头部 */
.page-header {
  max-width: 1400px;
  margin: 0 auto 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
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
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
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

.stat-card:hover {
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

/* 过滤栏 */
.filter-bar {
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

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 0.95rem;
}

.filter-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.select-filter {
  padding: 10px 16px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  font-size: 0.95rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
}

.select-filter:hover {
  border-color: #667eea;
  background: white;
}

.select-filter:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-secondary,
.btn-primary {
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

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary svg,
.btn-primary svg {
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
  border-top-color: #667eea;
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

/* 认证列表 */
.verification-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 认证卡片 */
.verification-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.verification-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 状态标签 */
.status-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 1;
}

.status-badge.status-pending {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.status-badge.status-verified {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.status-badge.status-rejected {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

/* 卡片内容 */
.card-content {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 24px;
  padding: 24px;
  align-items: start;
}

/* 证件区域 */
.certificate-section {
  position: relative;
}

.certificate-preview {
  width: 200px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.certificate-preview:hover {
  border-color: #667eea;
  transform: scale(1.05);
}

.certificate-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.certificate-preview:hover .preview-overlay {
  opacity: 1;
}

.preview-overlay svg {
  width: 32px;
  height: 32px;
  stroke-width: 2;
}

.preview-overlay span {
  font-size: 0.85rem;
}

.no-certificate {
  width: 200px;
  height: 140px;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9ca3af;
  background: #f9fafb;
}

.no-certificate svg {
  width: 40px;
  height: 40px;
  stroke-width: 1.5;
}

/* 信息区域 */
.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.school-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.school-name .info-icon {
  width: 28px;
  height: 28px;
  color: #667eea;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
}

.info-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  color: #6b7280;
  flex-shrink: 0;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  color: #111827;
}

.reject-reason {
  display: flex;
  gap: 10px;
  padding: 16px;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
}

.reject-reason .info-icon {
  color: #ef4444;
  margin-top: 2px;
}

.reason-text {
  margin: 8px 0 0 0;
  color: #991b1b;
  line-height: 1.6;
}

/* 操作区域 */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 120px;
}

.btn-approve,
.btn-reject {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-approve {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-approve:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-reject {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-reject:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.btn-approve svg,
.btn-reject svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  background: #f3f4f6;
  color: #6b7280;
}

.status-indicator svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* 驳回弹窗 */
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
  color: #ef4444;
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

.input-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: #374151;
  font-size: 0.95rem;
}

.reject-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
}

.reject-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.reject-textarea::placeholder {
  color: #9ca3af;
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
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel svg,
.btn-confirm svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* 图片预览弹窗 */
.image-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.image-modal-card {
  background: white;
  border-radius: 20px;
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

.image-modal-header {
  padding: 20px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.image-modal-body {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}

.image-modal-body img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .card-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .certificate-section {
    display: flex;
    justify-content: center;
  }

  .actions-section {
    flex-direction: row;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .admin-school-verifications {
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

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .school-name {
    font-size: 1.25rem;
  }

  .modal-card {
    width: 95%;
  }
}
</style>


