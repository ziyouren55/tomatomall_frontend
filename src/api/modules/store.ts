import request from '../config/request'
import { ApiResponse } from '@/types/api'

export interface Store {
    id?: number
    name: string
    description?: string
    status?: string
    merchantId?: number
    createTime?: string
    [key: string]: any
}

const storeApi = {
    // 获取当前商家的店铺（分页）
    getMerchantStores(page: number = 0, pageSize: number = 20): Promise<ApiResponse<any>> {
        return request.get('/stores/merchant', { params: { page, pageSize } })
    },
    // 获取所有店铺（管理员用） - 后端若支持 /stores 列表接口则可使用
    getAllStores(page: number = 0, pageSize: number = 1000): Promise<ApiResponse<any>> {
        return request.get('/stores', { params: { page, pageSize } })
    },

    // 根据ID获取店铺
    getStoreById(id: number): Promise<ApiResponse<Store>> {
        return request.get(`/stores/${id}`)
    },

    // 创建店铺
    createStore(store: Store): Promise<ApiResponse<Store>> {
        return request.post('/stores', store)
    },

    // 更新店铺
    updateStore(id: number, store: Partial<Store>): Promise<ApiResponse<Store>> {
        return request.put(`/stores/${id}`, store)
    },

    // 删除店铺
    deleteStore(id: number): Promise<ApiResponse<void>> {
        return request.delete(`/stores/${id}`)
    }
}

export default storeApi


