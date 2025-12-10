import { Device, CartInfo } from '../types'

const API_BASE = '/api'

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
      const params = new URLSearchParams()
      if (search) params.append('name', search)
      
      const response = await fetch(`${API_BASE}/devices?${params}`)
      if (!response.ok) throw new Error('Network error')
      return await response.json()
    } catch (error) {
      console.warn('Using mock devices data')

      if (search) {
        return MOCK_DEVICES.filter(device => 
          device.name.toLowerCase().includes(search.toLowerCase())
        )
      }
      return MOCK_DEVICES
    }
  },

  async getDeviceById(id: number): Promise<Device> {
    try {
      const response = await fetch(`${API_BASE}/devices/${id}/`)
      if (!response.ok) throw new Error('Network error')
      return await response.json()
    } catch (error) {
      console.warn('Using mock device data')
      const device = MOCK_DEVICES.find(d => d.id === id)
      if (!device) throw new Error('Device not found')
      return device
    }
  },

  async addDeviceToRequest(deviceId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/devices/${deviceId}/add_to_request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Network error')
    } catch (error) {
      console.warn('Mock: Device added to request')
    }
  },

  async getCartInfo(): Promise<CartInfo> {
    try {
      const response = await fetch(`${API_BASE}/consumption-calc/cart_icon/`)
      if (!response.ok) throw new Error('Network error')
      return await response.json()
    } catch (error) {
      console.warn('Using mock cart info')
      return {
        draft_request_id: null,
        devices_count: 0
      }
    }
  },

}