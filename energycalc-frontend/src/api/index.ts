import { HttpClient, Api } from './Api'
import { getApiBaseUrl } from '../target_config'

const httpClient = new HttpClient({
  baseURL: getApiBaseUrl(),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.instance.interceptors.request.use(
  (config) => {
    const sessionId = localStorage.getItem('session_id')
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

httpClient.instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('session_id')
    }
    return Promise.reject(error)
  }
)

export const api = new Api(httpClient)

export { httpClient }

