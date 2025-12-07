import request from '../config/request'
import { ApiResponse } from '@/types/api'

/**
 * 产品相关 API
 */

export interface Product {
    id?: number
    name: string
    price: number
    description?: string
    stockpile?: number
    [key: string]: any
}

export interface StockpileData {
    stockpile: number
    [key: string]: any
}

const productApi = {
    // 获取所有产品
    getAllProducts(): Promise<ApiResponse<Product[]>> {
        return request.get('/products')
    },

    // 根据ID获取产品
    getProductById(id: number): Promise<ApiResponse<Product>> {
        return request.get(`/products/${id}`)
    },

    // 创建新产品
    createProduct(product: Product): Promise<ApiResponse<Product>> {
        return request.post('/products', product)
    },

    // 更新产品
    updateProduct(product: Product): Promise<ApiResponse<Product>> {
        return request.put('/products', product)
    },

    // 删除产品
    deleteProduct(id: number): Promise<ApiResponse<void>> {
        return request.delete(`/products/${id}`)
    },

    // 获取产品库存
    getProductStockpile(productId: number): Promise<ApiResponse<StockpileData>> {
        return request.get(`/products/stockpile/${productId}`)
    },

    // 更新产品库存
    updateProductStockpile(productId: number, stockpile: StockpileData): Promise<ApiResponse<StockpileData>> {
        return request.patch(`/products/stockpile/${productId}`, stockpile)
    }
}

export default productApi




