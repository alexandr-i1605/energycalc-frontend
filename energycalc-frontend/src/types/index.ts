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
}

export interface DeviceInRequest {
  device: Device
  quantity: number
}

export interface CartInfo {
  draft_request_id: number | null
  devices_count: number
}