<template>
  <div class="verification-card">
    <div v-if="submitted" class="submitted">
      <h3 class="title">认证已提交</h3>
      <p class="muted">当前状态：<strong>{{ status }}</strong></p>
      <div class="actions">
        <button class="primary" @click="$emit('submitted')">关闭</button>
      </div>
    </div>

    <div v-else class="card-body">
      <h3 class="title">学校认证</h3>
      <p class="subtitle">请填写学校信息并上传证件，信息将用于身份核验</p>

      <div class="grid">
        <div class="form-item">
          <label>省/直辖市 <span class="required">*</span></label>
          <select v-model="provinceCode" @change="onProvinceChange">
            <option value="">请选择省/直辖市</option>
            <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
          </select>
        </div>

        <div class="form-item">
          <label>城市 <span class="required">*</span></label>
          <select v-model="cityCode" @change="onCityChange" :disabled="!provinceCode">
            <option value="">请选择城市</option>
            <option v-for="c in cities" :key="c.code" :value="c.code">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <div class="form-item full">
        <label>学校（可搜索） <span class="required">*</span></label>
        <div class="school-row">
          <input class="search-input" v-model="schoolQuery" @input="onSchoolQuery" placeholder="请输入学校关键字搜索" />
          <select v-model="selectedSchoolCode" :disabled="!cityCode">
            <option value="">请选择学校（或留空手动输入下方）</option>
            <option v-for="s in schools" :key="s.code" :value="s.code">{{ s.name }}</option>
          </select>
        </div>
        <input v-model="manualSchoolName" class="manual-input" type="text" placeholder="若未找到学校，可在此手动输入学校名称" />
      </div>

      <div class="grid">
        <div class="form-item">
          <label>学号 <span class="required">*</span></label>
          <input v-model="form.studentId" type="text" placeholder="请输入学号" />
        </div>

        <div class="form-item">
          <label>证件类型</label>
          <select v-model="form.certificateType">
            <option value="student_card">学生证</option>
            <option value="id_card">身份证</option>
          </select>
        </div>
      </div>

      <div class="form-item">
        <label>证件图片 <span class="required">*</span></label>
        <div class="upload-area" @click="triggerFile">
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display:none" />
          <div class="upload-inner">
            <div class="upload-icon">📷</div>
            <div class="upload-text">{{ uploading ? '上传中...' : '点击或拖拽上传证件图片（最多5MB）' }}</div>
          </div>
        </div>
        <div v-if="form.certificateUrl" class="preview">
          <img :src="form.certificateUrl" alt="证件" />
        </div>
      </div>

      <div class="error" v-if="error">{{ error }}</div>

      <div class="actions">
        <button class="primary" @click="handleSubmit" :disabled="loading">{{ loading ? '提交中...' : '提交认证' }}</button>
        <button class="secondary" @click="$emit('cancel')">取消</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
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
const schools = ref<School[]>([])
const provinceCode = ref<string>('')
const cityCode = ref<string>('')
const selectedSchoolCode = ref<string>('')
const schoolQuery = ref<string>('')
const manualSchoolName = ref<string>('')

const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const uploading = ref(false)
const error = ref('')
const submitted = ref(false)
const status = ref('')

// local list of provinces (code/name). Used as fallback / immediate options.
const LOCAL_PROVINCES: Province[] = [
  { code: '11', name: '北京市' },
  { code: '12', name: '天津市' },
  { code: '13', name: '河北省' },
  { code: '14', name: '山西省' },
  { code: '15', name: '内蒙古自治区' },
  { code: '21', name: '辽宁省' },
  { code: '22', name: '吉林省' },
  { code: '23', name: '黑龙江省' },
  { code: '31', name: '上海市' },
  { code: '32', name: '江苏省' },
  { code: '33', name: '浙江省' },
  { code: '34', name: '安徽省' },
  { code: '35', name: '福建省' },
  { code: '36', name: '江西省' },
  { code: '37', name: '山东省' },
  { code: '41', name: '河南省' },
  { code: '42', name: '湖北省' },
  { code: '43', name: '湖南省' },
  { code: '44', name: '广东省' },
  { code: '45', name: '广西壮族自治区' },
  { code: '46', name: '海南省' },
  { code: '50', name: '重庆市' },
  { code: '51', name: '四川省' },
  { code: '52', name: '贵州省' },
  { code: '53', name: '云南省' },
  { code: '54', name: '西藏自治区' },
  { code: '61', name: '陕西省' },
  { code: '62', name: '甘肃省' },
  { code: '63', name: '青海省' },
  { code: '64', name: '宁夏回族自治区' },
  { code: '65', name: '新疆维吾尔自治区' },
  { code: '71', name: '台湾省' },
  { code: '81', name: '香港特别行政区' },
  { code: '82', name: '澳门特别行政区' }
]

onMounted(async () => {
  // load local provinces first so user can select immediately,
  // then attempt to load from API to refresh/override if available.
  provinces.value = LOCAL_PROVINCES.slice()
  await loadProvinces()
  // 临时调试：打印 provinces（注意这是 ref，要查看 .value）
  console.log('SchoolVerificationForm provinces (debug):', provinces.value)
})

async function loadProvinces() {
  try {
    const res = await api.location.getProvinces()
    if (res && res.code === '200' && Array.isArray(res.data) && res.data.length > 0) {
      provinces.value = res.data || []
    }
  } catch (e) {
    // keep local provinces as fallback
  }
}

async function onProvinceChange() {
  cityCode.value = ''
  selectedSchoolCode.value = ''
  schools.value = []
  if (!provinceCode.value) { cities.value = []; return }
  const res = await api.location.getCities(provinceCode.value)
  if (res && res.code === '200') cities.value = res.data || []
}

async function onCityChange() {
  selectedSchoolCode.value = ''
  schools.value = []
  if (!cityCode.value) return
  await loadSchools()
}

let schoolTimer: any = null
function onSchoolQuery() {
  clearTimeout(schoolTimer)
  schoolTimer = setTimeout(loadSchools, 300)
}

async function loadSchools() {
  if (!cityCode.value) return
  const res = await api.location.getSchools(cityCode.value, schoolQuery.value || '', 50)
  if (res && res.code === '200') schools.value = res.data || []
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
  try {
    const res = await api.image.uploadImage(file, 'certificate')
    if (res.code === '200' && res.data) {
      form.value.certificateUrl = res.data
      error.value = ''
    } else {
      error.value = res.msg || '上传失败'
    }
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '上传失败'
  } finally {
    uploading.value = false
  }
}

async function handleSubmit() {
  // build schoolName: manual > selected from list
  const chosenName = (manualSchoolName.value && manualSchoolName.value.trim()) ? manualSchoolName.value.trim()
                    : (selectedSchoolCode.value ? (schools.value.find(s => s.code === selectedSchoolCode.value)?.name || '') : '')
  if (!chosenName) {
    error.value = '请选择或输入学校名称'
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
      schoolName: chosenName,
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
</script>

<style scoped>
.verification-card {
  max-width: 760px;
  margin: 0 auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(20,40,60,0.08);
  overflow: hidden;
}
.card-body {
  padding: 20px 24px;
}
.title {
  margin: 0;
  font-size: 1.25rem;
  color: #0f172a;
}
.subtitle {
  margin: 6px 0 16px;
  color: #64748b;
  font-size: 0.95rem;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.form-item { display:flex; flex-direction:column; }
.form-item.full { grid-column: 1 / -1; }
.form-item label { font-weight: 600; color:#334155; margin-bottom:6px; font-size:0.95rem; }
.form-item input[type="text"], .form-item input[type="file"], .form-item select, .form-item .search-input, .form-item .manual-input {
  padding: 10px 12px;
  border: 1px solid #e6e9ee;
  border-radius: 8px;
  background: #fbfdff;
  font-size: 0.95rem;
  outline: none;
  transition: border-color .15s ease;
}
.form-item input:focus, .form-item select:focus, .form-item .search-input:focus { border-color:#60a5fa; box-shadow:0 6px 20px rgba(96,165,250,0.08); }
.school-row { display:flex; gap:8px; align-items:center; }
.school-row select { flex: 1; }
.search-input { flex:1; }
.manual-input { margin-top:8px; }
.required { color: #ef4444; }

.upload-area {
  margin-top:6px;
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor: pointer;
  background: linear-gradient(180deg, rgba(99,102,241,0.02), transparent);
}
.upload-inner { text-align:center; color:#475569; }
.upload-icon { font-size: 24px; margin-bottom:4px; }
.preview { margin-top:12px; display:flex; gap:12px; flex-wrap:wrap; }
.preview img { max-width:320px; border-radius:8px; box-shadow:0 6px 18px rgba(2,6,23,0.06); }

.error { color: #ef4444; margin:12px 0; font-weight:600; }

.actions { display:flex; gap:12px; justify-content:flex-end; margin-top:16px; }
.primary {
  background: #1e90ff;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight:600;
}
.primary:disabled { opacity:0.6; cursor:not-allowed; }
.secondary {
  background: #f8fafc;
  color:#111827;
  border:1px solid #e6eef8;
  padding:10px 14px;
  border-radius:8px;
  cursor:pointer;
}

.submitted { padding:20px; text-align:center; }
.submitted .muted { color:#64748b; margin-top:8px; }
</style>


