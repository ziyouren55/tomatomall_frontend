import request from '../config/request'
import { ApiResponse, Stockpile } from '@/types/api'

/**
 * 产品相关 API
 */

export interface Product {
    id?: number
    title?: string
    name?: string
    price: number
    rate?: number
    description?: string
    cover?: string
    detail?: string
    salesCount?: number
    stockpile?: number
    [key: string]: any
}

export interface StockpileData {
    amount: number
    frozen?: number
    [key: string]: any
}

// 导出Stockpile类型
export type { Stockpile }

// 搜索结果接口
export interface SearchResult {
    products: Product[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// 分页结果接口（用于库存）
export interface PageResult<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

const productApi = {
    // 获取所有产品（分页）
    getAllProducts(
        page: number = 0,
        pageSize: number = 20,
        sortBy?: string,
        sortOrder?: string
    ): Promise<ApiResponse<SearchResult>> {
        const params: any = { page, pageSize };
        if (sortBy) params.sortBy = sortBy;
        if (sortOrder) params.sortOrder = sortOrder;
        return request.get('/products', { params });
    },

    // 获取管理端产品列表（商家 / 管理员用）
    getManageProducts(
        page: number = 0,
        pageSize: number = 20,
        sortBy?: string,
        sortOrder?: string
    ): Promise<ApiResponse<SearchResult>> {
        const params: any = { page, pageSize };
        if (sortBy) params.sortBy = sortBy;
        if (sortOrder) params.sortOrder = sortOrder;
        return request.get('/products/manage', { params });
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
    getProductStockpile(productId: number): Promise<ApiResponse<Stockpile>> {
        return request.get(`/products/stockpile/${productId}`)
    },

    // 获取所有产品库存（分页）
    getAllStockpile(
        page: number = 0,
        pageSize: number = 20
    ): Promise<ApiResponse<PageResult<Stockpile>>> {
        return request.get('/products/stockpile', { 
            params: { page, pageSize } 
        });
    },

    // 更新产品库存
    updateProductStockpile(productId: number, stockpile: StockpileData): Promise<ApiResponse<StockpileData>> {
        return request.patch(`/products/stockpile/${productId}`, stockpile)
    },

    // 搜索商品
    searchProducts(
        keyword: string,
        page: number = 0,
        pageSize: number = 20,
        sortBy?: string,
        sortOrder?: string
    ): Promise<ApiResponse<SearchResult>> {
        const params: any = {
            keyword,
            page,
            pageSize
        }
        if (sortBy) {
            params.sortBy = sortBy
        }
        if (sortOrder) {
            params.sortOrder = sortOrder
        }
        return request.get('/products/search', { params })
    }
,
    // 根据店铺ID获取该店铺的产品（分页）
    getProductsByStore(
        storeId: number,
        page: number = 0,
        pageSize: number = 20
    ): Promise<ApiResponse<SearchResult>> {
        return request.get(`/products/store/${storeId}`, { params: { page, pageSize } })
    }
}

export default productApi




