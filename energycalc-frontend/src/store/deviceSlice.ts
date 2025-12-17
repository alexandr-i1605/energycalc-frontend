import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../api/api-client'
import { Device } from '../types'

interface DeviceState {
  devices: Device[]
  currentDevice: Device | null
  loading: boolean
  error: string | null
}

const initialState: DeviceState = {
  devices: [],
  currentDevice: null,
  loading: false,
  error: null,
}

// Получение списка устройств
export const getDevicesAsync = createAsyncThunk(
  'device/getDevicesAsync',
  async (search: string | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.getDevices(search)
      return response
    } catch {
      return rejectWithValue('Ошибка при загрузке устройств')
    }
  }
)

// Получение устройства по ID
export const getDeviceByIdAsync = createAsyncThunk(
  'device/getDeviceByIdAsync',
  async (deviceId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.getDeviceById(deviceId)
      return response
    } catch {
      return rejectWithValue('Ошибка при загрузке устройства')
    }
  }
)

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentDevice: (state) => {
      state.currentDevice = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Получение списка устройств
      .addCase(getDevicesAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDevicesAsync.fulfilled, (state, action) => {
        state.loading = false
        state.devices = action.payload
      })
      .addCase(getDevicesAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Получение устройства по ID
      .addCase(getDeviceByIdAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDeviceByIdAsync.fulfilled, (state, action) => {
        state.loading = false
        state.currentDevice = action.payload
      })
      .addCase(getDeviceByIdAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCurrentDevice } = deviceSlice.actions
export default deviceSlice.reducer

