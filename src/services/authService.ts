import { clearAuth, getToken } from '@/utils/storage'
import api from '@/api'
import { ElMessageBox, ElMessage } from 'element-plus'
import { registerNotificationComponent } from './notificationComponentRegistry'

// 注册单点登录通知组件（延迟加载）
async function registerSingleLoginComponent() {
  try {
    const singleLoginComp = (await import('@/components/business/notifications/SingleLoginNotification.vue')).default
    registerNotificationComponent('FORCE_LOGOUT', singleLoginComp)
  } catch (e) {
    console.warn('registerSingleLoginComponent failed', e)
  }
}

/**
 * 认证服务 - 处理登录、登出、单点登录等认证相关逻辑
 */
export class AuthService {
  // WebSocket连接建立的时间戳，用于过滤刚连接时的误报通知
  private websocketConnectedTime: number = 0;

  /**
   * 普通登出
   */
  async logout(): Promise<void> {
    try {
      // 调用后端登出API（如果需要）
      try {
        await api.user.logout()
      } catch (e) {
        console.warn('Backend logout failed, proceeding with frontend logout:', e)
      }

      // 清理认证状态
      await this.clearAuthState()

      // 显示登出消息
      ElMessage.success('已安全登出')

      // 跳转到登录页
      this.redirectToLogin()

    } catch (error) {
      console.error('Logout failed:', error)
      // 降级方案：直接清理状态并跳转
      await this.clearAuthState()
      this.redirectToLogin()
    }
  }

  /**
   * 单点登录强制登出
   */
  async forceLogout(reason?: string): Promise<void> {
    try {
      console.warn('Single login detected, forcing logout...')

      // 立即清理认证状态，防止状态混乱
      await this.clearAuthState()

      // 显示警告对话框
      const message = reason || '您的账号在其他设备上登录，您已被迫下线'

      await ElMessageBox.alert(
        message,
        '账号安全提醒',
        {
          confirmButtonText: '立即重新登录',
          type: 'warning',
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
        }
      )

      // 跳转到登录页
      this.redirectToLogin()

    } catch (dialogError) {
      console.warn('Dialog failed, using direct logout:', dialogError)
      // 如果对话框失败，直接跳转
      this.redirectToLogin()
    }
  }

  /**
   * 处理单点登录通知
   * 使用定向发送机制，通知只会发送给目标用户，无需验证targetUserId
   * 添加智能过滤：连接建立后的1秒内忽略通知，避免自己顶替自己的情况
   */
  async handleSingleLoginNotification(notification: any): Promise<void> {
    const now = Date.now();
    const timeSinceConnection = now - this.websocketConnectedTime;

    // 如果WebSocket连接建立后不到1秒，就忽略这个通知
    // 这通常是自己刚刚登录导致的误报
    if (timeSinceConnection < 1000) {
      console.warn('Ignoring single login notification received too soon after connection establishment');
      return;
    }

    // 由于使用定向发送机制，通知只会发送给目标用户
    // 无需验证targetUserId，直接处理
    console.warn('Processing single login notification');
    await this.forceLogout(notification.message);
  }

  /**
   * 标记WebSocket连接已建立
   */
  markWebSocketConnected(): void {
    this.websocketConnectedTime = Date.now();
  }

  /**
   * 清理认证状态
   */
  async clearAuthState(): Promise<void> {
    // 使用统一的清理函数
    clearAuth()

    // 额外清理其他认证相关数据
    localStorage.removeItem('username')
    localStorage.removeItem('userInfo')

    // 如果有 Vuex store，需要清理 store 状态
    try {
      const store = (window as any).$store
      if (store) {
        store.commit('user/LOGOUT')
      }
    } catch (e) {
      console.warn('Failed to clear store state:', e)
    }

    // 停止通知服务
    try {
      const { stopNotificationService } = await import('./notificationService')
      stopNotificationService()
    } catch (e) {
      console.warn('Failed to stop notification service:', e)
    }
  }

  /**
   * 跳转到登录页
   */
  redirectToLogin(): void {
    try {
      const router = (window as any).$router
      if (router) {
        // 先跳转到登录页
        router.push('/login').then(() => {
          // 强制刷新页面，确保所有状态都被清理
          setTimeout(() => {
            window.location.reload()
          }, 100)
        })
      } else {
        // 降级方案：直接跳转
        window.location.href = '/login'
      }
    } catch (e) {
      console.error('Failed to redirect to login page:', e)
      // 最后的降级方案
      window.location.href = '/login'
    }
  }

  /**
   * 检查认证状态
   */
  isAuthenticated(): boolean {
    return !!getToken()
  }

  /**
   * 初始化认证服务
   */
  async init(): Promise<void> {
    // 注册单点登录通知组件
    await registerSingleLoginComponent()
  }
}

// 导出单例实例
export const authService = new AuthService()
