export const target_tauri = true 
export const dest_img = '/img-proxy'

export const api_proxy_addr = 'http://127.0.0.1:8000' // IP бэка в локалке

export const dest_api = target_tauri ? api_proxy_addr : '/api'
