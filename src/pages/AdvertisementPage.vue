<template>
  <div class="advertisement-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>广告管理</h1>
      <button class="btn-primary" @click="showAddDialog">
        <span class="icon-plus"></span>
        添加广告
      </button>
    </div>

    <!-- 广告列表 -->
    <div class="advertisement-list">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        加载中...
      </div>
      
      <div v-else-if="advertisements.length === 0" class="empty-container">
        <p>暂无广告数据</p>
      </div>
      
      <div
        v-else
        v-for="ad in advertisements"
        :key="ad.id"
        class="advertisement-card"
        @click="goToProduct(ad.product_id || ad.productId)"
      >
        <input
          type="checkbox"
          class="ad-checkbox"
          :checked="selectedAds.includes(ad.id)"
          @change="toggleSelection(ad.id)"
          @click.stop
        >
        
        <div class="ad-image">
          <img
            :src="ad.image_url || ad.imageUrl || 'https://via.placeholder.com/400x300?text=暂无图片'"
            :alt="ad.title"
            @error="handleImageError"
          >
        </div>
        
        <div class="ad-content">
          <h3 class="ad-title">{{ ad.title || '无标题' }}</h3>
          <p class="ad-description">{{ ad.content || '无内容描述' }}</p>
        </div>
        
        <button
          class="edit-btn"
          @click.stop="editAdvertisement(ad.id)"
        >
          修改
        </button>
      </div>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedAds.length > 0" class="batch-actions">
      <button class="btn-danger" @click="batchDelete">
        删除选中广告 ({{ selectedAds.length }})
      </button>
    </div>

    <!-- 添加/编辑广告对话框 -->
    <div v-if="showModal" class="modal show" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ currentAd ? '编辑广告' : '添加广告' }}</h3>
          <button class="close" @click="closeModal">&times;</button>
        </div>
        
        <div class="advertisement-form">
          <form @submit.prevent="saveAdvertisement">
            <div class="form-group">
              <label for="title" class="form-label">广告标题</label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                class="form-control"
                :class="{ error: errors.title }"
                placeholder="请输入广告标题"
                required
              >
              <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
            </div>
            
            <div class="form-group">
              <label for="content" class="form-label">广告内容</label>
              <textarea
                id="content"
                v-model="form.content"
                class="form-control"
                :class="{ error: errors.content }"
                placeholder="请输入广告内容"
                rows="3"
                required
              ></textarea>
              <div v-if="errors.content" class="error-message">{{ errors.content }}</div>
            </div>
            
            <div class="form-group">
              <label for="imgUrl" class="form-label">图片URL</label>
              <input
                id="imgUrl"
                v-model="form.imgUrl"
                type="url"
                class="form-control"
                :class="{ error: errors.imgUrl }"
                placeholder="请输入广告图片URL"
                required
              >
              <div v-if="form.imgUrl" class="image-preview">
                <img
                  :src="form.imgUrl"
                  alt="广告图片预览"
                  @error="handlePreviewError"
                >
              </div>
              <div v-if="errors.imgUrl" class="error-message">{{ errors.imgUrl }}</div>
            </div>
            
            <div class="form-group">
              <label for="productId" class="form-label">商品ID</label>
              <input
                id="productId"
                v-model="form.productId"
                type="text"
                class="form-control"
                :class="{ error: errors.productId }"
                placeholder="请输入关联的商品ID"
                required
              >
              <div v-if="errors.productId" class="error-message">{{ errors.productId }}</div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeModal">取消</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="saving"
            @click="saveAdvertisement"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div
      v-if="message.show"
      :class="['message', 'show', message.type]"
    >
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'

// API服务配置
const API_BASE_URL = 'http://localhost:8080/api'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理常见错误
apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      // 处理401未授权的情况
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        return
      }
      console.error('API Error:', error.response.data)
      showMessage(error.response.data?.message || '请求失败', 'error')
    } else {
      console.error('Network Error:', error.message)
      showMessage('网络连接失败', 'error')
    }
    return Promise.reject(error)
  }
)

// 广告服务API
const advertisementService = {
  // 获取所有广告
  getAllAdvertisements() {
    return apiClient.get('/advertisements')
  },
  
  // 创建新广告
  createAdvertisement(advertisementData) {
    return apiClient.post('/advertisements', advertisementData)
  },
  
  // 更新广告
  updateAdvertisement(advertisementData) {
    return apiClient.put('/advertisements', advertisementData)
  },
  
  // 删除广告
  deleteAdvertisement(id) {
    return apiClient.delete(`/advertisements/${id}`)
  }
}

// 响应式数据
const advertisements = ref([])
const selectedAds = ref([])
const currentAd = ref(null)
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)

// 表单数据
const form = reactive({
  title: '',
  content: '',
  imgUrl: '',
  productId: ''
})

// 表单错误
const errors = reactive({
  title: '',
  content: '',
  imgUrl: '',
  productId: ''
})

// 消息提示
const message = reactive({
  show: false,
  text: '',
  type: 'success'
})

// 获取广告列表
const fetchAdvertisements = async () => {
  try {
    loading.value = true
    const response = await advertisementService.getAllAdvertisements()
    advertisements.value = response.data || response || []
  } catch (error) {
    console.error('获取广告列表失败:', error)
    showMessage('获取广告列表失败', 'error')
    advertisements.value = []
  } finally {
    loading.value = false
  }
}

// 切换选择状态
const toggleSelection = (id) => {
  const index = selectedAds.value.indexOf(id)
  if (index > -1) {
    selectedAds.value.splice(index, 1)
  } else {
    selectedAds.value.push(id)
  }
}

// 跳转到商品详情页
const goToProduct = (productId) => {
  showMessage(`跳转到商品详情页: ${productId}`, 'success')
}

// 显示添加对话框
const showAddDialog = () => {
  currentAd.value = null
  clearForm()
  showModal.value = true
}

// 编辑广告
const editAdvertisement = (id) => {
  const ad = advertisements.value.find(ad => ad.id === id)
  if (ad) {
    currentAd.value = ad
    fillForm(ad)
    showModal.value = true
  }
}

// 填充表单 - 兼容不同的字段名
const fillForm = (ad) => {
  form.title = ad.title || ''
  form.content = ad.content || ''
  form.imgUrl = ad.image_url || ad.imageUrl || ''
  form.productId = ad.product_id || ad.productId || ''
}

// 清空表单
const clearForm = () => {
  form.title = ''
  form.content = ''
  form.imgUrl = ''
  form.productId = ''
  clearErrors()
}

// 清空错误信息
const clearErrors = () => {
  errors.title = ''
  errors.content = ''
  errors.imgUrl = ''
  errors.productId = ''
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
  clearForm()
}

// 验证表单
const validateForm = () => {
  clearErrors()
  let isValid = true

  const title = form.title.trim()
  const content = form.content.trim()
  const imgUrl = form.imgUrl.trim()
  const productId = form.productId.trim()

  // 验证标题
  if (!title) {
    errors.title = '标题不能为空'
    isValid = false
  } else if (title.length > 50) {
    errors.title = '标题不能超过50个字符'
    isValid = false
  }

  // 验证内容
  if (!content) {
    errors.content = '内容不能为空'
    isValid = false
  } else if (content.length > 500) {
    errors.content = '内容不能超过500个字符'
    isValid = false
  }

  // 验证图片URL
  if (!imgUrl) {
    errors.imgUrl = '图片URL不能为空'
    isValid = false
  } else {
    try {
      new URL(imgUrl)
    } catch (e) {
      errors.imgUrl = '请输入有效的URL'
      isValid = false
    }
  }

  // 验证商品ID
  if (!productId) {
    errors.productId = '商品ID不能为空'
    isValid = false
  }

  return isValid
}

// 保存广告 - 与后端API交互
const saveAdvertisement = async () => {
  if (!validateForm()) {
    return
  }

  try {
    saving.value = true

    const formData = {
      title: form.title.trim(),
      content: form.content.trim(),
      image_url: form.imgUrl.trim(),
      product_id: form.productId.trim()
    }

    if (currentAd.value) {
      // 编辑广告
      const updateData = {
        id: currentAd.value.id,
        ...formData
      }
      await advertisementService.updateAdvertisement(updateData)
      showMessage('广告更新成功', 'success')
    } else {
      // 新增广告
      await advertisementService.createAdvertisement(formData)
      showMessage('广告创建成功', 'success')
    }

    closeModal()
    await fetchAdvertisements() // 重新获取数据
    
  } catch (error) {
    console.error('保存广告失败:', error)
    const errorMsg = error.response?.data?.message || '保存广告失败'
    showMessage(errorMsg, 'error')
  } finally {
    saving.value = false
  }
}

// 批量删除 - 与后端API交互
const batchDelete = async () => {
  if (selectedAds.value.length === 0) return

  if (!confirm(`确定要删除选中的 ${selectedAds.value.length} 个广告吗？`)) {
    return
  }

  try {
    loading.value = true
    
    // 批量删除API调用
    const deletePromises = selectedAds.value.map(id => 
      advertisementService.deleteAdvertisement(id)
    )
    
    await Promise.all(deletePromises)
    
    selectedAds.value = []
    showMessage('删除成功', 'success')
    await fetchAdvertisements() // 重新获取数据
    
  } catch (error) {
    console.error('删除广告失败:', error)
    const errorMsg = error.response?.data?.message || '删除广告失败'
    showMessage(errorMsg, 'error')
  } finally {
    loading.value = false
  }
}

// 显示消息
const showMessage = (text, type = 'success') => {
  message.text = text
  message.type = type
  message.show = true

  setTimeout(() => {
    message.show = false
  }, 3000)
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/400x300?text=图片加载失败'
}

// 处理预览图片错误
const handlePreviewError = (event) => {
  event.target.style.display = 'none'
}

// 页面加载时获取数据
onMounted(() => {
  fetchAdvertisements()
})
</script>

<style scoped>
* {
  margin: 0;
  box-sizing: border-box;
}

.advertisement-page {
  padding: 60px;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.btn-primary {
  background-color: #409EFF;
  border: 1px solid #409EFF;
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-primary:hover {
  background-color: #337ecc;
  border-color: #337ecc;
}

.btn-primary:disabled {
  background-color: #b3d8ff;
  border-color: #b3d8ff;
  cursor: not-allowed;
}

.advertisement-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.loading-container, .empty-container {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px;
  color: #999;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #409EFF;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.advertisement-card {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.advertisement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.ad-checkbox {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.ad-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.ad-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.advertisement-card:hover .ad-image img {
  transform: scale(1.05);
}

.ad-content {
  padding: 16px;
}

.ad-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ad-description {
  margin: 0;
  color: #666;
  line-height: 1.6;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.edit-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.advertisement-card:hover .edit-btn {
  opacity: 1;
}

.edit-btn:hover {
  background: #337ecc;
}

.batch-actions {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.btn-danger {
  background-color: #F56C6C;
  border: 1px solid #F56C6C;
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.btn-danger:hover {
  background-color: #f23030;
  border-color: #f23030;
}

/* Modal styles */
.modal {
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.advertisement-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-control.error {
  border-color: #F56C6C;
}

.error-message {
  color: #F56C6C;
  font-size: 12px;
  margin-top: 4px;
}

.image-preview {
  text-align: center;
  margin-top: 10px;
}

.image-preview img {
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  background-color: #909399;
  border: 1px solid #909399;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background-color: #767a82;
  border-color: #767a82;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  z-index: 3000;
  font-size: 14px;
  min-width: 200px;
  text-align: center;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.message.show {
  transform: translateX(0);
}

.message.success {
  background-color: #67C23A;
}

.message.error {
  background-color: #F56C6C;
}

.icon-plus::before {
  content: '+';
  font-weight: bold;
}
</style>