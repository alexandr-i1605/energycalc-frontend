import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient, UpdateRequestData, UpdateDeviceInRequestData } from '../api/client'
import { CalculationRequest, DeviceInRequest, RequestDetailResponse, CartInfo } from '../types'
import { logoutUserAsync } from './userSlice'

interface RequestState {
  requests: CalculationRequest[]
  currentRequest: CalculationRequest | null
  devices: DeviceInRequest[]
  cartInfo: CartInfo
  loading: boolean
  error: string | null
  isDraft: boolean
}

const initialState: RequestState = {
  requests: [],
  currentRequest: null,
  devices: [],
  cartInfo: { draft_request_id: null, devices_count: 0 },
  loading: false,
  error: null,
  isDraft: false,
}

// Получение информации о корзине
export const getCartInfoAsync = createAsyncThunk(
  'request/getCartInfoAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getCartInfo()
      return response
    } catch {
      return rejectWithValue('Ошибка при загрузке информации о корзине')
    }
  }
)

// Получение списка заявок
export const getRequestsAsync = createAsyncThunk(
  'request/getRequestsAsync',
  async (filters: { status?: string; date_start?: string; date_end?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.getRequests(filters)
      return response
    } catch {
      return rejectWithValue('Ошибка при загрузке заявок')
    }
  }
)

// Получение заявки по ID
export const getRequestByIdAsync = createAsyncThunk(
  'request/getRequestByIdAsync',
  async (requestId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.getRequestById(requestId)
      return response
    } catch {
      return rejectWithValue('Ошибка при загрузке заявки')
    }
  }
)

// Обновление заявки
export const updateRequestAsync = createAsyncThunk(
  'request/updateRequestAsync',
  async ({ requestId, data }: { requestId: number; data: UpdateRequestData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateRequest(requestId, data)
      return response
    } catch {
      return rejectWithValue('Ошибка при обновлении заявки')
    }
  }
)

// Формирование заявки
export const formRequestAsync = createAsyncThunk(
  'request/formRequestAsync',
  async (requestId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.formRequest(requestId)
      return response
    } catch {
      return rejectWithValue('Ошибка при формировании заявки')
    }
  }
)

// Удаление заявки
export const deleteRequestAsync = createAsyncThunk(
  'request/deleteRequestAsync',
  async (requestId: number, { rejectWithValue }) => {
    try {
      await apiClient.deleteRequest(requestId)
      return requestId
    } catch {
      return rejectWithValue('Ошибка при удалении заявки')
    }
  }
)

// Добавление устройства в заявку
export const addDeviceToRequestAsync = createAsyncThunk(
  'request/addDeviceToRequestAsync',
  async (deviceId: number, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.addDeviceToRequest(deviceId)
      // Обновляем информацию о корзине
      dispatch(getCartInfoAsync())
      return deviceId
    } catch {
      return rejectWithValue('Ошибка при добавлении устройства')
    }
  }
)

// Обновление количества устройства в заявке
export const updateDeviceInRequestAsync = createAsyncThunk(
  'request/updateDeviceInRequestAsync',
  async (
    { requestId, deviceId, data }: { requestId: number; deviceId: number; data: UpdateDeviceInRequestData },
    { rejectWithValue }
  ) => {
    try {
      await apiClient.updateDeviceInRequest(requestId, deviceId, data)
      return { deviceId, quantity: data.quantity }
    } catch {
      return rejectWithValue('Ошибка при обновлении количества устройства')
    }
  }
)

// Удаление устройства из заявки
export const deleteDeviceFromRequestAsync = createAsyncThunk(
  'request/deleteDeviceFromRequestAsync',
  async (
    { requestId, deviceId }: { requestId: number; deviceId: number },
    { rejectWithValue }
  ) => {
    try {
      await apiClient.deleteDeviceFromRequest(requestId, deviceId)
      return deviceId
    } catch {
      return rejectWithValue('Ошибка при удалении устройства')
    }
  }
)

// Изменение статуса заявки (для модератора)
export const updateRequestStatusAsync = createAsyncThunk(
  'request/updateRequestStatusAsync',
  async (
    { requestId, newStatus }: { requestId: number; newStatus: 'COMPLETED' | 'REJECTED' },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.updateRequestStatus(requestId, newStatus)
      return response
    } catch {
      return rejectWithValue('Ошибка при изменении статуса заявки')
    }
  }
)

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null
      state.devices = []
      state.isDraft = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Получение информации о корзине
      .addCase(getCartInfoAsync.fulfilled, (state, action) => {
        state.cartInfo = action.payload
      })
      .addCase(getCartInfoAsync.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Получение списка заявок
      .addCase(getRequestsAsync.pending, (state) => {
        if (state.requests.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(getRequestsAsync.fulfilled, (state, action) => {
        state.loading = false
        const newRequests = action.payload
        const oldRequestsMap = new Map(state.requests.map(req => [req.id, req]))
        
        const hasChanges = state.requests.length !== newRequests.length ||
          newRequests.some((newReq) => {
            const oldReq = oldRequestsMap.get(newReq.id)
            if (!oldReq) return true // Новая заявка
            return oldReq.status !== newReq.status ||
                   oldReq.result !== newReq.result ||
                   oldReq.completion_datetime !== newReq.completion_datetime ||
                   oldReq.formation_datetime !== newReq.formation_datetime ||
                   oldReq.moderator_username !== newReq.moderator_username
          })
        
        if (hasChanges) {
          state.requests = newRequests
        }
      })
      .addCase(getRequestsAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Получение заявки по ID
      .addCase(getRequestByIdAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRequestByIdAsync.fulfilled, (state, action) => {
        state.loading = false
        const payload = action.payload as RequestDetailResponse
        const { devices, ...requestData } = payload
        state.currentRequest = requestData as CalculationRequest
        state.devices = devices || []
        state.isDraft = requestData.status === 'DRAFT'
      })
      .addCase(getRequestByIdAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Обновление заявки
      .addCase(updateRequestAsync.fulfilled, (state, action) => {
        if (state.currentRequest && state.currentRequest.id === action.payload.id) {
          state.currentRequest = action.payload
        }
      })
      // Формирование заявки
      .addCase(formRequestAsync.fulfilled, (state, action) => {
        if (state.currentRequest && state.currentRequest.id === action.payload.id) {
          state.currentRequest = action.payload
          state.isDraft = false
        }
        if (state.cartInfo.draft_request_id === action.payload.id) {
          state.cartInfo = { draft_request_id: null, devices_count: 0 }
        }
      })
      // Удаление заявки
      .addCase(deleteRequestAsync.fulfilled, (state) => {
        state.currentRequest = null
        state.devices = []
        state.isDraft = false
        state.cartInfo = { draft_request_id: null, devices_count: 0 }
      })
      // Обновление количества устройства
      .addCase(updateDeviceInRequestAsync.fulfilled, (state, action) => {
        const device = state.devices.find((d) => d.device.id === action.payload.deviceId)
        if (device) {
          device.quantity = action.payload.quantity
        }
      })
      // Удаление устройства из заявки
      .addCase(deleteDeviceFromRequestAsync.fulfilled, (state, action) => {
        state.devices = state.devices.filter((d) => d.device.id !== action.payload)
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.currentRequest = null
        state.devices = []
        state.cartInfo = { draft_request_id: null, devices_count: 0 }
        state.isDraft = false
      })
      .addCase(updateRequestStatusAsync.fulfilled, (state, action) => {
        const index = state.requests.findIndex((r) => r.id === action.payload.id)
        if (index !== -1) {
          state.requests[index] = action.payload
        }
        if (state.currentRequest && state.currentRequest.id === action.payload.id) {
          state.currentRequest = action.payload
        }
      })
  },
})

export const { setError, clearError, clearCurrentRequest } = requestSlice.actions
export default requestSlice.reducer

