<template>
    <div class="register-container">
      <div class="register-form">
        <h2>注册</h2>
                <div class="form-group">
          <label>头像</label>
          <div class="avatar-section">
            <div class="avatar-preview" @click="triggerFileInput" :class="{ 'uploading': uploadingAvatar }">
              <img v-if="registerForm.avatar" :src="registerForm.avatar" alt="头像预览" />
              <div v-else class="avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="avatar-overlay" v-if="!uploadingAvatar">
                <span>{{ registerForm.avatar ? '点击更换头像' : '点击选择头像' }}</span>
              </div>
              <div v-if="uploadingAvatar" class="avatar-uploading">
                <div class="avatar-spinner"></div>
                <span>上传中...</span>
              </div>
            </div>
            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/*"
              style="display: none;"
            />
            <div v-if="avatarError" class="avatar-error">{{ avatarError }}</div>
          </div>
        </div>
        <div class="form-group">
          <label for="username">用户名 <span class="required">*</span></label>
          <input 
            type="text" 
            id="username" 
            v-model="registerForm.username" 
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-group">
          <label for="password">密码 <span class="required">*</span></label>
          <input 
            type="password" 
            id="password" 
            v-model="registerForm.password" 
            placeholder="请输入密码"
          />
        </div>
        <div class="form-group">
          <label for="name">姓名 <span class="required">*</span></label>
          <input 
            type="text" 
            id="name" 
            v-model="registerForm.name" 
            placeholder="请输入姓名"
          />
        </div>

        <div class="form-group">
          <label for="role">角色 <span class="required">*</span></label>
          <select id="role" v-model="registerForm.role">
            <option 
              v-for="option in roleOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="telephone">手机号</label>
          <input 
            type="text" 
            id="telephone" 
            v-model="registerForm.telephone" 
            placeholder="请输入手机号（选填）"
          />
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="registerForm.email" 
            placeholder="请输入邮箱（选填）"
          />
        </div>
        <div class="form-group">
          <label for="location">所在地</label>
          <input 
            type="text" 
            id="location" 
            v-model="registerForm.location" 
            placeholder="请输入所在地（选填）"
          />
        </div>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
        <button @click="handleRegister" :disabled="isLoading">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
        <div class="form-footer">
          <p>已有账号？<router-link to="/login">立即登录</router-link></p>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  import api from '@/api';
  import { UserRole, USER_ROLE_LABELS } from '@/utils/constants';
  import type { RegisterForm } from '@/types/api';
  
  export default defineComponent({
    name: 'RegisterPage',
    data() {
      return {
        registerForm: {
          username: '',
          password: '',
          name: '',
          avatar: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2',
          role: UserRole.USER,
          telephone: '',
          email: '',
          location: '',
          memberLevel: 1,
          isMember: true,
        } as RegisterForm,
        errorMessage: '',
        isLoading: false,
        uploadingAvatar: false,
        avatarError: '',
        // 角色选项
        roleOptions: [
          { value: UserRole.USER, label: USER_ROLE_LABELS[UserRole.USER] },
          { value: UserRole.MERCHANT, label: USER_ROLE_LABELS[UserRole.MERCHANT] },
          { value: UserRole.ADMIN, label: USER_ROLE_LABELS[UserRole.ADMIN] },
        ]
      };
    },
    methods: {
      validateForm(): boolean {
        // 验证必填字段
        if (!this.registerForm.username) {
          this.errorMessage = '请输入用户名';
          return false;
        }
        if (!this.registerForm.password) {
          this.errorMessage = '请输入密码';
          return false;
        }
        if (!this.registerForm.name) {
          this.errorMessage = '请输入姓名';
          return false;
        }
        if (!this.registerForm.role) {
          this.errorMessage = '请选择角色';
          return false;
        }
        
        // 验证手机号格式
        if (this.registerForm.telephone && !/^1\d{10}$/.test(this.registerForm.telephone)) {
          this.errorMessage = '请输入正确的手机号格式';
          return false;
        }
        
        // 验证邮箱格式
        if (this.registerForm.email && !/^\S+@\S+\.\S+$/.test(this.registerForm.email)) {
          this.errorMessage = '请输入正确的邮箱格式';
          return false;
        }
        
        return true;
      },
      
      triggerFileInput(): void {
        (this.$refs.fileInput as HTMLInputElement).click();
      },
      
      async handleFileSelect(event: Event): Promise<void> {
        const target = event.target as HTMLInputElement
        if (!target || !target.files) return
        const file = target.files[0];
        if (!file) return;
        
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          this.avatarError = '请选择图片文件';
          return;
        }
        
        // 验证文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
          this.avatarError = '图片大小不能超过5MB';
          return;
        }
        
        this.avatarError = '';
        this.uploadingAvatar = true;
        
        try {
          // 上传图片到OSS
          const response = await api.image.uploadImage(file, 'avatar');
          
          if (response.code === '200' && response.data) {
            this.registerForm.avatar = response.data;
            this.errorMessage = '';
          } else {
            this.avatarError = response.msg || '头像上传失败，请重试';
          }
        } catch (err: any) {
          console.error('头像上传出错:', err);
          this.avatarError = err.response?.data?.msg || '头像上传失败，请稍后再试';
        } finally {
          this.uploadingAvatar = false;
          // 清空input，允许重复选择同一文件
          if (target) {
            target.value = '';
          }
        }
      },
      
      async handleRegister(): Promise<void> {
        if (!this.validateForm()) {
          return;
        }
        
        this.isLoading = true;
        this.errorMessage = '';
        
        try {
          console.log(this.registerForm);
          // 直接使用枚举值，不需要转换
          const registerData = {
            ...this.registerForm,
            role: this.registerForm.role  // 已经是 UserRole.USER 或 UserRole.ADMIN
          }
          const response = await api.user.register(registerData);
          
          if (response.code === '200') {
            // 注册成功，跳转到登录页
            this.$router.push('/login');
            alert('注册成功，请登录');
          } else {
            this.errorMessage = response.msg || '注册失败';
          }
        } catch (error: any) {
          this.errorMessage = error.response?.data?.msg || '注册失败，请稍后再试';
          console.error('注册错误:', error);
        } finally {
          this.isLoading = false;
        }
      }
    }
  });
  </script>
  
  <style scoped>
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 2rem 0;
  }
  
  .register-form {
    width: 100%;
    max-width: 500px;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .required {
    color: #f44336;
  }
  
  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  select {
    height: 2.75rem;
  }
  
  .avatar-section {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  }
  
  .avatar-preview {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid #ddd;
    transition: border-color 0.3s;
  }
  
  .avatar-preview:hover:not(.uploading) {
    border-color: #4CAF50;
  }
  
  .avatar-preview.uploading {
    border-color: #2196f3;
    cursor: wait;
  }
  
  .avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    color: #999;
  }
  
  .avatar-placeholder svg {
    width: 48px;
    height: 48px;
    stroke-width: 1.5;
  }
  
  .avatar-overlay {
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
    transition: opacity 0.3s;
    color: white;
    font-size: 0.8rem;
    text-align: center;
    padding: 0.25rem;
  }
  
  .avatar-preview:hover:not(.uploading) .avatar-overlay {
    opacity: 1;
  }
  
  .avatar-uploading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #2196f3;
    font-size: 0.75rem;
  }
  
  .avatar-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #2196f3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .avatar-error {
    margin-top: 8px;
    color: #f44336;
    font-size: 0.875rem;
    text-align: center;
  }
  
  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #f44336;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
  
  .form-footer {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  a {
    color: #4CAF50;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  </style>