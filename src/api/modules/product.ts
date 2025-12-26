import request from '../config/request'
import { ApiResponse, Stockpile, Product, StockpileData, SearchResult, PageResult } from '@/types/api'

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
    ,
    // 获取附近推荐（后端按 token 推断用户并优先返回同校/同城商品）
    getNearbyRecommendations(
        page: number = 0,
        pageSize: number = 12
    ): Promise<ApiResponse<SearchResult>> {
        const params: any = { page, pageSize };
        return request.get('/products/recommend', { params });
    }
}

export default productApi




