<!-- src/components/ProductForm.vue -->
<template>
    <div class="product-form">
      <form @submit.prevent="submitForm">
        <div class="form-header">
          <h2>{{ isEdit ? '编辑产品' : '添加新产品' }}</h2>
        </div>
        
        <div class="form-group">
          <label for="title">标题*</label>
          <input 
            type="text" 
            id="title" 
            v-model="formData.title" 
            required
            placeholder="产品标题"
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="price">价格*</label>
            <input 
              type="number" 
              id="price" 
              v-model="formData.price" 
              min="0" 
              step="0.01" 
              required
              placeholder="0.00"
            >
          </div>
          
          <div class="form-group">
            <label for="rate">评分*</label>
            <input 
              type="number" 
              id="rate" 
              v-model="formData.rate" 
              min="0" 
              max="10" 
              step="0.1" 
              required
              placeholder="0-10"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">简介</label>
          <textarea 
            id="description" 
            v-model="formData.description" 
            rows="3"
            placeholder="简短产品描述"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="cover">封面图片*</label>
          <div class="image-upload-section">
            <input 
              type="file" 
              id="cover" 
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/*"
              style="display: none;"
            >
            <div class="upload-area" @click="triggerFileInput" :class="{ 'has-image': formData.cover }">
              <div v-if="!formData.cover && !uploading" class="upload-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>点击选择图片或拖拽图片到此处</span>
              </div>
              <div v-else-if="uploading" class="upload-loading">
                <div class="spinner"></div>
                <span>上传中...</span>
              </div>
              <div v-else class="image-preview-container">
                <img :src="formData.cover" alt="封面预览" @error="handleImageError">
                <div class="image-overlay">
                  <button type="button" class="replace-btn" @click.stop="triggerFileInput">更换图片</button>
                </div>
              </div>
            </div>
            <div v-if="uploadError" class="upload-error">{{ uploadError }}</div>
            <div class="upload-hint">支持 JPG、PNG、GIF 格式，文件大小不超过 5MB</div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="detail">详细描述</label>
          <textarea 
            id="detail" 
            v-model="formData.detail" 
            rows="5"
            placeholder="完整产品描述"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="cancel">取消</button>
          <button type="submit" class="submit-btn">{{ isEdit ? '更新产品' : '创建产品' }}</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import api from '@/api';
  
  export default {
    name: 'ProductForm',
    props: {
      product: {
        type: Object,
        default: null
      },
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        formData: {
          id: null,
          title: '',
          price: 0,
          rate: 0,
          description: '',
          cover: '',
          detail: '',
          salesCount: 0
        },
        showImagePreview: true,
        uploading: false,
        uploadError: ''
      };
    },
    created() {
      if (this.isEdit && this.product) {
        this.initFormWithProduct();
      }
    },
    methods: {
      initFormWithProduct() {
        // Copy product data to form
        this.formData = {
          id: this.product.id,
          title: this.product.title || '',
          price: this.product.price || 0,
          rate: this.product.rate || 0,
          description: this.product.description || '',
          cover: this.product.cover || '',
          detail: this.product.detail || '',
          salesCount: this.product.salesCount || 0
        };
      },
      handleImageError() {
        this.showImagePreview = false;
        this.uploadError = '图片加载失败，请重新上传';
      },
      triggerFileInput() {
        const fileInput = this.$refs.fileInput;
        if (fileInput && fileInput.click) {
          fileInput.click();
        }
      },
      async handleFileSelect(event) {
        const target = event.target;
        if (!target || !target.files || !target.files[0]) return;
        
        const file = target.files[0];
        
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          this.uploadError = '请选择图片文件';
          return;
        }
        
        // 验证文件大小（5MB）
        if (file.size > 5 * 1024 * 1024) {
          this.uploadError = '图片大小不能超过5MB';
          return;
        }
        
        this.uploadError = '';
        this.uploading = true;
        
        try {
          // 上传图片到OSS
          const response = await api.image.uploadImage(file, 'product');
          
          if (response.code === '200' && response.data) {
            this.formData.cover = response.data;
            this.showImagePreview = true;
          } else {
            this.uploadError = response.msg || '图片上传失败，请重试';
          }
        } catch (err) {
          console.error('图片上传出错:', err);
          const error = err || {};
          this.uploadError = (error.response && error.response.data && error.response.data.msg) || '图片上传失败，请稍后再试';
        } finally {
          this.uploading = false;
          // 清空input，允许重复选择同一文件
          if (target) {
            target.value = '';
          }
        }
      },
      async submitForm() {
        try {
          let response;
          
          if (this.isEdit) {
            response = await api.product.updateProduct(this.formData);
          } else {
            response = await api.product.createProduct(this.formData);
          }
          
          if (response.code === '200') {
            this.$emit('success', response.data);
          } else {
            this.$emit('error', response.msg || '保存产品失败');
          }
        } catch (err) {
          console.error('保存产品出错:', err);
          this.$emit('error', '保存产品时发生错误，请重试。');
        }
      },
      cancel() {
        this.$emit('cancel');
      }
    }
  };
  </script>
  
  <style scoped>
  .product-form {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .form-header {
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  
  .form-header h2 {
    margin: 0;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-row {
    display: flex;
    gap: 20px;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #333;
  }
  
  input[type="text"],
  input[type="number"],
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  textarea {
    resize: vertical;
  }
  
  .image-upload-section {
    margin-top: 5px;
  }
  
  .upload-area {
    border: 2px dashed #ddd;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #fafafa;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .upload-area:hover {
    border-color: #2196f3;
    background-color: #f0f7ff;
  }
  
  .upload-area.has-image {
    border: 2px solid #ddd;
    padding: 0;
    min-height: auto;
  }
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #666;
  }
  
  .upload-placeholder svg {
    width: 48px;
    height: 48px;
    stroke-width: 1.5;
    color: #999;
  }
  
  .upload-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #666;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2196f3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .image-preview-container {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .image-preview-container img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
  }
  
  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 8px;
  }
  
  .image-preview-container:hover .image-overlay {
    opacity: 1;
  }
  
  .replace-btn {
    padding: 8px 16px;
    background-color: white;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background-color 0.3s ease;
  }
  
  .replace-btn:hover {
    background-color: #f0f0f0;
  }
  
  .upload-error {
    margin-top: 8px;
    color: #f44336;
    font-size: 0.875rem;
  }
  
  .upload-hint {
    margin-top: 8px;
    color: #999;
    font-size: 0.875rem;
  }
  
  .specifications-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .specifications-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
  }
  
  .spec-item {
    margin-bottom: 10px;
  }
  
  .spec-form {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  
  .spec-form-group {
    flex: 1;
  }
  
  .remove-spec-btn {
    background-color: #f44336;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-top: 5px;
  }
  
  .add-spec-btn {
    margin-top: 10px;
    background-color: #e0e0e0;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .add-spec-btn:hover {
    background-color: #d0d0d0;
  }
  
  .form-actions {
    margin-top: 30px;
    display: flex;
    justify-content: flex-end;
    gap: 15px;
  }
  
  .cancel-btn, .submit-btn {
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    border: none;
  }
  
  .cancel-btn {
    background-color: #f5f5f5;
    color: #333;
  }
  
  .submit-btn {
    background-color: #2196f3;
    color: white;
  }
  
  .cancel-btn:hover {
    background-color: #e0e0e0;
  }
  
  .submit-btn:hover {
    background-color: #1976d2;
  }
  </style>