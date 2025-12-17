import { BACKEND_IP } from '../network_config'
import { dest_img } from '../target_config'

const MINIO_PORT = 9000

/**
 * Проверяет, работаем ли мы на GitHub Pages
 */
function isGitHubPages(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return window.location.hostname === 'alexandr-i1605.github.io' ||
         window.location.hostname.includes('github.io')
}

/**
 * Преобразует URL изображения MinIO:
 * - На GitHub Pages: использует прямой URL к локальному MinIO (http://192.168.0.5:9000/...)
 *   Примечание: требует отключения блокировки Mixed Content в браузере
 * - В локальной разработке: использует прокси /img-proxy (работает через Vite)
 */
export function getProxyImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    // Используем прозрачный placeholder вместо несуществующего файла
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7QpNGD0L3QutC4INCy0LXRgtC+0L3QsDwvdGV4dD48L3N2Zz4='
  }

  if (imageUrl.startsWith('/')) {
    return imageUrl
  }

  const escapedIP = BACKEND_IP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const minioUrlPattern = new RegExp(`^https?://${escapedIP}:${MINIO_PORT}/(.+)`)
  const match = imageUrl.match(minioUrlPattern)
  
  if (match) {
    const imagePath = match[1] // Полный путь, например 'images/3.png'
    
    // На GitHub Pages используем прямой URL к MinIO
    if (isGitHubPages()) {
      return `http://${BACKEND_IP}:${MINIO_PORT}/${imagePath}`
    }
    
    // В локальной разработке используем прокси
    return `${dest_img}/${imagePath}`
  }
  
  return imageUrl
}

