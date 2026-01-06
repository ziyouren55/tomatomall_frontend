/**
 * 图片 URL 处理工具
 */

const API_BASE = 'http://localhost:8080'

/**
 * 将相对路径转换为完整的图片 URL
 * @param path 图片路径（可能是相对路径或完整 URL）
 * @returns 完整的图片 URL
 */
export function getImageUrl(path: string | undefined | null): string {
  if (!path) {
    return getPlaceholderImage()
  }

  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }

  // 如果是相对路径，拼接后端地址
  return `${API_BASE}${path}`
}

/**
 * 获取占位符图片
 */
export function getPlaceholderImage(): string {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E暂无图片%3C/text%3E%3C/svg%3E'
}
