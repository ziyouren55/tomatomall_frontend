<template>
  <div class="school-verification-form">
    <!-- 成功提交状态 -->
    <div v-if="submitted" class="submitted-state">
      <div class="success-icon">✓</div>
      <h3>认证申请已提交</h3>
      <p class="status-text">当前状态：<span class="status-badge">{{ getStatusText(status) }}</span></p>
      <p class="hint-text">我们将在1-3个工作日内完成审核，请耐心等待</p>
      <el-button type="primary" @click="$emit('submitted')" size="large">
        关闭
      </el-button>
    </div>

    <!-- 认证表单 -->
    <div v-else class="form-container">
      <div class="form-header">
        <h2>🎓 学生认证</h2>
        <p>完成认证后可享受学生专属优惠</p>
      </div>

      <el-form :model="form" label-position="top" class="verification-form">
        <!-- 地区选择 -->
        <div class="location-section">
          <h3 class="section-title">📍 学校位置</h3>
          
          <el-form-item label="省/直辖市" required>
            <el-select 
              v-model="provinceCode" 
              @change="onProvinceChange"
              placeholder="请选择省/直辖市"
              size="large"
              style="width: 100%"
            >
              <el-option 
                v-for="p in provinces" 
                :key="p.code" 
                :value="p.code"
                :label="p.name"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="城市" required>
            <el-select 
              v-model="cityCode" 
              @change="onCityChange" 
              :disabled="!provinceCode"
              placeholder="请先选择省份"
              size="large"
              style="width: 100%"
            >
              <el-option 
                v-for="c in cities" 
                :key="c.code" 
                :value="c.code"
                :label="c.name"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 学校选择 -->
        <div class="school-section">
          <h3 class="section-title">🏫 学校信息</h3>
          
          <el-form-item label="选择学校" required>
            <el-select
              v-model="selectedSchoolCode"
              :placeholder="getSchoolPlaceholder()"
              size="large"
              style="width: 100%"
              filterable
              :disabled="!canSearchSchool"
              :loading="loadingSchools"
              @change="handleSchoolChange"
            >
              <el-option
                v-for="school in availableSchools"
                :key="school.code"
                :value="school.code"
                :label="school.name"
              >
                <div class="school-option-item">
                  <span class="school-option-name">{{ school.name }}</span>
                  <span class="school-option-tags">
                    <el-tag size="small" type="info">{{ school.level }}</el-tag>
                    <el-tag size="small" type="success">{{ school.type }}</el-tag>
                  </span>
                </div>
              </el-option>
            </el-select>
            <p v-if="!canSearchSchool" class="hint-message">
              <el-icon><InfoFilled /></el-icon>
              请先选择省份和城市，系统将自动加载该地区的学校列表
            </p>
            <p v-else-if="availableSchools.length > 0" class="hint-message success">
              <el-icon><CircleCheck /></el-icon>
              已加载 {{ availableSchools.length }} 所学校，可输入关键字快速筛选
            </p>
          </el-form-item>
        </div>

        <!-- 学生信息 -->
        <div class="student-section">
          <h3 class="section-title">👤 学生信息</h3>
          
          <el-form-item label="学号" required>
            <el-input 
              v-model="form.studentId" 
              placeholder="请输入学号"
              size="large"
            >
              <template #prefix>
                <el-icon><Postcard /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <!-- 证件上传 -->
        <div class="certificate-section">
          <h3 class="section-title">📄 证件上传</h3>
          <p class="upload-hint">请上传学生证或在校证明（支持JPG、PNG格式，不超过5MB）</p>
          
          <el-form-item required>
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              @change="handleFileSelect" 
              style="display:none" 
            />
            
            <div v-if="!form.certificateUrl" class="upload-area" @click="triggerFile">
              <el-icon class="upload-icon" :size="48"><Upload /></el-icon>
              <p class="upload-text">点击上传证件图片</p>
              <p class="upload-subtext">或拖拽图片到此处</p>
            </div>

            <div v-else class="preview-container">
              <img :src="form.certificateUrl" alt="证件预览" class="preview-image" />
              <div class="preview-actions">
                <el-button type="primary" @click="triggerFile" size="small">
                  <el-icon><RefreshRight /></el-icon>
                  重新上传
                </el-button>
              </div>
            </div>

            <div v-if="uploading" class="uploading-state">
              <el-progress :percentage="uploadProgress" :stroke-width="8" />
              <p>上传中...</p>
            </div>
          </el-form-item>
        </div>

        <!-- 错误提示 -->
        <el-alert 
          v-if="error" 
          :title="error" 
          type="error" 
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button 
            type="primary" 
            @click="handleSubmit" 
            :loading="loading"
            size="large"
            style="width: 200px"
          >
            {{ loading ? '提交中...' : '提交认证申请' }}
          </el-button>
          <el-button 
            @click="$emit('cancel')" 
            size="large"
          >
            取消
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { Search, Postcard, Upload, RefreshRight, CircleCheck, InfoFilled } from '@element-plus/icons-vue'
import api from '@/api'
import type { SchoolVerificationRequest, Province, City, School } from '@/types/api.ts'

const emit = defineEmits(['submitted','cancel'])

const form = ref<SchoolVerificationRequest>({
  schoolName: '',
  studentId: '',
  certificateUrl: ''
})

// location selectors
const provinces = ref<Province[]>([])
const cities = ref<City[]>([])
const provinceCode = ref<string>('')
const cityCode = ref<string>('')
const availableSchools = ref<School[]>([])
const selectedSchoolCode = ref<string>('')
const loadingSchools = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const submitted = ref(false)
const status = ref('')

// 计算属性：是否可以选择学校（必须先选择省份和城市）
const canSearchSchool = computed(() => {
  return provinceCode.value !== '' && cityCode.value !== ''
})

// 动态提示文本
function getSchoolPlaceholder() {
  if (!provinceCode.value) {
    return '请先选择省份'
  }
  if (!cityCode.value) {
    return '请先选择城市'
  }
  if (loadingSchools.value) {
    return '正在加载学校列表...'
  }
  if (availableSchools.value.length === 0) {
    return '该地区暂无学校数据'
  }
  return '请选择学校（可输入关键字筛选）'
}

// 监听城市变化，自动加载学校列表
watch(cityCode, async (newCityCode) => {
  if (newCityCode) {
    await loadSchools(newCityCode)
  } else {
    availableSchools.value = []
    selectedSchoolCode.value = ''
  }
})

onMounted(async () => {
  await loadProvinces()
})

async function loadProvinces() {
  const res = await api.location.getProvinces()
  if (res && res.code === '200') provinces.value = res.data || []
}

async function onProvinceChange() {
  cityCode.value = ''
  availableSchools.value = []
  selectedSchoolCode.value = ''
  if (!provinceCode.value) { cities.value = []; return }
  const res = await api.location.getCities(provinceCode.value)
  if (res && res.code === '200') cities.value = res.data || []
}

async function onCityChange() {
  availableSchools.value = []
  selectedSchoolCode.value = ''
}

// 加载指定城市的所有学校
async function loadSchools(cityCode: string) {
  if (!cityCode) return
  
  loadingSchools.value = true
  try {
    // 使用空字符串作为搜索关键字，返回该城市所有学校
    // 设置较大的limit以获取所有学校
    const res = await api.location.getSchools(cityCode, '', 1000)
    
    if (res && res.code === '200' && res.data) {
      availableSchools.value = res.data
      console.log(`已加载 ${res.data.length} 所学校`)
    } else {
      availableSchools.value = []
      console.warn('未找到学校数据')
    }
  } catch (e) {
    console.error('加载学校列表失败:', e)
    availableSchools.value = []
  } finally {
    loadingSchools.value = false
  }
}

// 处理学校选择变化
function handleSchoolChange(schoolCode: string) {
  const school = availableSchools.value.find(s => s.code === schoolCode)
  if (school) {
    form.value.schoolName = school.name
    console.log('已选择学校:', school.name)
  }
}

function triggerFile() {
  fileInput.value?.click()
}

async function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  const file = target.files[0]
  if (!file.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = '图片大小不能超过5MB'
    return
  }
  uploading.value = true
  uploadProgress.value = 0
  
  // 模拟上传进度
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += 10
    }
  }, 200)
  
  try {
    const res = await api.image.uploadImage(file, 'certificate')
    if (res.code === '200' && res.data) {
      uploadProgress.value = 100
      form.value.certificateUrl = res.data
      error.value = ''
    } else {
      error.value = res.msg || '上传失败'
    }
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '上传失败'
  } finally {
    clearInterval(progressInterval)
    setTimeout(() => {
      uploading.value = false
      uploadProgress.value = 0
    }, 500)
  }
}

async function handleSubmit() {
  // 使用选中的学校名称
  if (!form.value.schoolName) {
    error.value = '请选择学校'
    return
  }
  if (!(form.value.studentId ?? '').trim()) {
    error.value = '请输入学号'
    return
  }
  if (!form.value.certificateUrl) {
    error.value = '请上传证件图片'
    return
  }
  loading.value = true
  try {
    const payload = {
      schoolName: form.value.schoolName,
      studentId: form.value.studentId ?? '',
      certificateUrl: form.value.certificateUrl
    }
    const res = await api.user.submitSchoolVerification(payload)
    if (res.code === '200') {
      submitted.value = true
      status.value = res.data?.status || 'PENDING'
      emit('submitted')
    } else {
      error.value = res.msg || '提交失败'
    }
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '提交失败'
  } finally {
    loading.value = false
  }
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': '待审核',
    'APPROVED': '已通过',
    'REJECTED': '已拒绝'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.school-verification-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

/* 成功提交状态 */
.submitted-state {
  text-align: center;
  padding: 60px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.success-icon {
  width: 80px;
  height: 80px;
  line-height: 80px;
  font-size: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin: 0 auto 24px;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.submitted-state h3 {
  font-size: 28px;
  margin-bottom: 16px;
  font-weight: 600;
}

.status-text {
  font-size: 16px;
  margin-bottom: 12px;
}

.status-badge {
  display: inline-block;
  padding: 4px 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-weight: 500;
  margin-left: 8px;
}

.hint-text {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 32px;
}

/* 表单容器 */
.form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  text-align: center;
}

.form-header h2 {
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.form-header p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.verification-form {
  padding: 32px;
}

/* 分区标题 */
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.location-section,
.school-section,
.student-section,
.certificate-section {
  margin-bottom: 32px;
}

/* 学校搜索建议样式 */
.school-suggestion-item {
  padding: 8px 0;
}

.school-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.school-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.school-level,
.school-type,
.school-supervisor {
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.selected-school-display {
  margin-top: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border-left: 4px solid #667eea;
  display: flex;
  align-items: center;
  gap: 8px;
}

.check-icon {
  color: #22c55e;
  font-size: 20px;
}

.selected-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* 学校选项样式 */
.school-option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.school-option-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.school-option-tags {
  display: flex;
  gap: 6px;
}

/* 提示信息 */
.hint-message {
  margin-top: 8px;
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hint-message.success {
  color: #67c23a;
}

.hint-message .el-icon {
  font-size: 14px;
}

/* 上传区域 */
.upload-hint {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f5f7ff;
}

.upload-icon {
  color: #999;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.upload-subtext {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.uploading-state {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7ff;
  border-radius: 8px;
}

.uploading-state p {
  text-align: center;
  margin: 12px 0 0 0;
  color: #667eea;
  font-size: 14px;
}

.preview-container {
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: block;
}

.preview-actions {
  margin-top: 16px;
  text-align: center;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

:deep(.el-input__inner),
:deep(.el-select .el-input__inner) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .school-verification-form {
    padding: 16px;
  }

  .form-header {
    padding: 24px 16px;
  }

  .form-header h2 {
    font-size: 24px;
  }

  .verification-form {
    padding: 24px 16px;
  }

  .section-title {
    font-size: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions :deep(.el-button) {
    width: 100%;
  }
}
</style>


