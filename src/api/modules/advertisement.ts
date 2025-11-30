import request from '../config/request'
import { ApiResponse, Advertisement, AdvertisementFormData } from '@/types/api'

/**
 * 广告相关 API
 */
export default {
    // 获取所有广告
    getAllAdvertisements(): Promise<ApiResponse<Advertisement[]>> {
        return request.get('/advertisements')
    },

    // 创建新广告
    createAdvertisement(advertisementData: AdvertisementFormData): Promise<ApiResponse<Advertisement>> {
        return request.post('/advertisements', advertisementData)
    },

    // 更新广告
    updateAdvertisement(advertisementData: AdvertisementFormData): Promise<ApiResponse<Advertisement>> {
        return request.put('/advertisements', advertisementData)
    },

    // 删除广告
    deleteAdvertisement(id: number): Promise<ApiResponse<any>> {
        return request.delete(`/advertisements/${id}`)
    }
}

