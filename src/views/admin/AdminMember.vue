<template>
  <div class="member-level-management">
    <div class="header">
      <h2>会员等级管理</h2>
      <button @click="showCreateModal = true" class="btn btn-primary">
        新增等级
      </button>
    </div>

    <!-- 会员等级列表 -->
    <div class="level-list">
      <div class="table-header">
        <div class="checkbox-col">
          <input 
            type="checkbox" 
            :checked="allSelected" 
            @change="selectAll"
          />
        </div>
        <div class="col">等级</div>
        <div class="col">等级名称</div>
        <div class="col">所需积分</div>
        <div class="col">折扣率</div>
        <div class="col">描述</div>
        <div class="col">状态</div>
        <div class="col">操作</div>
      </div>

      <div 
        v-for="level in memberLevels" 
        :key="level.id"
        class="table-row"
        :class="{ 'selected': selectedLevels.includes(level.id) }"
      >
        <div class="checkbox-col">
          <input 
            type="checkbox" 
            :checked="selectedLevels.includes(level.id)"
            @change="toggleSelect(level.id)"
          />
        </div>
        <div class="col">{{ level.memberLevel }}</div>
        <div class="col">{{ level.levelName }}</div>
        <div class="col">{{ level.pointsRequired }}</div>
        <div class="col">{{ (level.discountRate * 100).toFixed(1) }}%</div>
        <div class="col">{{ level.description || '-' }}</div>
        <div class="col">
          <span :class="level.isActive ? 'status-active' : 'status-inactive'">
            {{ level.isActive ? '启用' : '禁用' }}
          </span>
        </div>
        <div class="col">
          <button @click="editLevel(level)" class="btn btn-sm btn-outline">
            编辑
          </button>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-actions" v-if="selectedLevels.length > 0">
      <span class="selected-count">已选择 {{ selectedLevels.length }} 项</span>
      <button 
        @click="deleteSelected" 
        class="btn btn-danger"
        :disabled="selectedLevels.length === 0"
      >
        删除选中
      </button>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑会员等级' : '新增会员等级' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="submitForm" class="modal-body">
          <div class="form-group">
            <label>等级 *</label>
            <input 
              type="number" 
              v-model="formData.memberLevel" 
              required 
              min="1"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label>等级名称 *</label>
            <input 
              type="default" 
              v-model="formData.levelName" 
              required 
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label>所需积分 *</label>
            <input 
              type="number" 
              v-model="formData.pointsRequired" 
              required 
              min="0"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label>折扣率 *</label>
            <input 
              type="number" 
              v-model="formData.discountRate" 
              required 
              min="0" 
              max="1" 
              step="0.01"
              class="form-control"
            />
            <small class="form-text">请输入0-1之间的小数，如0.9表示9折</small>
          </div>
          
          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="formData.description" 
              rows="3"
              class="form-control"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="formData.isActive"
              />
              启用状态
            </label>
          </div>
        </form>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">取消</button>
          <button @click="submitForm" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : (isEditing ? '更新' : '创建') }}
          </button>
        </div>
      </div>
    </div>

    <!-- (forum creation UI removed from this page; moved to product manager) -->

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/api'
import type { MemberLevel } from '@/api/modules/member'

// 状态管理
const memberLevels = ref<MemberLevel[]>([])
const selectedLevels = ref<number[]>([])
const loading = ref<boolean>(false)
const submitting = ref<boolean>(false)
const showCreateModal = ref<boolean>(false)
const showEditModal = ref<boolean>(false)
const editingLevel = ref<MemberLevel | null>(null)

// 表单数据
const formData = reactive({
  memberLevel: '',
  levelName: '',
  pointsRequired: '',
  discountRate: '',
  description: '',
  isActive: true
})

// 计算属性
const allSelected = computed(() => {
  return memberLevels.value.length > 0 && selectedLevels.value.length === memberLevels.value.length
})

const isEditing = computed(() => {
  return editingLevel.value !== null
})

// 获取会员等级列表
const fetchMemberLevels = async () => {
  loading.value = true
  try {
    const response = await api.member.getAllLevels()
    memberLevels.value = response.data || []
  } catch (error: unknown) {
    console.error('获取会员等级失败:', error)
    const err = error as Error
    alert('获取会员等级失败: ' + err.message)
    memberLevels.value = []
  } finally {
    loading.value = false
  }
}

// 选择操作
const toggleSelect = (levelId: number) => {
  const index = selectedLevels.value.indexOf(levelId)
  if (index > -1) {
    selectedLevels.value.splice(index, 1)
  } else {
    selectedLevels.value.push(levelId)
  }
}

const selectAll = () => {
  if (allSelected.value) {
    selectedLevels.value = []
  } else {
    selectedLevels.value = memberLevels.value.map(level => level.id)
  }
}

// 编辑会员等级
const editLevel = (level: MemberLevel) => {
  editingLevel.value = level
  Object.assign(formData, {
    memberLevel: level.memberLevel,
    levelName: level.levelName,
    pointsRequired: level.pointsRequired,
    discountRate: level.discountRate,
    description: level.description || '',
    isActive: level.isActive
  })
  showEditModal.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    memberLevel: '',
    levelName: '',
    pointsRequired: '',
    discountRate: '',
    description: '',
    isActive: true
  })
  editingLevel.value = null
}

// 关闭弹窗
const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetForm()
}

// 提交表单
const submitForm = async () => {
  submitting.value = true
  try {
    const payload = {
      memberLevel: parseInt(formData.memberLevel),
      levelName: formData.levelName,
      pointsRequired: parseInt(formData.pointsRequired),
      discountRate: parseFloat(formData.discountRate),
      description: formData.description,
      isActive: formData.isActive
    }

    if (isEditing.value && editingLevel.value) {
      await api.member.updateLevel(editingLevel.value.id, payload)
      alert('更新成功！')
    } else {
      await api.member.createLevel(payload)
      alert('创建成功！')
    }

    closeModal()
    await fetchMemberLevels()
  } catch (error: unknown) {
    console.error('操作失败:', error)
    const err = error as Error
    alert('操作失败: ' + err.message)
  } finally {
    submitting.value = false
  }
}

// 删除选中的等级
const deleteSelected = async () => {
  if (selectedLevels.value.length === 0) return

  const confirmDelete = confirm(`确定要删除选中的 ${selectedLevels.value.length} 个会员等级吗？`)
  if (!confirmDelete) return

  try {
    for (const levelId of selectedLevels.value) {
      await api.member.deleteLevel(levelId)
    }
    
    alert('删除成功！')
    selectedLevels.value = []
    await fetchMemberLevels()
  } catch (error: unknown) {
    console.error('删除失败:', error)
    const err = error as Error
    alert('删除失败: ' + err.message)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchMemberLevels()
})
 
</script>

<style scoped>
.member-level-management {
  padding: 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-danger:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover {
  background-color: #007bff;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

/* 表格样式 */
.level-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 80px 150px 120px 100px 200px 80px 80px;
  background-color: #f8f9fa;
  padding: 12px;
  font-weight: bold;
  border-bottom: 1px solid #dee2e6;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 80px 150px 120px 100px 200px 80px 80px;
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row.selected {
  background-color: #e3f2fd;
}

.checkbox-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.col {
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.status-active {
  color: #28a745;
  font-weight: bold;
}

.status-inactive {
  color: #dc3545;
  font-weight: bold;
}

/* 底部操作栏 */
.footer-actions {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  font-size: 14px;
  color: #666;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
}

/* 加载状态 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>