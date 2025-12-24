import { BACKEND_IP } from '../network_config'
import { dest_img } from '../target_config'

const MINIO_PORT = 9000

const DEFAULT_IMAGE = 'https://avatars.mds.yandex.net/get-ydo/1449941/2a000001745930bb2688b0349ae1db09ae13/diploma'

export function getDefaultImageUrl(): string {
  return DEFAULT_IMAGE
}

function isGitHubPages(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return window.location.hostname === 'alexandr-i1605.github.io' ||
         window.location.hostname.includes('github.io')
}

export function getProxyImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return DEFAULT_IMAGE
  }

  if (imageUrl.startsWith('/')) {
    return imageUrl
  }

  const escapedIP = BACKEND_IP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const minioUrlPattern = new RegExp(`^https?://${escapedIP}:${MINIO_PORT}/(.+)`)
  const match = imageUrl.match(minioUrlPattern)
  
  if (match) {
    const imagePath = match[1]
    
    if (isGitHubPages()) {
      return `http://${BACKEND_IP}:${MINIO_PORT}/${imagePath}`
    }
    
    return `${dest_img}/${imagePath}`
  }
  
  return imageUrl
}

