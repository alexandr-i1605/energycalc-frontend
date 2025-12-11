export const BACKEND_IP = '172.20.10.2'
export const BACKEND_PORT = 8000
export const USE_HTTPS = true

const protocol = USE_HTTPS ? 'https' : 'http'
export const BACKEND_URL = `${protocol}://${BACKEND_IP}:${BACKEND_PORT}`
