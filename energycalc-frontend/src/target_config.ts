import { BACKEND_URL } from './network_config'

export const target_tauri = false // false для веб-версии (используется прокси /api) 
export const dest_img = '/img-proxy'

export const api_proxy_addr = BACKEND_URL

/**
 * Определяет URL для API запросов в зависимости от окружения
 * - На GitHub Pages: использует прямой URL к локальному бэкенду (http://192.168.0.5:8000/api)
 * - В локальной разработке: использует прокси /api (работает через Vite dev-сервер)
 */
export function getApiBaseUrl(): string {
  if (target_tauri) {
    return api_proxy_addr
  }

  // Проверяем, работаем ли мы на GitHub Pages
  if (typeof window !== 'undefined') {
    const isGitHubPages = window.location.hostname === 'alexandr-i1605.github.io' ||
                          window.location.hostname.includes('github.io')
    
    if (isGitHubPages) {
      // На GitHub Pages проксирование не работает, используем прямой URL к локальному бэкенду
      return `${BACKEND_URL}/api`
    }
  }

  // В локальной разработке используем прокси (работает через Vite)
  return '/api'
}

// Для обратной совместимости (но лучше использовать getApiBaseUrl())
export const dest_api = getApiBaseUrl()
