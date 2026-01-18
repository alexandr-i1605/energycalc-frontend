import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient, UserRegisterData, UserLoginData, UpdateUserData } from '../api/client'
import { User } from '../types'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const registerUserAsync = createAsyncThunk(
  'user/registerUserAsync',
  async (data: UserRegisterData, { rejectWithValue }) => {
    try {
      const response = await apiClient.register(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка регистрации')
    }
  }
)

// Асинхронное действие для авторизации
export const loginUserAsync = createAsyncThunk(
  'user/loginUserAsync',
  async (data: UserLoginData, { rejectWithValue }) => {
    try {
      const response = await apiClient.login(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка авторизации')
    }
  }
)

// Асинхронное действие для деавторизации
export const logoutUserAsync = createAsyncThunk(
  'user/logoutUserAsync',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.logout()
    } catch (error: any) {
      return rejectWithValue('Ошибка при выходе из системы')
    }
  }
)

// Асинхронное действие для получения профиля пользователя
export const getUserProfileAsync = createAsyncThunk(
  'user/getUserProfileAsync',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.getUserProfile(userId)
      return response
    } catch (error: any) {
      return rejectWithValue('Ошибка при загрузке профиля')
    }
  }
)

// Асинхронное действие для обновления профиля пользователя
export const updateUserProfileAsync = createAsyncThunk(
  'user/updateUserProfileAsync',
  async ({ userId, data }: { userId: number; data: UpdateUserData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateUserProfile(userId, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка при обновлении профиля')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Регистрация
      .addCase(registerUserAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUserAsync.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload as User
        state.isAuthenticated = true
        state.error = null
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Авторизация
      .addCase(loginUserAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload as User
        state.isAuthenticated = true
        state.error = null
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Деавторизация
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
        localStorage.removeItem('user')
        localStorage.removeItem('session_id')
      })
      .addCase(logoutUserAsync.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Получение профиля
      .addCase(getUserProfileAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(getUserProfileAsync.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload as User
        state.isAuthenticated = true
        // Обновляем пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(getUserProfileAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateUserProfileAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfileAsync.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload as User
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(updateUserProfileAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = userSlice.actions
export default userSlice.reducer

