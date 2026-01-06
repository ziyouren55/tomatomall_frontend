<template>
    <div class="profile-page">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <el-icon class="error-icon" :size="64"><CircleClose /></el-icon>
        <p class="error-text">{{ error }}</p>
        <el-button type="primary" @click="fetchUserProfile" size="large">重试</el-button>
      </div>

      <!-- 主内容 -->
      <template v-else>
        <!-- 顶部背景装饰 -->
        <div class="profile-header-bg"></div>

        <div class="profile-container">
          <!-- 用户信息卡片 -->
          <div class="user-card">
            <div class="user-card-content">
              <!-- 头像区域 -->
              <div class="avatar-section">
                <div class="avatar-wrapper">
                  <img
                    :src="userProfile.avatar || 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2'"
                    :alt="userProfile.name"
                    class="user-avatar"
                  />
                  <div class="avatar-badge">
                    <el-icon><User /></el-icon>
                  </div>
                </div>
              </div>

              <!-- 用户基本信息 -->
              <div class="user-basic-info">
                <h1 class="user-name">{{ userProfile.name }}</h1>
                <p class="user-username">@{{ userProfile.username }}</p>
                
                <div class="badges-row">
                  <span class="role-badge" :class="(userProfile.role || 'USER').toLowerCase()">
                    <el-icon><Medal /></el-icon>
                    {{ getRoleLabel(userProfile.role) }}
                  </span>
                  
                  <span v-if="schoolVerification && schoolVerification.status === 'VERIFIED'" class="verified-badge">
                    <el-icon><CircleCheck /></el-icon>
                    学生认证
                  </span>
                  <span v-else-if="schoolVerification && schoolVerification.status === 'PENDING'" class="pending-badge">
                    <el-icon><Clock /></el-icon>
                    审核中
                  </span>
                  <el-button v-else type="primary" size="small" @click="goToVerification" class="verify-btn">
                    <el-icon><School /></el-icon>
                    学生认证
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 详细信息卡片 -->
          <div class="details-card">
            <!-- 查看模式 -->
            <div v-if="!isEditing" class="view-mode">
              <div class="card-header">
                <h2>
                  <el-icon><InfoFilled /></el-icon>
                  个人信息
                </h2>
                <el-button type="primary" @click="startEditing" :icon="Edit">
                  编辑资料
                </el-button>
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">
                    <el-icon><Phone /></el-icon>
                    手机号
                  </div>
                  <div class="info-value">{{ userProfile.telephone || '未设置' }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">
                    <el-icon><Message /></el-icon>
                    邮箱
                  </div>
                  <div class="info-value">{{ userProfile.email || '未设置' }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">
                    <el-icon><Location /></el-icon>
                    所在地
                  </div>
                  <div class="info-value">{{ userProfile.location || '未设置' }}</div>
                </div>
              </div>
            </div>

            <!-- 编辑模式 -->
            <div v-else class="edit-mode">
              <div class="card-header">
                <h2>
                  <el-icon><Edit /></el-icon>
                  编辑资料
                </h2>
              </div>

              <el-form :model="editForm" label-position="top" class="edit-form">
                <!-- 头像上传 -->
                <el-form-item label="头像">
                  <div class="avatar-upload-section">
                    <div class="avatar-preview-large" @click="triggerFileInput">
                      <img :src="editForm.avatar" alt="头像预览" />
                      <div class="avatar-upload-overlay">
                        <el-icon :size="32"><Camera /></el-icon>
                        <span>点击更换头像</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref="fileInput"
                      @change="handleFileSelect"
                      accept="image/*"
                      style="display: none;"
                    />
                    <p class="upload-hint">支持 JPG、PNG 格式，文件大小不超过 5MB</p>
                  </div>
                </el-form-item>

                <div class="form-row">
                  <el-form-item label="姓名" required class="form-col">
                    <el-input
                      v-model="editForm.name"
                      placeholder="请输入姓名"
                      size="large"
                      :prefix-icon="User"
                    />
                  </el-form-item>

                  <el-form-item label="角色" required class="form-col">
                    <el-select v-model="editForm.role" placeholder="选择角色" size="large" style="width: 100%">
                      <el-option :value="UserRole.CUSTOMER" :label="USER_ROLE_LABELS[UserRole.CUSTOMER]" />
                      <el-option :value="UserRole.ADMIN" :label="USER_ROLE_LABELS[UserRole.ADMIN]" />
                    </el-select>
                  </el-form-item>
                </div>

                <el-form-item label="手机号">
                  <el-input
                    v-model="editForm.telephone"
                    placeholder="请输入手机号"
                    size="large"
                    :prefix-icon="Phone"
                  />
                </el-form-item>

                <el-form-item label="邮箱">
                  <el-input
                    v-model="editForm.email"
                    placeholder="请输入邮箱"
                    size="large"
                    type="email"
                    :prefix-icon="Message"
                  />
                </el-form-item>

                <el-form-item label="所在地">
                  <el-input
                    v-model="editForm.location"
                    placeholder="请输入所在地"
                    size="large"
                    :prefix-icon="Location"
                  />
                </el-form-item>

                <el-form-item label="修改密码">
                  <el-input
                    v-model="editForm.password"
                    placeholder="留空则不修改密码"
                    size="large"
                    type="password"
                    :prefix-icon="Lock"
                    show-password
                  />
                </el-form-item>

                <el-alert
                  v-if="editError"
                  :title="editError"
                  type="error"
                  :closable="false"
                  show-icon
                  style="margin-bottom: 20px"
                />

                <div class="form-actions">
                  <el-button size="large" @click="cancelEditing" style="width: 150px">
                    取消
                  </el-button>
                  <el-button
                    type="primary"
                    size="large"
                    @click="saveProfile"
                    :loading="isSaving"
                    style="width: 150px"
                  >
                    {{ isSaving ? '保存中...' : '保存更改' }}
                  </el-button>
                </div>
              </el-form>
            </div>
          </div>
        </div>
      </template>
    </div>
  </template>

  <script lang="ts">
  import { defineComponent } from 'vue'
  import { ElMessage } from 'element-plus'
  import { 
    User, Medal, CircleCheck, Clock, School, InfoFilled, Edit, Phone, 
    Message, Location, Camera, Lock, Loading, CircleClose 
  } from '@element-plus/icons-vue'
  import api from '@/api';
  import type { SchoolVerification } from '@/types/api'
  import type { UserInfo, ErrorResponse } from '@/types/api'
  import type { AxiosError } from 'axios'
  import { UserRole, USER_ROLE_LABELS, getRoleLabel as getRoleLabelUtil, normalizeRole } from '@/utils/constants'
  import type { EditForm } from '@/types/api';

  export default defineComponent({
    name: 'ProfilePage',
    components: {
      User, Medal, CircleCheck, Clock, School, InfoFilled, Edit, Phone,
      Message, Location, Camera, Lock, Loading, CircleClose
    },
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
        USER_ROLE_LABELS,
        schoolVerification: null as SchoolVerification | null
      };
    },
    created() {
      this.fetchUserProfile();
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
      goToVerification() {
        this.$router.push('/user/school-verification');
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

        // 检查角色是否发生变化（标准化后比较）
        const currentRole = normalizeRole(this.userProfile.role);
        const newRole = normalizeRole(this.editForm.role);
        const roleChanged = currentRole !== newRole;

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
            // 如果角色发生了变化，需要退出登录
            if (roleChanged) {
              ElMessage.warning({
                message: '角色已更改，需要重新登录',
                duration: 2000,
                onClose: () => {
                  // 清除本地存储的登录信息
                  localStorage.removeItem('token');
                  localStorage.removeItem('username');
                  localStorage.removeItem('role');
                  // 跳转到登录页面
                  this.$router.push('/login');
                }
              });
            } else {
              // 角色未变化，正常更新
              this.isEditing = false;
              await this.fetchUserProfile();
              ElMessage.success('个人信息更新成功');
            }
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
  /* 页面容器 */
  .profile-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 20px 60px;
    position: relative;
  }

  /* 顶部背景装饰 */
  .profile-header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
    z-index: 0;
  }

  /* 加载状态 */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: white;
  }

  .loading-icon {
    animation: rotate 1.5s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .loading-container p {
    font-size: 16px;
    opacity: 0.9;
  }

  /* 错误状态 */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: white;
    text-align: center;
  }

  .error-icon {
    margin-bottom: 20px;
    opacity: 0.9;
  }

  .error-text {
    font-size: 16px;
    margin-bottom: 24px;
    opacity: 0.9;
  }

  /* 主容器 */
  .profile-container {
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* 用户信息卡片 */
  .user-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    margin-bottom: 24px;
    overflow: hidden;
  }

  .user-card-content {
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* 头像区域 */
  .avatar-section {
    margin-bottom: 24px;
  }

  .avatar-wrapper {
    position: relative;
    display: inline-block;
  }

  .user-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 5px solid white;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .avatar-badge {
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* 用户基本信息 */
  .user-basic-info {
    width: 100%;
  }

  .user-name {
    font-size: 32px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }

  .user-username {
    font-size: 16px;
    color: #666;
    margin: 0 0 20px 0;
  }

  .badges-row {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 500;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .role-badge.admin {
    background: linear-gradient(135deg, #ff7043 0%, #ff5722 100%);
  }

  .role-badge.user {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  }

  .verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 500;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  }

  .pending-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 500;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  }

  .verify-btn {
    border-radius: 24px;
    font-weight: 500;
  }

  /* 详细信息卡片 */
  .details-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    padding: 40px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
  }

  .card-header h2 {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }

  /* 查看模式 */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }

  .info-item {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
    transition: all 0.3s;
  }

  .info-item:hover {
    background: #f0f2f5;
    transform: translateY(-2px);
  }

  .info-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .info-value {
    font-size: 16px;
    color: #1a1a1a;
    font-weight: 500;
  }

  /* 编辑模式 */
  .edit-form {
    margin-top: 0;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-col {
    margin-bottom: 0;
  }

  .avatar-upload-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .avatar-preview-large {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    border: 3px solid #e0e0e0;
    transition: all 0.3s;
  }

  .avatar-preview-large:hover {
    border-color: #667eea;
    transform: scale(1.05);
  }

  .avatar-preview-large img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s;
    color: white;
    font-size: 13px;
  }

  .avatar-preview-large:hover .avatar-upload-overlay {
    opacity: 1;
  }

  .upload-hint {
    font-size: 13px;
    color: #999;
    text-align: center;
    margin: 0;
  }

  .form-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
  }

  /* Element Plus 样式覆盖 */
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 0 0 1px #e0e0e0 inset;
    transition: all 0.3s;
  }

  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #667eea inset;
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px #667eea inset;
  }

  :deep(.el-button) {
    border-radius: 10px;
    font-weight: 500;
    transition: all 0.3s;
  }

  :deep(.el-button--primary) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
  }

  :deep(.el-button--primary:hover) {
    background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  :deep(.el-select .el-input__wrapper) {
    border-radius: 10px;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .profile-page {
      padding: 20px 10px 40px;
    }

    .user-card-content {
      padding: 32px 24px;
    }

    .user-name {
      font-size: 24px;
    }

    .details-card {
      padding: 24px 20px;
    }

    .card-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .card-header h2 {
      font-size: 20px;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }

    .form-actions :deep(.el-button) {
      width: 100%;
    }
  }
  </style>
