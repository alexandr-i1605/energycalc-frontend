import { Device, CartInfo, CalculationRequest, DeviceInRequest, User, RequestDetailResponse } from '../types'
import { firestoreClient } from './firestore-client'

export interface UserRegisterData {
  username: string
  password: string
  email?: string
  first_name?: string
  last_name?: string
}

export interface UserLoginData {
  username: string
  password: string
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
}

export interface UpdateRequestData {
  residents?: number
  temperature?: number
}

export interface UpdateDeviceInRequestData {
  quantity: number
}

async function generateRequestNumericId(): Promise<number> {
  try {
    const allRequests = await firestoreClient.getCollection('calculation_requests') as any[]
    
    const maxId = allRequests.reduce((max: number, request: any) => {
      const requestId = typeof request.id === 'number' ? request.id : (typeof request.id === 'string' ? parseInt(request.id, 10) : 0)
      return requestId > max ? requestId : max
    }, 0)
    
    return maxId + 1
  } catch (error) {
    return 1
  }
}

async function findDocumentByNumericId(collection: string, numericId: number): Promise<any> {
  const allDocs = await firestoreClient.getCollection(collection) as any[]
  const found = allDocs.find((doc: any) => {
    const docId = typeof doc.id === 'number' ? doc.id : (typeof doc.id === 'string' ? parseInt(doc.id, 10) : null)
    return docId !== null && !isNaN(docId) && docId === numericId
  })
  return found
}

const MOCK_DEVICES: Device[] = [
  {
        'id': 1,
        'name': 'Конвектор',
        'category': 'ОТОПИТЕЛЬНЫЕ УСТРОЙСТВА',
        'image_url': 'https://avatars.mds.yandex.net/get-ydo/1449941/2a000001745930bb2688b0349ae1db09ae13/diploma',
        'power': 2000,
        'consumption': 200,
        'peak_power': 2500,
        'voltage': '220-240',
        'work_per_day': '8 ч',
        'energy_class': 'A',
        
    },
  {
        'id': 2,
        'name': 'Холодильник',
        'category': 'КУХНЯ',
        'image_url': 'https://avatars.mds.yandex.net/get-ydo/1449941/2a000001745930bb2688b0349ae1db09ae13/diploma',
        'power': 200,
        'consumption': 36,
        'peak_power': 400,
        'voltage': '220-240',
        'work_per_day': '4 ч',
        'energy_class': 'A+',
    },
    {
        'id': 3,
        'name': 'Чайник',
        'category': 'КУХНЯ',
        'image_url': 'https://avatars.mds.yandex.net/get-ydo/1449941/2a000001745930bb2688b0349ae1db09ae13/diploma',
        'power': 1200,
        'consumption': 20,
        'peak_power': 1500,
        'voltage': '220-240',
        'work_per_day': '1 ч',
        'energy_class': 'B',
    }
]

export const apiClient = {
  async getDevices(search?: string): Promise<Device[]> {
    try {
      let devices: Device[]
      
      if (search) {
        devices = await firestoreClient.queryCollection('devices', 'name', 'contains', search) as Device[]
      } else {
        devices = await firestoreClient.getCollection('devices') as Device[]
      }

      return devices.map(device => ({
        ...device,
        id: typeof device.id === 'string' ? parseInt(device.id) || 0 : device.id,
        power: Number(device.power) || 0,
        consumption: Number(device.consumption) || 0,
        peak_power: Number(device.peak_power) || 0,
      }))
    } catch (error) {
      if (search) {
        return MOCK_DEVICES.filter(device => 
          device.name.toLowerCase().includes(search.toLowerCase())
        )
      }
      return MOCK_DEVICES
    }
  },

  async getDeviceById(id: number | string): Promise<Device> {
    try {
      const deviceId = String(id)
      const device = await firestoreClient.getDocument('devices', deviceId) as Device

      return {
        ...device,
        id: typeof device.id === 'string' ? parseInt(device.id) || 0 : device.id,
        power: Number(device.power) || 0,
        consumption: Number(device.consumption) || 0,
        peak_power: Number(device.peak_power) || 0,
      }
    } catch (error) {
      const device = MOCK_DEVICES.find(d => d.id === Number(id))
      if (!device) throw new Error('Device not found')
      return device
    }
  },

  async addDeviceToRequest(deviceId: number): Promise<void> {
    try {
      const userId = localStorage.getItem('user_id')
      let currentUser = null
      if (userId && userId !== 'NaN' && userId !== '' && !isNaN(Number(userId)) && Number(userId) > 0) {
        currentUser = await this.getUserProfile(Number(userId)).catch(() => null)
      }
      
      const draftRequestNumericId = localStorage.getItem('draft_request_id')
      
      if (draftRequestNumericId) {
        const draftRequest = await findDocumentByNumericId('calculation_requests', Number(draftRequestNumericId))
        
        if (draftRequest && draftRequest._firestore_id) {
          const devices = [...(draftRequest.devices || [])]

          const existingDeviceIndex = devices.findIndex((d: any) => d.device_id === deviceId)
          if (existingDeviceIndex !== -1) {
            devices[existingDeviceIndex] = {
              ...devices[existingDeviceIndex],
              quantity: (devices[existingDeviceIndex].quantity || 0) + 1,
            }
          } else {
            devices.push({ device_id: deviceId, quantity: 1 })
          }

          await firestoreClient.updateDocument('calculation_requests', draftRequest._firestore_id, {
            devices,
          })
          return
        }
      }

      const numericId = await generateRequestNumericId()
      
      await firestoreClient.createDocument('calculation_requests', {
        id: numericId,
        status: 'DRAFT',
        residents: 1,
        temperature: 20,
        devices: [{ device_id: deviceId, quantity: 1 }],
        result: null,
        client_id: userId || '',
        client_username: currentUser?.username || '',
        creation_datetime: new Date().toISOString(),
      })

      localStorage.setItem('draft_request_id', String(numericId))
    } catch (error) {
      throw error
    }
  },

  async getCartInfo(): Promise<CartInfo> {
    try {
      let draftRequestNumericId = localStorage.getItem('draft_request_id')

      if (!draftRequestNumericId) {
        const userId = localStorage.getItem('user_id')
        if (userId && userId !== 'NaN' && userId !== '' && !isNaN(Number(userId)) && Number(userId) > 0) {
          try {
            const allRequests = await firestoreClient.getCollection('calculation_requests') as any[]
            const draftRequest = allRequests.find((r: any) => {
              const requestClientId = typeof r.client_id === 'string' ? r.client_id : String(r.client_id || '')
              const userClientId = String(userId)
              return r.status === 'DRAFT' && requestClientId === userClientId
            })
            
            if (draftRequest && draftRequest.id) {
              draftRequestNumericId = String(draftRequest.id)
              localStorage.setItem('draft_request_id', draftRequestNumericId)
            }
          } catch (error) {
          }
        }
      }
      
      if (!draftRequestNumericId) {
        return {
          draft_request_id: null,
          devices_count: 0
        }
      }
      
      const draftRequest = await findDocumentByNumericId('calculation_requests', Number(draftRequestNumericId))
      
      if (!draftRequest) {
        localStorage.removeItem('draft_request_id')
        return {
          draft_request_id: null,
          devices_count: 0
        }
      }
      
      const userId = localStorage.getItem('user_id')
      if (userId) {
        const requestClientId = typeof draftRequest.client_id === 'string' ? draftRequest.client_id : String(draftRequest.client_id || '')
        const userClientId = String(userId)
        if (requestClientId !== userClientId) {
          localStorage.removeItem('draft_request_id')
          return {
            draft_request_id: null,
            devices_count: 0
          }
        }
      }
      
      if (draftRequest.status !== 'DRAFT') {
        localStorage.removeItem('draft_request_id')
        return {
          draft_request_id: null,
          devices_count: 0
        }
      }
      
      const devices = draftRequest.devices || []
      const devicesCount = devices.reduce((sum: number, device: any) => sum + (device.quantity || 0), 0)
      
      return {
        draft_request_id: draftRequest.id || Number(draftRequestNumericId),
        devices_count: devicesCount
      }
    } catch (error) {
      return {
        draft_request_id: null,
        devices_count: 0
      }
    }
  },

  async register(data: UserRegisterData): Promise<User> {
    try {
      const users = await firestoreClient.getCollection('users') as any[]
      const existingUser = users.find((u: any) => u.username === data.username)
      
      if (existingUser) {
        throw new Error('Пользователь с таким именем уже существует')
      }

      const maxUserId = users.reduce((max: number, user: any) => {
        const userId = typeof user.id === 'number' ? user.id : (typeof user.id === 'string' ? parseInt(user.id, 10) : 0)
        return userId > max ? userId : max
      }, 0)
      const numericId = maxUserId + 1
      
      const newUser = await firestoreClient.createDocument('users', {
        id: numericId,
        username: data.username,
        password: data.password,
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        is_moderator: false,
        creation_datetime: new Date().toISOString(),
      })

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('session_id', sessionId)
      localStorage.setItem('user_id', String(numericId))

      return {
        id: numericId,
        username: newUser.username || data.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        is_moderator: newUser.is_moderator || false,
      }
    } catch (error: any) {
      console.error('Error registering user in Firestore:', error)
      throw new Error(error.message || 'Ошибка регистрации')
    }
  },

  async login(data: UserLoginData): Promise<User> {
    try {
      const users = await firestoreClient.getCollection('users') as any[]
      const user = users.find((u: any) => u.username === data.username && u.password === data.password)

      if (!user) {
        throw new Error('Неверное имя пользователя или пароль')
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('session_id', sessionId)
      const userId = typeof user.id === 'string' ? parseInt(user.id) || 0 : user.id || 0
      localStorage.setItem('user_id', String(userId))

      try {
        const allRequests = await firestoreClient.getCollection('calculation_requests') as any[]
        const draftRequest = allRequests.find((r: any) => {
          const requestClientId = typeof r.client_id === 'string' ? r.client_id : String(r.client_id || '')
          const userClientId = String(userId)
          return r.status === 'DRAFT' && requestClientId === userClientId
        })
        
        if (draftRequest && draftRequest.id) {
          localStorage.setItem('draft_request_id', String(draftRequest.id))
        }
      } catch (error) {
      }

      return {
        id: userId,
        username: user.username || '',
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_moderator: user.is_moderator || false,
      }
    } catch (error: any) {
      console.error('Error logging in user from Firestore:', error)
      throw new Error(error.message || 'Ошибка авторизации')
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('session_id')
    localStorage.removeItem('user_id')
    localStorage.removeItem('draft_request_id')
  },

  async getUserProfile(userId: number): Promise<User> {
    try {
      if (!userId || isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID')
      }
      
      const user = await findDocumentByNumericId('users', userId)
      
      if (!user) {
        throw new Error(`Пользователь с ID ${userId} не найден`)
      }
      
      return {
        id: typeof user.id === 'number' ? user.id : userId,
        username: user.username || '',
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_moderator: user.is_moderator || false,
      }
    } catch (error) {
      console.error('Error fetching user profile from Firestore:', error)
      throw new Error('Ошибка при загрузке профиля')
    }
  },

  async updateUserProfile(userId: number, data: UpdateUserData): Promise<User> {
    try {
      const user = await findDocumentByNumericId('users', userId)
      
      if (!user || !user._firestore_id) {
        throw new Error(`Пользователь с ID ${userId} не найден`)
      }
      
      const updateData: any = {}
      if (data.first_name !== undefined) updateData.first_name = data.first_name
      if (data.last_name !== undefined) updateData.last_name = data.last_name
      if (data.email !== undefined) updateData.email = data.email
      if (data.password !== undefined) updateData.password = data.password

      const updatedUser = await firestoreClient.updateDocument('users', user._firestore_id, updateData)

      return {
        id: typeof updatedUser.id === 'number' ? updatedUser.id : userId,
        username: updatedUser.username || '',
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        is_moderator: updatedUser.is_moderator || false,
      }
    } catch (error) {
      console.error('Error updating user profile in Firestore:', error)
      throw new Error('Ошибка при обновлении профиля')
    }
  },

  async getRequests(filters?: { status?: string; date_start?: string; date_end?: string }): Promise<CalculationRequest[]> {
    try {
      let requests = await firestoreClient.getCollection('calculation_requests') as any[]
      const userId = localStorage.getItem('user_id')
      let currentUser = null
      let isModerator = false
      if (userId && userId !== 'NaN' && userId !== '' && !isNaN(Number(userId)) && Number(userId) > 0) {
        currentUser = await this.getUserProfile(Number(userId)).catch(() => null)
        isModerator = currentUser?.is_moderator || false
      }

      if (!isModerator && userId) {
        requests = requests.filter((r: any) => r.client_id === userId)
      }

      requests = requests.filter((r: any) => r.status !== 'DELETED')

      if (filters?.status) {
        requests = requests.filter((r: any) => r.status === filters.status)
      }

      if (filters?.date_start) {
        const startDate = new Date(filters.date_start)
        requests = requests.filter((r: any) => {
          const creationDate = new Date(r.creation_datetime)
          return creationDate >= startDate
        })
      }

      if (filters?.date_end) {
        const endDate = new Date(filters.date_end)
        requests = requests.filter((r: any) => {
          const creationDate = new Date(r.creation_datetime)
          return creationDate <= endDate
        })
      }

      return requests.map((r: any) => ({
        id: typeof r.id === 'number' ? r.id : (typeof r.id === 'string' ? parseInt(r.id) || 0 : 0),
        status: (r.status || 'DRAFT') as CalculationRequest['status'],
        residents: Number(r.residents) || 1,
        temperature: Number(r.temperature) || 20,
        result: r.result ? Number(r.result) : 0,
        creation_datetime: r.creation_datetime || new Date().toISOString(),
        formation_datetime: r.formation_datetime,
        completion_datetime: r.completion_datetime,
        client_username: r.client_username || '',
        moderator_username: r.moderator_username,
        devices_count: Array.isArray(r.devices) ? r.devices.length : 0,
      }))
    } catch (error) {
      console.error('Error fetching requests from Firestore:', error)
      return []
    }
  },

  async getRequestById(requestId: number): Promise<RequestDetailResponse> {
    try {
      const request = await findDocumentByNumericId('calculation_requests', requestId)
      
      if (!request) {
        throw new Error(`Заявка с ID ${requestId} не найдена`)
      }
      const devices = request.devices || []
      
      const devicesWithDetails: DeviceInRequest[] = await Promise.all(
        devices.map(async (deviceInReq: any) => {
          try {
            const device = await this.getDeviceById(deviceInReq.device_id)
            return {
              device,
              quantity: Number(deviceInReq.quantity) || 1,
            }
          } catch {
            return {
              device: {} as Device,
              quantity: Number(deviceInReq.quantity) || 1,
            }
          }
        })
      )

      const baseRequest: CalculationRequest = {
        id: typeof request.id === 'number' ? request.id : requestId,
        status: (request.status || 'DRAFT') as CalculationRequest['status'],
        residents: Number(request.residents) || 1,
        temperature: Number(request.temperature) || 20,
        result: request.result ? Number(request.result) : 0,
        creation_datetime: request.creation_datetime || new Date().toISOString(),
        formation_datetime: request.formation_datetime,
        completion_datetime: request.completion_datetime,
        client_username: request.client_username || '',
        moderator_username: request.moderator_username,
        devices_count: devicesWithDetails.length,
      }

      return {
        ...baseRequest,
        devices: devicesWithDetails,
      }
    } catch (error) {
      console.error('Error fetching request from Firestore:', error)
      throw new Error('Ошибка при загрузке заявки')
    }
  },

  async updateRequest(requestId: number, data: UpdateRequestData): Promise<CalculationRequest & { devices: DeviceInRequest[] }> {
    try {
      const request = await findDocumentByNumericId('calculation_requests', requestId)
      if (!request || !request._firestore_id) {
        throw new Error(`Заявка с ID ${requestId} не найдена`)
      }
      
      const updateData: any = {}
      if (data.residents !== undefined) updateData.residents = data.residents
      if (data.temperature !== undefined) updateData.temperature = data.temperature

      await firestoreClient.updateDocument('calculation_requests', request._firestore_id, updateData)
      
      return await this.getRequestById(requestId)
    } catch (error) {
      console.error('Error updating request in Firestore:', error)
      throw new Error('Ошибка при обновлении заявки')
    }
  },

  async formRequest(requestId: number): Promise<CalculationRequest & { devices: DeviceInRequest[] }> {
    try {
      const currentRequest = await findDocumentByNumericId('calculation_requests', requestId)
      
      if (!currentRequest || !currentRequest._firestore_id) {
        throw new Error(`Заявка с ID ${requestId} не найдена`)
      }
      
      if (currentRequest.status !== 'DRAFT') {
        throw new Error('Только черновики могут быть сформированы')
      }

      await firestoreClient.updateDocument('calculation_requests', currentRequest._firestore_id, {
        status: 'FORMED',
        formation_datetime: new Date().toISOString(),
      })
      
      const draftRequestId = localStorage.getItem('draft_request_id')
      if (draftRequestId === String(requestId)) {
        localStorage.removeItem('draft_request_id')
      }
      
      return await this.getRequestById(requestId)
    } catch (error: any) {
      console.error('Error forming request in Firestore:', error)
      throw new Error(error.message || 'Ошибка при формировании заявки')
    }
  },

  async deleteRequest(requestId: number): Promise<void> {
    try {
      const currentRequest = await findDocumentByNumericId('calculation_requests', requestId)
      
      if (!currentRequest || !currentRequest._firestore_id) {
        throw new Error(`Заявка с ID ${requestId} не найдена`)
      }
      
      if (currentRequest.status !== 'DRAFT') {
        throw new Error('Только черновики могут быть удалены')
      }

      await firestoreClient.updateDocument('calculation_requests', currentRequest._firestore_id, {
        status: 'DELETED',
      })

      const draftRequestId = localStorage.getItem('draft_request_id')
      if (draftRequestId === String(requestId)) {
        localStorage.removeItem('draft_request_id')
      }
    } catch (error: any) {
      console.error('Error deleting request in Firestore:', error)
      throw new Error(error.message || 'Ошибка при удалении заявки')
    }
  },

  async updateDeviceInRequest(requestId: number, deviceId: number, data: UpdateDeviceInRequestData): Promise<DeviceInRequest> {
    try {
      const request = await findDocumentByNumericId('calculation_requests', requestId)
      
      if (!request || !request._firestore_id) {
        throw new Error(`Заявка с ID ${requestId} не найдена`)
      }
      const devices = [...(request.devices || [])]
      
      const deviceIndex = devices.findIndex((d: any) => d.device_id === deviceId)
      if (deviceIndex === -1) {
        throw new Error('Устройство не найдено в заявке')
      }

      devices[deviceIndex] = {
        ...devices[deviceIndex],
        quantity: data.quantity,
      }

      await firestoreClient.updateDocument('calculation_requests', request._firestore_id, {
        devices,
      })

      const device = await this.getDeviceById(deviceId)
      return {
        device,
        quantity: data.quantity,
      }
    } catch (error: any) {
      console.error('Error updating device in request in Firestore:', error)
      throw new Error(error.message || 'Ошибка при обновлении количества устройства')
    }
  },

  async deleteDeviceFromRequest(requestId: number, deviceId: number): Promise<void> {
    try {
      const request = await findDocumentByNumericId('calculation_requests', requestId)
      
      if (!request || !request._firestore_id) {
        throw new Error(`Заявка с ID ${requestId} не найдена`)
      }
      const devices = (request.devices || []).filter((d: any) => d.device_id !== deviceId)

      await firestoreClient.updateDocument('calculation_requests', request._firestore_id, {
        devices,
      })
    } catch (error) {
      console.error('Error deleting device from request in Firestore:', error)
      throw new Error('Ошибка при удалении устройства из заявки')
    }
  },

  async updateRequestStatus(requestId: number, newStatus: 'COMPLETED' | 'REJECTED'): Promise<CalculationRequest & { devices: DeviceInRequest[] }> {
    try {
      const currentRequest = await findDocumentByNumericId('calculation_requests', requestId)
      
      if (!currentRequest || !currentRequest._firestore_id) {
        throw new Error(`Заявка с ID ${requestId} не найдена`)
      }
      
      if (currentRequest.status !== 'FORMED') {
        throw new Error('Только сформированные заявки могут быть завершены или отклонены')
      }

      const userId = localStorage.getItem('user_id')
      let currentUser = null
      if (userId && userId !== 'NaN' && userId !== '' && !isNaN(Number(userId)) && Number(userId) > 0) {
        currentUser = await this.getUserProfile(Number(userId)).catch(() => null)
      }

      await firestoreClient.updateDocument('calculation_requests', currentRequest._firestore_id, {
        status: newStatus,
        completion_datetime: new Date().toISOString(),
        moderator_username: currentUser?.username || '',
      })
      
      return await this.getRequestById(requestId)
    } catch (error: any) {
      console.error('Error updating request status in Firestore:', error)
      throw new Error(error.message || 'Ошибка при изменении статуса заявки')
    }
  },

}