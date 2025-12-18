import { api } from './index'
import type { Device as ApiDevice, DeviceInRequest as ApiDeviceInRequest, CalculationRequest as ApiCalculationRequest, MyUser, UserRegister, UserLogin } from './Api'
import { Device, DeviceInRequest, CartInfo, CalculationRequest } from '../types'

export interface UserRegisterData extends UserRegister {}

export interface UserLoginData extends UserLogin {}

export interface User extends MyUser {
  session_id?: string
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

function convertDevice(apiDevice: ApiDevice): Device {
  return {
    id: apiDevice.id ?? 0,
    name: apiDevice.name,
    category: apiDevice.category,
    image_url: apiDevice.image_url ?? '',
    power: apiDevice.power,
    consumption: apiDevice.consumption,
    peak_power: apiDevice.peak_power,
    voltage: apiDevice.voltage,
    work_per_day: apiDevice.work_per_day,
    energy_class: apiDevice.energy_class,
  }
}

function convertCalculationRequest(apiRequest: ApiCalculationRequest & { devices_count?: number }): CalculationRequest {
  return {
    id: apiRequest.id ?? 0,
    status: (apiRequest.status as CalculationRequest['status']) ?? 'DRAFT',
    residents: apiRequest.residents ?? 0,
    temperature: apiRequest.temperature ?? 0,
    result: apiRequest.result ?? 0,
    creation_datetime: apiRequest.creation_datetime ?? '',
    formation_datetime: apiRequest.formation_datetime ?? undefined,
    completion_datetime: apiRequest.completion_datetime ?? undefined,
    client_username: apiRequest.client_username ?? '',
    moderator_username: apiRequest.moderator_username ?? undefined,
    devices_count: apiRequest.devices_count ?? undefined,
  }
}

function convertDeviceInRequest(apiDeviceInRequest: ApiDeviceInRequest): DeviceInRequest {
  return {
    device: apiDeviceInRequest.device ? convertDevice(apiDeviceInRequest.device) : {} as Device,
    quantity: apiDeviceInRequest.quantity ?? 0,
  }
}
export const apiClient = {
  // Аутентификация
  async register(data: UserRegisterData) {
    const response = await api.users.usersRegisterCreate(data)
    const userData = (response.data as unknown) as any
    if (userData?.session_id) {
      localStorage.setItem('session_id', userData.session_id)
      const { session_id, ...userDataWithoutSession } = userData
      return userDataWithoutSession as User
    }
    return (userData || {}) as User
  },

  async login(data: UserLoginData) {
    const response = await api.users.usersLoginCreate(data)
    const userData = (response.data as unknown) as any
    if (userData?.session_id) {
      localStorage.setItem('session_id', userData.session_id)
      const { session_id, ...userDataWithoutSession } = userData
      return userDataWithoutSession as User
    }
    return (userData || {}) as User
  },

  async logout() {
    await api.users.usersLogoutCreate()
    localStorage.removeItem('session_id')
    return {}
  },

  async getUserProfile(userId: number) {
    const response = await api.users.usersProfileList({ userId: String(userId) })
    return ((response.data as unknown) || {}) as User
  },

  async updateUserProfile(userId: number, data: UpdateUserData) {
    const currentProfile = await this.getUserProfile(userId)
    const response = await api.users.usersUpdateUpdate(
      { userId: String(userId) },
      { ...currentProfile, ...data } as MyUser
    )
    return ((response.data as unknown) || {}) as User
  },

  // Устройства
  async getDevices(search?: string) {
    const response = await api.devices.devicesList({ name: search })
    const devices = ((response.data as unknown) as ApiDevice[]) || []
    return devices.map(convertDevice)
  },

  async getDeviceById(deviceId: number) {
    const response = await api.devices.devicesRead({ deviceId: String(deviceId) })
    const apiDevice = (response.data as unknown) as ApiDevice
    return convertDevice(apiDevice || {} as ApiDevice)
  },

  async addDeviceToRequest(deviceId: number) {
    await api.devices.devicesAddToRequestCreate({ deviceId: String(deviceId) })
    return {}
  },

  // Заявки
  async getCartInfo() {
    const response = await api.consumptionCalc.consumptionCalcCartIconList()
    return ((response.data as unknown) || { draft_request_id: null, devices_count: 0 }) as CartInfo
  },

  async getRequests(filters?: { status?: string; date_start?: string; date_end?: string }) {
    const response = await api.consumptionCalc.consumptionCalcList({
      status: filters?.status,
      date_start: filters?.date_start,
      date_end: filters?.date_end,
    })
    const requests = ((response.data as unknown) as ApiCalculationRequest[]) || []
    return requests.map(convertCalculationRequest)
  },

  async getRequestById(requestId: number) {
    const response = await api.consumptionCalc.consumptionCalcRead({ requestId: String(requestId) })
    const apiRequest = (response.data as unknown) as ApiCalculationRequest & { devices?: ApiDeviceInRequest[] }
    const request = convertCalculationRequest(apiRequest || {} as ApiCalculationRequest)
    const devices = (apiRequest?.devices || []) as ApiDeviceInRequest[]
    return {
      ...request,
      devices: devices.map(convertDeviceInRequest),
    } as CalculationRequest & { devices: DeviceInRequest[] }
  },

  async updateRequest(requestId: number, data: UpdateRequestData) {
    // Отправляем только изменяемые поля (residents и temperature)
    // Сервер не позволяет изменять системные поля (id, status, client, moderator, dates)
    const apiRequest: Partial<ApiCalculationRequest> = {}
    if (data.residents !== undefined) {
      apiRequest.residents = data.residents
    }
    if (data.temperature !== undefined) {
      apiRequest.temperature = data.temperature
    }
    await api.consumptionCalc.consumptionCalcUpdateUpdate(
      { requestId: String(requestId) },
      apiRequest as ApiCalculationRequest
    )
    // Получаем обновленную заявку с сервера (сервер возвращает только статус 200, не данные)
    return await this.getRequestById(requestId)
  },

  async formRequest(requestId: number) {
    await api.consumptionCalc.consumptionCalcFormUpdate({ requestId: String(requestId) })
    return await this.getRequestById(requestId)
  },

  async deleteRequest(requestId: number) {
    await api.consumptionCalc.consumptionCalcDeleteDelete({ requestId: String(requestId) })
    return {}
  },

  async updateDeviceInRequest(requestId: number, deviceId: number, data: UpdateDeviceInRequestData) {
    const apiDeviceInRequest: ApiDeviceInRequest = {
      quantity: data.quantity,
    }
    const response = await api.consumptionCalc.consumptionCalcDevicesUpdateUpdate(
      { requestId: String(requestId), deviceId: String(deviceId) },
      apiDeviceInRequest
    )
    return convertDeviceInRequest(response.data || {} as ApiDeviceInRequest)
  },

  async deleteDeviceFromRequest(requestId: number, deviceId: number) {
    await api.consumptionCalc.consumptionCalcDevicesDeleteDelete({
      requestId: String(requestId),
      deviceId: String(deviceId),
    })
    return {}
  },

  async updateRequestStatus(requestId: number, newStatus: 'COMPLETED' | 'REJECTED') {
    const sessionId = localStorage.getItem('session_id')
    
    const response = await fetch(`/api/consumption-calc/${requestId}/status/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? { 'X-Session-ID': sessionId } : {}),
      },
      body: JSON.stringify({ status: newStatus }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `Ошибка ${response.status}: Ошибка при изменении статуса заявки`
      throw new Error(errorMessage)
    }
    
    return await this.getRequestById(requestId)
  },
}

