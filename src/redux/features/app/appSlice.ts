import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  endpoint: string | null;
   logo?: string | null;
  clubName?: string | null;
}

const initialState: AppState = {
  endpoint: null,
   logo: null,
  clubName: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setEndpoint: (state, action: PayloadAction<string>) => {
      state.endpoint = action.payload;
    },
    setClubInfo: (state, action) => {
      state.logo = action.payload.logo;
      state.clubName = action.payload.clubName;
    },
    clearEndpoint: (state) => {
      state.endpoint = null;
        state.logo = null;
      state.clubName = null;
    },
  },
});

export const { setEndpoint, clearEndpoint, setClubInfo } = appSlice.actions;
export const appReducer = appSlice.reducer;
