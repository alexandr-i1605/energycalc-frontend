export interface Device {
  id: number
  name: string
  category: string
  image_url: string
  power: number
  consumption: number
  peak_power?: number
  voltage?: string
  work_per_day: string
  energy_class: string
}

export interface CalculationRequest {
  id: number
  status: 'DRAFT' | 'FORMED' | 'COMPLETED' | 'REJECTED' | 'DELETED'
  residents: number
  temperature: number
  result: number
  creation_datetime: string
  formation_datetime?: string
  completion_datetime?: string
  client_username: string
  moderator_username?: string
  devices_count?: number
}

export interface DeviceInRequest {
  device: Device
  quantity: number
}

export interface User {
  id: number
  username: string
  first_name?: string
  last_name?: string
  email?: string
  is_moderator: boolean
}

export interface RequestDetailResponse extends CalculationRequest {
  devices: DeviceInRequest[]
}

export interface CartInfo {
  draft_request_id: number | null
  devices_count: number
}