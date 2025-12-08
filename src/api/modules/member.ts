import request from '../config/request'
import { ApiResponse } from '@/types/api'

/**
 * 会员管理相关 API
 * 包含管理员和用户两套 API
 */

export interface MemberLevel {
    id: number
    memberLevel: number
    levelName: string
    pointsRequired: number
    discountRate: number
    description?: string
    isActive: boolean
    [key: string]: any
}

export interface MemberInfo {
    points: MemberPoints
    level: MemberLevel
    isMember?: boolean
    memberLevelId?: number
    [key: string]: any
}

export interface MemberPoints {
    userId: number
    currentPoints: number
    totalPoints: number
    currentLevelId: number
    currentLevelName?: string
    updateTime?: string
}

export interface PointsHistory {
    id: number
    userId: number
    pointsChange: number
    recordType: string
    referenceId?: number
    description?: string
    createTime?: string
    [key: string]: any
}

export interface AdjustmentData {
    userId: number
    points: number
    description?: string
    [key: string]: any
}

const memberApi = {
    // ========== 管理员会员 API ==========
    // 获取所有会员等级
    getAllLevels(): Promise<ApiResponse<MemberLevel[]>> {
        return request.get('/admin/member/levels')
    },

    // 根据ID获取会员等级
    getLevelById(levelId: number): Promise<ApiResponse<MemberLevel>> {
        return request.get(`/admin/member/levels/${levelId}`)
    },

    // 创建会员等级
    createLevel(levelData: Partial<MemberLevel>): Promise<ApiResponse<MemberLevel>> {
        return request.post('/admin/member/levels', levelData)
    },

    // 更新会员等级
    updateLevel(levelId: number, levelData: Partial<MemberLevel>): Promise<ApiResponse<MemberLevel>> {
        return request.put(`/admin/member/levels/${levelId}`, levelData)
    },

    // 删除会员等级
    deleteLevel(levelId: number): Promise<ApiResponse<void>> {
        return request.delete(`/admin/member/levels/${levelId}`)
    },

    // 手动升级用户会员等级
    upgradeUserLevel(userId: number, targetLevelId: number): Promise<ApiResponse<void>> {
        return request.post(`/admin/member/upgrade/${userId}?targetLevelId=${targetLevelId}`)
    },

    // 查看用户积分记录
    getUserPointsHistory(userId: number): Promise<ApiResponse<PointsHistory[]>> {
        return request.get(`/admin/member/points/${userId}`)
    },

    // 手动调整用户积分
    adjustUserPoints(adjustmentData: AdjustmentData): Promise<ApiResponse<void>> {
        return request.post('/admin/member/points/adjust', adjustmentData)
    },

    // ========== 用户会员 API ==========
    // 获取用户会员信息
    getMemberInfo(): Promise<ApiResponse<MemberInfo>> {
        return request.get('/member/info')
    },

    // 获取用户当前会员等级
    getMemberLevel(): Promise<ApiResponse<MemberLevel>> {
        return request.get('/member/level')
    },

    // 获取所有会员等级列表
    getAllLevelsForUser(): Promise<ApiResponse<MemberLevel[]>> {
        return request.get('/member/levels')
    },

    // 获取用户当前积分
    getUserPoints(): Promise<ApiResponse<MemberPoints>> {
        return request.get('/member/points')
    },

    // 获取用户积分历史记录
    getPointsHistory(): Promise<ApiResponse<PointsHistory[]>> {
        return request.get('/member/points/history')
    },

    // 兼容：修复缺少等级的会员
    repairMember(): Promise<ApiResponse<MemberLevel>> {
        return request.post('/member/repair')
    }
}

export default memberApi




