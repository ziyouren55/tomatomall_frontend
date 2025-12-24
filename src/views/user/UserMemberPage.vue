<template>
  <div class="page">
    <div class="content">
      <section v-if="nonMember" class="card non-member">
        <div class="title">
          <span class="dot"></span>
          <h1>您还不是会员</h1>
      </div>
        <p class="sub">完成下单或联系客服开通后可查看会员权益与积分。</p>
        <div class="non-member-actions">
          <button class="refresh" @click="refreshAll" :disabled="loading">
            <RefreshCcw class="w-4 h-4" />
            <span>{{ loading ? '刷新中...' : '重新检测' }}</span>
          </button>
                </div>
      </section>
              
      <section v-else class="card overview">
        <div class="overview-left">
          <div class="title">
            <span class="dot"></span>
            <h1>我的会员</h1>
                      </div>
          <p class="sub">查看等级、积分与权益</p>
          <div class="current">
            <div class="badge">
              <Crown class="icon" />
              <span>{{ memberInfo?.level?.levelName || '铜牌会员' }}</span>
                      </div>
            <div class="discount">折扣 {{ discountLabel }}</div>
                    </div>
          <div class="progress">
            <div class="progress-head">
              <span>升级进度</span>
              <span v-if="nextLevel">距 {{ nextLevel?.levelName }} 还差 {{ leftPoints }} 分</span>
              <span v-else>已是最高等级</span>
                      </div>
            <div class="progress-bar">
              <div class="progress-inner" :style="{ width: progressValue + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="overview-right">
          <div class="metric">
            <p class="label">当前积分</p>
            <p class="value">{{ pointsInfo?.currentPoints ?? 0 }}</p>
              </div>
          <div class="divider"></div>
          <div class="metric">
            <p class="label">累计积分</p>
            <p class="value">{{ pointsInfo?.totalPoints ?? 0 }}</p>
                  </div>
          <button class="refresh" @click="refreshAll" :disabled="loading">
            <RefreshCcw class="w-4 h-4" />
            <span>{{ loading ? '刷新中...' : '刷新' }}</span>
          </button>
          <!-- (school verification UI removed from member page) -->
                  </div>
      </section>
                
      <div v-if="!nonMember" class="grid">
        <!-- 等级与权益 -->
        <section class="card levels">
          <div class="section-head">
            <h2>会员等级与权益</h2>
            <p>了解各等级的门槛与折扣</p>
                  </div>
          <div class="level-list">
            <div
              v-for="level in levels"
              :key="level.id"
              class="level-item"
              :class="level.id === pointsInfo?.currentLevelId ? 'active' : ''"
            >
              <div class="level-top">
                <div class="level-name">
                  <Crown class="icon crown" />
                  <span>{{ level.levelName }}</span>
                </div>
                <span class="tag">
                  {{ level.id === pointsInfo?.currentLevelId ? '当前等级' : `门槛 ${level.pointsRequired} 分` }}
                </span>
              </div>
              <p class="text">折扣：{{ Math.round(level.discountRate * 100) }}%</p>
              <p class="desc">{{ level.description || '暂无描述' }}</p>
            </div>
          </div>
        </section>

        <!-- 积分记录 -->
        <section class="card history">
          <div class="section-head">
            <h2>积分记录</h2>
            <p>最近的积分变更</p>
          </div>
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
              </div>
          <div v-else-if="pointsHistory.length === 0" class="empty">暂无积分记录</div>
          <div v-else class="history-list">
                <div 
                  v-for="record in pointsHistory" 
                  :key="record.id" 
              class="history-item"
                >
              <div>
                <div class="history-top">
                  <span class="type">{{ record.recordType }}</span>
                  <span class="time">{{ record.createTime }}</span>
                </div>
                <p class="desc">{{ record.description || '无描述' }}</p>
              </div>
              <div
                class="amount"
                :class="record.pointsChange >= 0 ? 'plus' : 'minus'"
              >
                {{ record.pointsChange >= 0 ? '+' : '' }}{{ record.pointsChange }}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Crown, RefreshCcw } from 'lucide-vue-next'
import api from '@/api'
import type { MemberInfo, MemberLevel, MemberPoints, PointsHistory } from '@/api/modules/member'

const loading = ref<boolean>(false)
const memberInfo = ref<MemberInfo | null>(null)
const pointsInfo = ref<MemberPoints | null>(null)
const levels = ref<MemberLevel[]>([])
const pointsHistory = ref<PointsHistory[]>([])
const nonMember = ref<boolean>(false)

const discountLabel = computed(() => {
  const rate = memberInfo.value?.level?.discountRate
  if (!rate && rate !== 0) return '无折扣'
  return `${Math.round(rate * 100)}%`
})

const nextLevel = computed(() => {
  if (!levels.value.length || !pointsInfo.value) return null
  const sorted = [...levels.value].sort((a, b) => (a.pointsRequired ?? 0) - (b.pointsRequired ?? 0))
  return sorted.find(l => (pointsInfo.value?.totalPoints ?? 0) < (l.pointsRequired ?? 0)) || null
})

const progressValue = computed(() => {
  if (!pointsInfo.value) return 0
  const total = pointsInfo.value.totalPoints ?? 0
  const currentReq = memberInfo.value?.level?.pointsRequired ?? 0
  if (!nextLevel.value) return 100
  const need = (nextLevel.value.pointsRequired ?? 0) - currentReq
  if (need <= 0) return 100
  const gained = total - currentReq
  const percent = Math.min(100, Math.max(0, Math.round((gained / need) * 100)))
  return percent
})

const leftPoints = computed(() => {
  if (!pointsInfo.value || !nextLevel.value) return 0
  const left = (nextLevel.value.pointsRequired ?? 0) - (pointsInfo.value.totalPoints ?? 0)
  return left < 0 ? 0 : left
})


const fetchMemberInfo = async () => {
  const res = await api.member.getMemberInfo()
  memberInfo.value = res.data
  pointsInfo.value = res.data?.points || null
}

const fetchLevels = async () => {
  const res = await api.member.getAllLevelsForUser()
  levels.value = res.data || []
}

const fetchPointsHistory = async () => {
  const res = await api.member.getPointsHistory()
  pointsHistory.value = res.data || []
}

// 兼容旧数据：若缺少等级或积分，则调用后端修复为一级会员，并回填前端状态
const ensureMemberLevel = async () => {
  const isMember = memberInfo.value?.isMember ?? !!memberInfo.value?.level
  const missingLevel = !memberInfo.value?.level
  const missingPoints = !pointsInfo.value
  if (isMember && (missingLevel || missingPoints)) {
    try {
      const repaired = await api.member.repairMember()
      // 修复后再拉一次会员信息，确保状态一致
      const refreshed = await api.member.getMemberInfo()
      memberInfo.value = refreshed.data
      pointsInfo.value = refreshed.data?.points || null

      if (!memberInfo.value?.level) {
        const fallback = repaired.data || levels.value.find(l => l.memberLevel === 1) || levels.value.find(l => l.id === 1)
        memberInfo.value.level = fallback || null
      }

      if (!pointsInfo.value) {
        pointsInfo.value = {
          userId: (memberInfo.value as any)?.userId || 0,
          currentPoints: 0,
          totalPoints: 0,
          currentLevelId: 1,
          currentLevelName: '铜牌会员'
        }
      }
    } catch (e) {
      console.warn('补写默认会员等级失败', e)
    }
  }
}

const refreshAll = async () => {
  loading.value = true
  try {
    await fetchLevels()
    await fetchMemberInfo()
    const isMember = memberInfo.value?.isMember ?? !!memberInfo.value?.level
    nonMember.value = !isMember
    if (nonMember.value) {
      pointsInfo.value = null
      pointsHistory.value = []
      return
    }
    await ensureMemberLevel()
    await fetchPointsHistory()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await refreshAll()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 32px 16px 48px;
}

.content {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e9ecf3;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  padding: 20px 22px;
}

.overview {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 12px;
}

.overview-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title h1 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.sub {
  color: #6b7280;
  font-size: 14px;
}

.current {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  color: #111827;
  font-weight: 600;
}

.badge .icon {
  width: 18px;
  height: 18px;
  color: #f59e0b;
}

.discount {
  font-size: 14px;
  color: #4b5563;
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  padding: 6px 10px;
  border-radius: 10px;
}

.progress {
  margin-top: 4px;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #eef2f7;
  border-radius: 10px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(135deg, #2563eb, #22c55e);
  transition: width 0.3s ease;
}

.overview-right {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  align-items: center;
}

.metric {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}

.metric .label {
  font-size: 13px;
  color: #6b7280;
}

.metric .value {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.divider {
  height: 100%;
  width: 1px;
  background: #e5e7eb;
  margin: 0 auto;
}

.refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.refresh:hover:not(:disabled) {
  background: #1d4ed8;
}

.refresh:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 12px;
}

.section-head {
  margin-bottom: 12px;
}

.section-head h2 {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.section-head p {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.non-member {
  text-align: left;
}

.non-member-actions {
  margin-top: 12px;
}

.level-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.level-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  background: #f9fafb;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.level-item.active {
  border-color: #2563eb;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.12);
  background: #eef2ff;
}

.level-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.level-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #0f172a;
}

.level-name .crown {
  width: 18px;
  height: 18px;
  color: #f59e0b;
}

.tag {
  background: #e5e7eb;
  color: #374151;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
}

.level-item.active .tag {
  background: #dbeafe;
  color: #1d4ed8;
}

.text {
  font-size: 13px;
  color: #4b5563;
  margin-top: 6px;
}

.desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
}

.spinner {
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  animation: spin 1s linear infinite;
}

.empty {
  text-align: center;
  color: #6b7280;
  padding: 18px 0;
  font-size: 13px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  background: #f9fafb;
}

.history-top {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.history-top .type {
  background: #e0f2fe;
  color: #0369a1;
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 600;
}

.time {
  color: #9ca3af;
}

.history-item .desc {
  margin-top: 4px;
}

.amount {
  font-weight: 700;
  font-size: 15px;
}

.amount.plus {
  color: #16a34a;
}

.amount.minus {
  color: #dc2626;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 960px) {
  .overview {
    grid-template-columns: 1fr;
  }
  .overview-right {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .level-list {
    grid-template-columns: 1fr;
  }
}
</style>