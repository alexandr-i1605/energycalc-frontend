import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { logoutUserAsync } from './userSlice'

interface FilterState {
  search: string
}

const initialState: FilterState = {
  search: ''
}

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    clearFilters(state) {
      state.search = ''
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUserAsync.fulfilled, (state) => {
      state.search = ''
    })
  }
})

export const { setSearch, clearFilters } = filterSlice.actions
export default filterSlice.reducer
