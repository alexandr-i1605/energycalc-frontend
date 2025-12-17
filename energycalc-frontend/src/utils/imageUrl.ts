import { BACKEND_IP } from '../network_config'
import { dest_img } from '../target_config'

const MINIO_PORT = 9000

export function getProxyImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return '/default-device.jpg'
  }

  if (imageUrl.startsWith('/')) {
    return imageUrl
  }

  const minioUrlPattern = new RegExp(`^https?://${BACKEND_IP}:${MINIO_PORT}/(.+)`)
  const match = imageUrl.match(minioUrlPattern)
  
  if (match) {
    return `${dest_img}/${match[1]}`
  }
  return imageUrl
}

