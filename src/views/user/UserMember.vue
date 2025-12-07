<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">会员管理系统</h1>
        <p class="text-gray-600">管理用户会员等级和积分</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 用户列表 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900">用户列表</h2>
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜索用户..."
                    v-model="searchTerm"
                    class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div class="space-y-3">
                <div 
                  v-for="user in filteredUsers"
                  :key="user.id"
                  @click="handleUserClick(user)"
                  :class="[
                    'p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md',
                    selectedUser?.id === user.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User class="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 class="font-semibold text-gray-900">{{ user.username }}</h3>
                        <p class="text-sm text-gray-600">{{ user.email }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white',
                        getLevelColor(user.currentLevelId || 1)
                      ]">
                        <Crown class="w-3 h-3 mr-1" />
                        {{ user.levelName }}
                      </div>
                      <p class="text-sm text-gray-600 mt-1">积分: {{ user.currentPoints }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户详情 -->
        <div class="space-y-6">
          <template v-if="selectedUser">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">用户详情</h3>
              <div v-if="loading" class="flex items-center justify-center h-32">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <div v-else-if="userDetails" class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User class="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900">{{ userDetails.username }}</h4>
                    <p class="text-sm text-gray-600">{{ userDetails.email }}</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center p-3 bg-blue-50 rounded-lg">
                    <Coins class="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p class="text-sm text-gray-600">当前积分</p>
                    <p class="text-lg font-semibold text-blue-600">{{ userDetails.currentPoints }}</p>
                  </div>
                  <div class="text-center p-3 bg-green-50 rounded-lg">
                    <Crown class="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p class="text-sm text-gray-600">累计积分</p>
                    <p class="text-lg font-semibold text-green-600">{{ userDetails.totalPoints }}</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <button 
                    @click="showLevelModal = true"
                    class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    升级会员等级
                  </button>
                  <button 
                    @click="showPointsModal = true"
                    class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    调整积分
                  </button>
                </div>
              </div>
            </div>

            <!-- 积分历史 -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <History class="w-5 h-5 mr-2" />
                积分记录
              </h3>
              <div v-if="loading" class="flex items-center justify-center h-32">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
              <div v-else class="space-y-3 max-h-64 overflow-y-auto">
                <div 
                  v-for="record in pointsHistory" 
                  :key="record.id" 
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <span :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getRecordTypeColor(record.recordType)
                      ]">
                        {{ record.recordType }}
                      </span>
                      <span :class="[
                        'font-semibold',
                        record.pointsChange > 0 ? 'text-green-600' : 'text-red-600'
                      ]">
                        {{ record.pointsChange > 0 ? '+' : '' }}{{ record.pointsChange }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600">{{ record.description }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ record.createTime }}</p>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <div v-else class="bg-white rounded-lg shadow-sm p-6 text-center">
            <User class="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-500">请选择一个用户查看详情</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 等级升级模态框 -->
    <div v-if="showLevelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">升级会员等级</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">当前用户</label>
            <p class="text-gray-900">{{ selectedUser?.username }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">当前等级</label>
            <p class="text-gray-900">{{ selectedUser?.levelName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">目标等级</label>
            <select v-model="targetLevelId" class="w-full p-2 border border-gray-300 rounded-md">
              <option v-for="level in levels" :key="level.id" :value="level.id">
                {{ level.levelName }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="showLevelModal = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button 
            @click="confirmLevelUpgrade"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            确认升级
          </button>
        </div>
      </div>
    </div>

    <!-- 积分调整模态框 -->
    <div v-if="showPointsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">调整用户积分</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">当前用户</label>
            <p class="text-gray-900">{{ selectedUser?.username }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">当前积分</label>
            <p class="text-gray-900">{{ selectedUser?.currentPoints }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">积分变动</label>
            <input 
              type="number" 
              v-model="pointsChange"
              placeholder="正数为增加，负数为减少"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">变动原因</label>
            <textarea 
              v-model="pointsReason"
              placeholder="请输入积分调整原因"
              class="w-full p-2 border border-gray-300 rounded-md h-20 resize-none"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="showPointsModal = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button 
            @click="confirmPointsAdjustment"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            确认调整
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { User, Crown, Coins, History, Search } from 'lucide-vue-next'
import type { User as UserType } from '@/types/api'
import type { MemberLevel, PointsHistory } from '@/api/modules/member'
import api from '@/api'

// 响应式数据
const users = ref<UserType[]>([])
const levels = ref<MemberLevel[]>([])
const selectedUser = ref<UserType | null>(null)
const userDetails = ref<UserType | null>(null)
const pointsHistory = ref<PointsHistory[]>([])
const loading = ref<boolean>(false)
const showLevelModal = ref<boolean>(false)
const showPointsModal = ref<boolean>(false)
const searchTerm = ref<string>('')
const targetLevelId = ref<number | null>(null)
const pointsChange = ref<number | null>(null)
const pointsReason = ref<string>('')

// 计算属性
const filteredUsers = computed(() => {
  return users.value.filter(user => 
    user.username.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.value.toLowerCase()))
  )
})

// 方法
const getLevelColor = (levelId: number) => {
  const colors: Record<number, string> = {
    1: 'bg-amber-600',
    2: 'bg-gray-400',
    3: 'bg-yellow-500',
    4: 'bg-purple-600'
  }
  return colors[levelId] || 'bg-gray-400'
}

const getRecordTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'PURCHASE': 'bg-green-100 text-green-800',
    'REVIEW': 'bg-blue-100 text-blue-800',
    'EXCHANGE': 'bg-red-100 text-red-800',
    'FORUM_POST': 'bg-purple-100 text-purple-800',
    'SYSTEM': 'bg-yellow-100 text-yellow-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const handleUserClick = async (user: UserType) => {
  selectedUser.value = user
  loading.value = true
  
  // 模拟获取用户详情和积分历史
  setTimeout(() => {
    userDetails.value = {
      ...user,
      memberInfo: {
        createTime: '2024-01-15',
        updateTime: '2024-06-20'
      }
    }

    const mockHistory: PointsHistory[] = [
      { id: 1, userId: user.id, pointsChange: 100, recordType: 'PURCHASE', description: '购买商品获得积分', createTime: '2024-06-20' },
      { id: 2, userId: user.id, pointsChange: 50, recordType: 'REVIEW', description: '发表评价获得积分', createTime: '2024-06-18' },
      { id: 3, userId: user.id, pointsChange: -200, recordType: 'EXCHANGE', description: '兑换优惠券', createTime: '2024-06-15' },
      { id: 4, userId: user.id, pointsChange: 150, recordType: 'FORUM_POST', description: '论坛发帖获得积分', createTime: '2024-06-12' },
      { id: 5, userId: user.id, pointsChange: 300, recordType: 'SYSTEM', description: '系统奖励积分', createTime: '2024-06-10' },
    ]
    
    pointsHistory.value = mockHistory
    loading.value = false
  }, 500)
}

const confirmLevelUpgrade = async () => {
  if (!selectedUser.value || !targetLevelId.value) return
  
  try {
    await api.member.upgradeUserLevel(selectedUser.value.id, targetLevelId.value)
    showLevelModal.value = false
    // 刷新用户列表
    // TODO: 刷新用户数据
    targetLevelId.value = null
  } catch (error) {
    console.error('升级用户等级失败:', error)
    alert('升级失败，请稍后重试')
  }
}

const confirmPointsAdjustment = () => {
  showPointsModal.value = false
  // 这里调用积分调整接口
  console.log('调整积分:', {
    username: selectedUser.value?.username,
    pointsChange: pointsChange.value,
    reason: pointsReason.value
  })
  pointsChange.value = null
  pointsReason.value = ''
}

// 生命周期钩子
onMounted(() => {
  const mockUsers = [
    { id: 1, username: 'alice', email: 'alice@example.com', currentPoints: 1200, totalPoints: 2500, currentLevelId: 2, levelName: '银牌会员' },
    { id: 2, username: 'bob', email: 'bob@example.com', currentPoints: 800, totalPoints: 1600, currentLevelId: 1, levelName: '铜牌会员' },
    { id: 3, username: 'charlie', email: 'charlie@example.com', currentPoints: 2800, totalPoints: 5000, currentLevelId: 3, levelName: '金牌会员' },
    { id: 4, username: 'diana', email: 'diana@example.com', currentPoints: 500, totalPoints: 800, currentLevelId: 1, levelName: '铜牌会员' },
    { id: 5, username: 'eve', email: 'eve@example.com', currentPoints: 5200, totalPoints: 8000, currentLevelId: 4, levelName: '钻石会员' },
  ]

  const mockLevels: MemberLevel[] = [
    { id: 1, memberLevel: 1, levelName: '铜牌会员', pointsRequired: 0, discountRate: 0.95, isActive: true },
    { id: 2, memberLevel: 2, levelName: '银牌会员', pointsRequired: 1000, discountRate: 0.90, isActive: true },
    { id: 3, memberLevel: 3, levelName: '金牌会员', pointsRequired: 2500, discountRate: 0.85, isActive: true },
    { id: 4, memberLevel: 4, levelName: '钻石会员', pointsRequired: 5000, discountRate: 0.80, isActive: true },
  ]

  users.value = mockUsers
  levels.value = mockLevels
})
</script>

<style scoped>
/* 如果需要额外的自定义样式，可以在这里添加 */
</style>