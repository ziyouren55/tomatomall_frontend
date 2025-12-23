<template>
  <div class="admin-school-verifications">
  <div class="header">
      <h2>学校认证审核</h2>
      <div class="filters">
        <select v-model="filterStatus" @change="fetchList" class="select-filter">
          <option value="">全部</option>
          <option value="PENDING">待审核</option>
          <option value="VERIFIED">已通过</option>
          <option value="REJECTED">已驳回</option>
        </select>
        <button class="refresh-btn" @click="fetchList">刷新</button>
        <button class="refresh-btn" @click="goToSchoolManager">学校管理</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else>
      <div v-if="items.length === 0" class="empty">暂无记录</div>
      <div v-else class="list">
        <div v-for="item in items" :key="item.id" class="row">
          <div class="left">
            <div class="thumb" v-if="item.certificateUrl">
              <img :src="item.certificateUrl" alt="证件缩略图" @click="openImage(item.certificateUrl)" />
            </div>
            <div class="meta">
              <div class="title"><strong>{{ item.schoolName }}</strong></div>
              <div class="sub">用户ID: {{ item.userId }} · 状态: <span class="status">{{ item.status }}</span></div>
              <div class="time">提交时间: {{ item.submittedAt || '-' }}</div>
              <div v-if="item.rejectedReason" class="rejected">驳回原因: {{ item.rejectedReason }}</div>
            </div>
          </div>
          <div class="actions">
            <button class="btn-approve" v-if="item.status === 'PENDING'" @click="approve(item.id)">通过</button>
            <button class="btn-reject" v-if="item.status === 'PENDING'" @click="openRejectModal(item)">驳回</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 驳回原因弹窗 -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal" @click.stop>
        <h3>输入驳回原因</h3>
        <textarea v-model="rejectReason" rows="4"></textarea>
        <div class="footer">
          <button @click="closeRejectModal" class="btn-cancel">取消</button>
          <button @click="rejectConfirm" class="btn-confirm">确认驳回</button>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
      <div class="image-modal" @click.stop>
        <img :src="modalImageUrl" alt="证件大图" />
        <button class="close-img" @click="closeImageModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

async function fetchList() {
  loading.value = true
  try {
    const res = await api.user.adminListSchoolVerifications(filterStatus.value || undefined)
    if (res && res.code === '200') {
      items.value = res.data || []
    } else {
      items.value = []
    }
  } finally {
    loading.value = false
  }
}

async function approve(id: number | undefined) {
  if (!id) return
  if (!confirm('确认通过该认证？')) return
  await api.user.adminApproveSchoolVerification(id)
  await fetchList()
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
  await api.user.adminRejectSchoolVerification(rejectTargetId.value, rejectReason.value)
  closeRejectModal()
  await fetchList()
}

onMounted(() => {
  fetchList()
})
const router = useRouter()
function goToSchoolManager() {
  router.push('/admin/schools')
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
</script>

<style scoped>
.admin-school-verifications { padding: 24px; background: #f6f7fb; min-height: 100vh; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:12px; }
.header h2 { margin:0; font-size:20px; color:#111827; }
.filters { display:flex; gap:8px; align-items:center; }
.select-filter { padding:6px 8px; border-radius:6px; border:1px solid #e5e7eb; background:#fff; }
.refresh-btn { padding:6px 10px; border-radius:6px; border:1px solid #e5e7eb; background:#fff; cursor:pointer; }
.loading { padding:24px; text-align:center; color:#6b7280; }
.empty { padding:24px; text-align:center; color:#9ca3af; }

.list { display:flex; flex-direction:column; gap:12px; }
.row { display:flex; justify-content:space-between; align-items:center; padding:12px; border-radius:8px; background:#fff; box-shadow:0 2px 6px rgba(15,23,42,0.04); }
.left { display:flex; gap:12px; align-items:flex-start; }
.thumb { width:96px; height:64px; flex:0 0 96px; display:flex; align-items:center; justify-content:center; }
.thumb img { width:96px; height:64px; object-fit:cover; border-radius:6px; cursor:pointer; border:1px solid #eef2f6; }
.meta { display:flex; flex-direction:column; gap:6px; }
.title { font-size:16px; font-weight:600; color:#111827; }
.sub { color:#6b7280; font-size:13px; }
.time { color:#9ca3af; font-size:12px; }
.rejected { color:#dc2626; margin-top:6px; font-size:13px; }
.status { font-weight:600; color:#374151; margin-left:6px; }

.actions { display:flex; gap:8px; align-items:center; }
.btn-approve { background:#10b981; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; }
.btn-reject { background:#ef4444; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; }
.btn-cancel { background:#f3f4f6; border:1px solid #e5e7eb; padding:8px 12px; border-radius:6px; cursor:pointer; }
.btn-confirm { background:#ef4444; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; }

.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:1500; }
.modal { background:#fff; padding:16px; border-radius:8px; width:480px; max-width:90%; box-shadow:0 8px 30px rgba(0,0,0,0.12); }
.footer { display:flex; justify-content:flex-end; gap:8px; margin-top:8px; }

.image-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:2000; }
.image-modal { max-width:90%; max-height:90%; background:transparent; display:flex; align-items:center; justify-content:center; position:relative; }
.image-modal img { max-width:100%; max-height:100%; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5); }
.close-img { position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.6); color:#fff; border:none; padding:6px 8px; border-radius:4px; cursor:pointer; }
</style>


