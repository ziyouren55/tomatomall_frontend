<template>
  <div class="login-container">
    <div class="login-form">
      <h2>登录</h2>
      <div class="form-group">
        <label for="username">用户名</label>
        <input 
          type="text" 
          id="username" 
          v-model="loginForm.username" 
          placeholder="请输入用户名"
        />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input 
          type="password" 
          id="password" 
          v-model="loginForm.password" 
          placeholder="请输入密码"
        />
      </div>
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      <button @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      <div class="form-footer">
        <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

interface LoginForm {
  username: string
  password: string
}

export default defineComponent({
  name: 'LoginPage',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      } as LoginForm,
      errorMessage: '',
      isLoading: false
    }
  },
  methods: {
    ...(mapActions as any)('user', ['login']),
    
    async handleLogin(): Promise<void> {
      // 表单验证
      if (!this.loginForm.username || !this.loginForm.password) {
        this.errorMessage = '请输入用户名和密码'
        return
      }
      
      this.isLoading = true
      this.errorMessage = ''
      
      try {
        const loginAction = this.login as any
        const response = await loginAction({
          username: this.loginForm.username,
          password: this.loginForm.password
        })
        
        if (response && response.code === '200') {
          // 保存用户名到本地存储，方便获取用户信息
          localStorage.setItem('username', this.loginForm.username)
          
          // 检查是否有重定向路径（从路由守卫保存的）
          const redirectPath = sessionStorage.getItem('redirectPath') || '/'
          sessionStorage.removeItem('redirectPath')
          
          // 登录成功，跳转到目标页面或首页
          this.$router.push(redirectPath).then(() => {
            // 触发导航栏状态更新
            window.dispatchEvent(new Event('loginStatusChanged'))
          })
        } else {
          this.errorMessage = response?.msg || '登录失败'
        }
      } catch (error: any) {
        this.errorMessage = error.response?.data?.msg || error.message || '登录失败，请稍后再试'
        console.error('登录错误:', error)
      } finally {
        this.isLoading = false
      }
    }
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  width: 100%;
  max-width: 400px;
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

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
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
