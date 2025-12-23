<template>
  <div class="school-verification-form">
    <div v-if="submitted" class="submitted">
      <p>提交成功，状态：{{ status }}</p>
      <button @click="$emit('submitted')">关闭</button>
    </div>
    <div v-else>
      <div class="form-group">
        <label>学校名称 <span class="required">*</span></label>
        <input v-model="form.schoolName" type="text" placeholder="例如：北京大学" />
      </div>
      <div class="form-group">
        <label>学号 <span class="required">*</span></label>
        <input v-model="form.studentId" type="text" placeholder="请输入学号" />
      </div>
      <div class="form-group">
        <label>证件图片 <span class="required">*</span></label>
        <div class="upload-row">
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display:none" />
          <button @click="triggerFile">上传图片</button>
          <span v-if="uploading">{{ uploading ? '上传中...' : '' }}</span>
        </div>
        <div v-if="form.certificateUrl" class="preview">
          <img :src="form.certificateUrl" alt="证件" />
        </div>
      </div>
      <div class="error" v-if="error">{{ error }}</div>
      <div class="actions">
        <button @click="handleSubmit" :disabled="loading">{{ loading ? '提交中...' : '提交认证' }}</button>
        <button @click="$emit('cancel')">取消</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import api from '@/api'
import type { SchoolVerificationRequest } from '@/types/api'

const emit = defineEmits(['submitted','cancel'])

const form = ref<SchoolVerificationRequest>({
  schoolName: '',
  studentId: '',
  certificateUrl: ''
})

const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const uploading = ref(false)
const error = ref('')
const submitted = ref(false)
const status = ref('')

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
  if (!form.value.schoolName.trim()) {
    error.value = '请输入学校名称'
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
</script>

<style scoped>
.school-verification-form { padding: 12px; }
.form-group { margin-bottom: 12px; }
.upload-row { display:flex; gap:8px; align-items:center; }
.preview img { max-width: 200px; border-radius:8px; margin-top:8px; }
.error { color: #f44336; margin-bottom: 8px; }
.actions { display:flex; gap:8px; }
</style>


