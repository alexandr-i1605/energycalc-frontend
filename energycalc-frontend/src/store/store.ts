import { configureStore } from '@reduxjs/toolkit'
import filterReducer from './filterSlice'
import userReducer from './userSlice'
import requestReducer from './requestSlice'
import deviceReducer from './deviceSlice'

export const store = configureStore({
  reducer: {
    filters: filterReducer,
    user: userReducer,
    request: requestReducer,
    device: deviceReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
