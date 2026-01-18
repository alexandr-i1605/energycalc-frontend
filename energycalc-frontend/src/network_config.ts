export const BACKEND_IP = '192.168.0.5'
export const BACKEND_PORT = 8000
export const USE_HTTPS = false

const protocol = USE_HTTPS ? 'https' : 'http'
export const BACKEND_URL = `${protocol}://${BACKEND_IP}:${BACKEND_PORT}`

export const USE_FIRESTORE = true