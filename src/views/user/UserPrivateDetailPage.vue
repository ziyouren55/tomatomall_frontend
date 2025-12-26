<template>
    <div class="profile-container">
      <div class="profile-card">
        <div v-if="isLoading" class="loading">
          <p>加载中...</p>
        </div>
        <div v-else-if="error" class="error-container">
          <p>{{ error }}</p>
          <button @click="fetchUserProfile">重试</button>
        </div>
        <template v-else>
          <div class="profile-header">
            <div class="avatar-container">
              <img
                :src="userProfile.avatar || 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2'"
                :alt="userProfile.name"
                class="avatar"
              />
            </div>
            <div class="user-info">
              <h2>{{ userProfile.name }}</h2>
              <p class="username">@{{ userProfile.username }}</p>
              <span class="role-badge" :class="(userProfile.role || 'USER').toLowerCase()">
                {{ getRoleLabel(userProfile.role) }}
              </span>
              <div style="margin-top:8px">
                <template v-if="schoolVerification && schoolVerification.status === 'VERIFIED'">
                  <span class="badge" style="background:#22c55e;color:#fff;padding:4px 8px;border-radius:6px">学校认证：已认证</span>
                </template>
                <template v-else-if="schoolVerification && schoolVerification.status === 'PENDING'">
                  <span class="badge" style="background:#f59e0b;color:#fff;padding:4px 8px;border-radius:6px">学校认证：审核中</span>
                </template>
                <template v-else>
                  <button class="edit-button" style="margin-top:6px" @click="openVerification">去认证</button>
                </template>
              </div>
            </div>
          </div>

          <div class="profile-content">
            <div v-if="showVerificationForm" style="margin-bottom:16px">
              <SchoolVerificationForm @submitted="onVerificationSubmitted" @cancel="showVerificationForm = false" />
            </div>
            <div v-if="!isEditing" class="profile-details">
              <div class="info-group">
                <label>手机号</label>
                <p>{{ userProfile.telephone || '未设置' }}</p>
              </div>
              <div class="info-group">
                <label>邮箱</label>
                <p>{{ userProfile.email || '未设置' }}</p>
              </div>
              <div class="info-group">
                <label>所在地</label>
                <p>{{ userProfile.location || '未设置' }}</p>
              </div>
              <button class="edit-button" @click="startEditing">编辑资料</button>
            </div>

            <div v-else class="profile-form">
              <div class="form-group">
                <label for="edit-name">姓名 <span class="required">*</span></label>
                <input
                  type="default"
                  id="edit-name"
                  v-model="editForm.name"
                  placeholder="请输入姓名"
                />
              </div>
              <div class="form-group">
                <label>头像</label>
                <div class="avatar-section">
                  <div class="avatar-preview" @click="triggerFileInput">
                    <img :src="editForm.avatar" alt="头像预览" />
                    <div class="avatar-overlay">
                      <span>点击选择头像</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileSelect"
                    accept="image/*"
                    style="display: none;"
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="edit-role">角色 <span class="required">*</span></label>
                <select id="edit-role" v-model="editForm.role">
                  <option :value="UserRole.CUSTOMER">{{ USER_ROLE_LABELS[UserRole.CUSTOMER] }}</option>
                  <option :value="UserRole.ADMIN">{{ USER_ROLE_LABELS[UserRole.ADMIN] }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="edit-telephone">手机号</label>
                <input
                  type="default"
                  id="edit-telephone"
                  v-model="editForm.telephone"
                  placeholder="请输入手机号（选填）"
                />
              </div>
              <div class="form-group">
                <label for="edit-email">邮箱</label>
                <input
                  type="email"
                  id="edit-email"
                  v-model="editForm.email"
                  placeholder="请输入邮箱（选填）"
                />
              </div>
              <div class="form-group">
                <label for="edit-location">所在地</label>
                <input
                  type="default"
                  id="edit-location"
                  v-model="editForm.location"
                  placeholder="请输入所在地（选填）"
                />
              </div>
              <div class="form-group">
                <label for="edit-password">修改密码 (留空则不修改)</label>
                <input
                  type="password"
                  id="edit-password"
                  v-model="editForm.password"
                  placeholder="请输入新密码"
                />
              </div>
              <div class="error-message" v-if="editError">{{ editError }}</div>
              <div class="button-group">
                <button class="cancel-button" @click="cancelEditing">取消</button>
                <button
                  class="save-button"
                  @click="saveProfile"
                  :disabled="isSaving"
                >
                  {{ isSaving ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </template>

  <script lang="ts">
  import { defineComponent } from 'vue'
  import api from '@/api';
  import SchoolVerificationForm from '@/components/business/user/SchoolVerificationForm.vue'
  import type { SchoolVerification } from '@/types/api'
  import type { UserInfo, ErrorResponse } from '@/types/api'
  import type { AxiosError } from 'axios'
  import { UserRole, USER_ROLE_LABELS, getRoleLabel as getRoleLabelUtil, normalizeRole } from '@/utils/constants'
  import type { EditForm } from '@/types/api';

  export default defineComponent({
    name: 'ProfilePage',
    data() {
      return {
        userProfile: {} as UserInfo,
        isLoading: true,
        error: null as string | null,
        isEditing: false,
        editForm: {
          username: '',
          name: '',
          avatar: '',
          telephone: '',
          email: '',
          location: '',
          password: '',
          role: UserRole.CUSTOMER
        } as EditForm,
        editError: '',
        isSaving: false,
        // 在模板中使用的常量
        UserRole,
        USER_ROLE_LABELS
        ,
        showVerificationForm: false,
        schoolVerification: null as SchoolVerification | null
      };
    },
    created() {
      this.fetchUserProfile();
    },
    components: {
      SchoolVerificationForm
    },
    methods: {
      async fetchSchoolVerification(): Promise<void> {
        try {
          const username = this.userProfile.username;
          if (!username) return;
          const res = await api.user.getSchoolVerification(username);
          if (res && res.code === '200') {
            this.schoolVerification = res.data || null;
          }
        } catch (e) {
          // ignore
        }
      },
      openVerification() {
        this.showVerificationForm = true;
      },
      onVerificationSubmitted() {
        this.showVerificationForm = false;
        this.fetchSchoolVerification();
      },
      getRoleLabel(role: string | UserRole | undefined | null): string {
        // 使用导入的 getRoleLabel 工具函数
        return getRoleLabelUtil(role);
      },
      async fetchUserProfile(): Promise<void> {
        this.isLoading = true;
        this.error = null;

        try {
          // 从本地存储获取用户名
          const username = localStorage.getItem('username');
          if (!username) {
            this.$router.push('/login');
            return;
          }

          const response = await api.user.getUserDetails(username);

          if (response.code === '200') {
            this.userProfile = response.data;
            // 初始化编辑表单
            this.initEditForm();
            // 拉取学校认证状态
            await this.fetchSchoolVerification();
            // 如果路由携带 openVerify 参数，自动打开认证表单
            if (this.$route && this.$route.query && this.$route.query.openVerify) {
              this.showVerificationForm = true;
            }
          } else {
            this.error = response.msg || '获取用户信息失败';
          }
        } catch (error: unknown) {
          const axiosError = error as AxiosError<ErrorResponse>
          this.error = axiosError.response?.data?.msg || '获取用户信息失败，请稍后再试';
          console.error('获取用户信息错误:', error);
        } finally {
          this.isLoading = false;
        }
      },

      initEditForm() {
        this.editForm = {
          username: this.userProfile.username,
          name: this.userProfile.name || '',
          avatar: this.userProfile.avatar || 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2',
          telephone: this.userProfile.telephone || '',
          email: this.userProfile.email || '',
          location: this.userProfile.location || '',
          password: '',
          role: this.userProfile.role ? (typeof this.userProfile.role === 'string' ? normalizeRole(this.userProfile.role) : this.userProfile.role) : UserRole.CUSTOMER
        };
      },

      startEditing() {
        this.isEditing = true;
        this.editError = '';
      },

      cancelEditing() {
        this.isEditing = false;
        this.editError = '';
        // 重置表单
        this.initEditForm();
      },

      triggerFileInput() {
        const fileInput = this.$refs.fileInput as HTMLInputElement | undefined
        if (fileInput) {
          fileInput.click()
        }
      },

      handleFileSelect(event: Event): void {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          this.editError = '请选择图片文件';
          return;
        }

        // 验证文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
          this.editError = '图片大小不能超过5MB';
          return;
        }

        // 创建文件读取器
        const reader = new FileReader();
        reader.onload = (e) => {
          // 将文件转换为base64格式作为预览
          const result = e.target?.result
          if (typeof result === 'string') {
            this.editForm.avatar = result;
            this.editError = '';
          }
        };
        reader.readAsDataURL(file);
      },

      validateForm(): boolean {
        // 验证必填字段
        if (!this.editForm.name) {
          this.editError = '请输入姓名';
          return false;
        }
        if (!this.editForm.role) {
          this.editError = '请选择角色';
          return false;
        }

        // 验证手机号格式
        if (this.editForm.telephone && !/^1\d{10}$/.test(this.editForm.telephone)) {
          this.editError = '请输入正确的手机号格式';
          return false;
        }

        // 验证邮箱格式
        if (this.editForm.email && !/^\S+@\S+\.\S+$/.test(this.editForm.email)) {
          this.editError = '请输入正确的邮箱格式';
          return false;
        }

        return true;
      },

      async saveProfile(): Promise<void> {
        if (!this.validateForm()) {
          return;
        }

        this.isSaving = true;
        this.editError = '';

        // 创建要提交的数据对象
        const updateData: Partial<UserInfo> = {
          username: this.editForm.username,
          name: this.editForm.name,
          avatar: this.editForm.avatar,
          telephone: this.editForm.telephone,
          email: this.editForm.email,
          location: this.editForm.location,
          role: this.editForm.role
        };

        // 如果密码不为空，则添加密码字段
        if (this.editForm.password) {
          (updateData as any).password = this.editForm.password;
        }

        try {
          const response = await api.user.updateUserInfo(updateData);

          if (response.code === '200') {
            // 更新成功，刷新用户信息
            this.isEditing = false;
            await this.fetchUserProfile();
            alert('个人信息更新成功');
          } else {
            this.editError = response.msg || '更新失败';
          }
        } catch (error: unknown) {
          const axiosError = error as AxiosError<ErrorResponse>
          this.editError = axiosError.response?.data?.msg || '更新失败，请稍后再试';
          console.error('更新用户信息错误:', error);
        } finally {
          this.isSaving = false;
        }
      }
    }
  });
  </script>

  <style scoped>
  .profile-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 2rem 0;
  }

  .profile-card {
    width: 100%;
    max-width: 700px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .loading, .error-container {
    padding: 2rem;
    text-align: center;
  }

  .error-container button {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }

  .profile-header {
    display: flex;
    padding: 2rem;
    background-color: #f0f8ff;
    border-bottom: 1px solid #eee;
  }

  .avatar-container {
    margin-right: 2rem;
  }

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .user-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .user-info h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
  }

  .username {
    color: #666;
    margin: 0 0 0.5rem 0;
  }

  .role-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    color: white;
    width: fit-content;
  }

  .role-badge.admin {
    background-color: #ff7043;
  }

  .role-badge.user {
    background-color: #4CAF50;
  }

  .profile-content {
    padding: 2rem;
  }

  .profile-details .info-group {
    margin-bottom: 1.5rem;
  }

  .profile-details label {
    display: block;
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .profile-details p {
    margin: 0;
    font-size: 1rem;
  }

  .edit-button {
    background-color: #2196F3;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
  }

  .edit-button:hover {
    background-color: #0b7dda;
  }

  .profile-form .form-group {
    margin-bottom: 1.5rem;
  }

  .profile-form label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .required {
    color: #f44336;
  }

  .profile-form input, .profile-form select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .profile-form select {
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

  .avatar-preview:hover {
    border-color: #4CAF50;
  }

  .avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

  .avatar-preview:hover .avatar-overlay {
    opacity: 1;
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
  }

  .cancel-button {
    padding: 0.75rem 1.5rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    flex: 1;
    margin-right: 0.5rem;
  }

  .save-button {
    padding: 0.75rem 1.5rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    flex: 1;
    margin-left: 0.5rem;
  }

  .save-button:hover {
    background-color: #45a049;
  }

  .save-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .error-message {
    color: #f44336;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
  </style>
