import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: '',
  user: {}
}

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    clearAccountData: state => {
      state.token = ''
      state.user = {}
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    setUser: (state, action) => {
      state.user = action.payload
    }
  }
})

export const { clearAccountData, setToken, setUser } = accountSlice.actions
export const accountReducer = accountSlice.reducer

export default accountSlice
