import { BACKEND_URL } from './network_config'

export const target_tauri = false // false для веб-версии (используется прокси /api) 
export const dest_img = '/img-proxy'

export const api_proxy_addr = BACKEND_URL

export function getApiBaseUrl(): string {
  if (target_tauri) {
    return api_proxy_addr
  }

  if (typeof window !== 'undefined') {
    const isGitHubPages = window.location.hostname === 'alexandr-i1605.github.io' ||
                          window.location.hostname.includes('github.io')
    
    if (isGitHubPages) {
      return `${BACKEND_URL}/api`
    }
  }
  return '/api'
}

export const dest_api = getApiBaseUrl()
