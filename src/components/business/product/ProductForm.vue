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
          <label for="cover">封面图片URL</label>
          <input 
            type="text" 
            id="cover" 
            v-model="formData.cover" 
            placeholder="https://example.com/image.jpg"
          >
          <div class="image-preview" v-if="formData.cover">
            <img :src="formData.cover" alt="封面预览" @error="handleImageError">
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
        showImagePreview: true
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
  
  .image-preview {
    margin-top: 10px;
    max-width: 200px;
    border: 1px solid #ddd;
    padding: 5px;
    border-radius: 4px;
  }
  
  .image-preview img {
    width: 100%;
    height: auto;
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