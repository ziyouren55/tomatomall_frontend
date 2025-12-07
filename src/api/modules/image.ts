import request from '../config/request'
import { ApiResponse } from '@/types/api'

/**
 * 图片上传相关 API
 */

const imageApi = {
    /**
     * 上传图片到OSS
     * @param file 图片文件
     * @param module 可选，模块名称（用于分类存储）
     * @returns 返回上传后的图片URL
     */
    uploadImage(file: File, module?: string): Promise<ApiResponse<string>> {
        const formData = new FormData()
        formData.append('file', file)
        if (module) {
            formData.append('module', module)
        }
        
        // axios会自动识别FormData并设置正确的Content-Type（包括boundary）
        return request.post('/images', formData)
    }
}

export default imageApi

