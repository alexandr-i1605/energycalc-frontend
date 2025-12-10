import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
    }
  }
})

export const { setSearch } = filterSlice.actions
export default filterSlice.reducer
