import request from '../config/request'
import { ApiResponse } from '@/types/api'

/**
 * API统计相关类型
 */
export interface ApiStatisticsVO {
  apiName: string
  totalCalls: number
  successCalls: number
  errorCalls: number
  totalDuration: number
  avgDuration: number
  successRate: number
  date: string
}

export interface ApiRankingVO {
  apiName: string
  calls: number
  rank: number
  percentage: number
  date: string
}

const statisticsApi = {
    // 获取API统计数据
    getApiStatistics(
        date?: string,
        apiName?: string,
        limit: number = 20
    ): Promise<ApiResponse<ApiStatisticsVO[]>> {
        const params: any = { limit };
        if (date) params.date = date;
        if (apiName) params.apiName = apiName;

        return request.get('/statistics/api-stats', { params });
    },

    // 获取API访问量排行榜
    getApiRanking(
        date?: string,
        topN: number = 20
    ): Promise<ApiResponse<ApiRankingVO[]>> {
        const params: any = { topN };
        if (date) params.date = date;

        return request.get('/statistics/api-ranking', { params });
    },

    // 获取API统计汇总数据（日期范围）
    getApiStatisticsSummary(
        startDate?: string,
        endDate?: string
    ): Promise<ApiResponse<ApiStatisticsVO[]>> {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        return request.get('/statistics/api-summary', { params });
    }
}

export default statisticsApi
