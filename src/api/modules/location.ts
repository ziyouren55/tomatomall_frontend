import request from '../config/request'
import { ApiResponse } from '@/types/api'

export default {
    getProvinces(): Promise<ApiResponse<any[]>> {
        return request.get('/locations/provinces')
    },
    getCities(provinceCode: string): Promise<ApiResponse<any[]>> {
        return request.get(`/locations/cities?province_code=${encodeURIComponent(provinceCode)}`)
    },
    getAllCities(): Promise<ApiResponse<any[]>> {
        return request.get('/locations/cities/all')
    },
    getSchools(cityCode: string, q?: string, limit: number = 50): Promise<ApiResponse<any[]>> {
        const url = `/locations/schools?city_code=${encodeURIComponent(cityCode)}&limit=${limit}` + (q ? `&q=${encodeURIComponent(q)}` : '')
        return request.get(url)
    },
    // admin
    adminPageSchools(page = 0, size = 20, q?: string, cityCode?: string) {
        let url = `/admin/locations/schools?page=${page}&size=${size}`
        if (q) url += `&q=${encodeURIComponent(q)}`
        if (cityCode) url += `&city_code=${encodeURIComponent(cityCode)}`
        return request.get(url)
    },
    adminCreateSchool(payload: any) {
        return request.post('/admin/locations/schools', payload)
    },
    adminUpdateSchool(code: string, payload: any) {
        return request.put(`/admin/locations/schools/${encodeURIComponent(code)}`, payload)
    },
    adminDeleteSchool(code: string) {
        return request.delete(`/admin/locations/schools/${encodeURIComponent(code)}`)
    },
    adminImportSchools(formData: FormData) {
        return request.post('/admin/locations/schools/import', formData)
    }
}


