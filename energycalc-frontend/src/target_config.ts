import { BACKEND_URL } from './network_config'

export const target_tauri = true 
export const dest_img = '/img-proxy'

export const api_proxy_addr = BACKEND_URL

export const dest_api = target_tauri ? api_proxy_addr : '/api'
