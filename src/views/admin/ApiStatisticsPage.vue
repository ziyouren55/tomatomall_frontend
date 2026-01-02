<template>
  <div class="api-statistics-page">
    <div class="header">
      <h2>API接口统计</h2>
      <div class="date-selector">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="loadData"
          :clearable="false"
        />
      </div>
    </div>

    <div class="statistics-content">
      <!-- 统计概览 -->
      <div class="overview-cards">
        <el-card class="stat-card">
          <div class="stat-value">{{ totalCalls }}</div>
          <div class="stat-label">总调用次数</div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-value">{{ avgSuccessRate.toFixed(1) }}%</div>
          <div class="stat-label">平均成功率</div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-value">{{ avgDuration.toFixed(0) }}ms</div>
          <div class="stat-label">平均响应时间</div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-value">{{ apiCount }}</div>
          <div class="stat-label">接口数量</div>
        </el-card>
      </div>

      <el-row :gutter="20">
        <!-- API统计表格 -->
        <el-col :span="14">
          <el-card title="API调用统计详情">
            <el-table
              :data="apiStatistics"
              stripe
              :loading="loading"
              height="500"
              size="small"
            >
              <el-table-column
                prop="apiName"
                label="接口名称"
                width="200"
                show-overflow-tooltip
              />
              <el-table-column
                prop="totalCalls"
                label="总调用"
                width="100"
                sortable
              />
              <el-table-column
                prop="successRate"
                label="成功率"
                width="100"
                sortable
              >
                <template #default="scope">
                  <span :class="getSuccessRateClass(scope.row.successRate)">
                    {{ scope.row.successRate.toFixed(1) }}%
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="avgDuration"
                label="平均耗时(ms)"
                width="120"
                sortable
              >
                <template #default="scope">
                  {{ scope.row.avgDuration.toFixed(0) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="errorCalls"
                label="错误次数"
                width="100"
              />
            </el-table>
          </el-card>
        </el-col>

        <!-- 访问量排行榜 -->
        <el-col :span="10">
          <el-card title="访问量排行榜">
            <div class="ranking-list" v-loading="loading">
              <div
                v-for="(item, index) in apiRanking"
                :key="item.apiName"
                class="ranking-item"
              >
                <div class="ranking-info">
                  <div class="rank-number">{{ index + 1 }}</div>
                  <div class="api-info">
                    <div class="api-name">{{ item.apiName }}</div>
                    <div class="api-stats">
                      {{ item.calls }} 次调用
                      <span class="percentage">({{ item.percentage.toFixed(1) }}%)</span>
                    </div>
                  </div>
                </div>
                <div class="progress-bar">
                  <el-progress
                    :percentage="item.percentage"
                    :show-text="false"
                    :stroke-width="8"
                    :color="getProgressColor(index)"
                  />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 响应时间趋势图 -->
      <el-card title="响应时间分析" style="margin-top: 20px;">
        <div class="response-time-chart">
          <div class="chart-placeholder">
            <div class="chart-item" v-for="item in apiStatistics.slice(0, 10)" :key="item.apiName">
              <div class="bar-container">
                <div
                  class="time-bar"
                  :style="{ width: getBarWidth(item.avgDuration) + '%' }"
                >
                  <span class="time-text">{{ item.avgDuration.toFixed(0) }}ms</span>
                </div>
              </div>
              <div class="api-label">{{ item.apiName.split('.').pop() }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import statisticsApi, { ApiStatisticsVO, ApiRankingVO } from '@/api/modules/statistics'

// 响应式数据
const selectedDate = ref(new Date().toISOString().split('T')[0])
const apiStatistics = ref<ApiStatisticsVO[]>([])
const apiRanking = ref<ApiRankingVO[]>([])
const loading = ref(false)

// 计算属性
const totalCalls = computed(() => {
  return apiStatistics.value.reduce((sum, item) => sum + item.totalCalls, 0)
})

const avgSuccessRate = computed(() => {
  if (apiStatistics.value.length === 0) return 0
  const total = apiStatistics.value.reduce((sum, item) => sum + item.successRate, 0)
  return total / apiStatistics.value.length
})

const avgDuration = computed(() => {
  if (apiStatistics.value.length === 0) return 0
  const total = apiStatistics.value.reduce((sum, item) => sum + item.avgDuration, 0)
  return total / apiStatistics.value.length
})

const apiCount = computed(() => apiStatistics.value.length)

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 并行加载统计数据和排行榜
    const [statsResponse, rankingResponse] = await Promise.all([
      statisticsApi.getApiStatistics(selectedDate.value, undefined, 50),
      statisticsApi.getApiRanking(selectedDate.value, 20)
    ])

    if (statsResponse.code === '200') {
      apiStatistics.value = statsResponse.data || []
    }

    if (rankingResponse.code === '200') {
      apiRanking.value = rankingResponse.data || []
    }
  } catch (error) {
    console.error('Failed to load API statistics:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const getSuccessRateClass = (rate: number) => {
  if (rate >= 99) return 'success-rate-excellent'
  if (rate >= 95) return 'success-rate-good'
  if (rate >= 90) return 'success-rate-warning'
  return 'success-rate-error'
}

const getProgressColor = (index: number) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  return colors[index % colors.length]
}

const getBarWidth = (duration: number) => {
  // 计算响应时间的相对宽度（基于最大值）
  const maxDuration = Math.max(...apiStatistics.value.map(item => item.avgDuration))
  return maxDuration > 0 ? (duration / maxDuration) * 100 : 0
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.api-statistics-page {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.date-selector {
  display: flex;
  align-items: center;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.ranking-list {
  max-height: 500px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.rank-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.api-info {
  flex: 1;
}

.api-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.api-stats {
  font-size: 12px;
  color: #666;
}

.percentage {
  color: #409EFF;
  font-weight: 500;
}

.progress-bar {
  width: 100px;
  margin-left: 12px;
}

.response-time-chart {
  padding: 20px 0;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.bar-container {
  flex: 1;
  height: 30px;
  background: #f5f5f5;
  border-radius: 4px;
  position: relative;
}

.time-bar {
  height: 100%;
  background: linear-gradient(90deg, #67C23A, #E6A23C, #F56C6C);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  transition: width 0.3s ease;
}

.time-text {
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.api-label {
  width: 150px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

/* 成功率颜色样式 */
.success-rate-excellent {
  color: #67C23A;
  font-weight: 500;
}

.success-rate-good {
  color: #E6A23C;
  font-weight: 500;
}

.success-rate-warning {
  color: #F56C6C;
  font-weight: 500;
}

.success-rate-error {
  color: #F56C6C;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .chart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .api-label {
    width: auto;
    text-align: left;
  }
}
</style>
