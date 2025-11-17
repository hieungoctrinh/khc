import {
  combineReducers,
  configureStore,
  isRejectedWithValue
} from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { accountReducer } from './features/account/accountSlice'
import { accountApi } from './features/account/accountApi'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE
} from 'redux-persist'
import { ticketApi } from './features/ticket/ticketApi'
import { appReducer } from './features/app/appSlice'

const persistAccountConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  blacklist: [''],
  whitelist: ['token', 'user']
}

const persistAppConfig = {
  key: 'app',
  version: 1,
  storage: AsyncStorage,
  blacklist: [''],
  whitelist: ['endpoint', 'clubName', 'logo']
}

const persistAccount = persistReducer(persistAccountConfig, accountReducer)
const persistApp = persistReducer(persistAppConfig, appReducer)

const rootReducer = combineReducers({
  account: persistAccount,
  app: persistApp,
  [accountApi.reducerPath]: accountApi.reducer,
  [ticketApi.reducerPath]: ticketApi.reducer
  
})

export const rtkQueryErrorLogger =
  (api: any) => (next: any) => (action: any) => {
    // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
    if (isRejectedWithValue(action)) {
      console.log('isRejectedWithValue', action.error, action.payload, api)
    }

    return next(action)
  }

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(accountApi.middleware, ticketApi.middleware,rtkQueryErrorLogger)
})

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)

export default store

//export const persistor = persistStore(store)

export type IAppData = {
  account: {
    token: string
    user: object
  }
  app: {
    endpoint: string
    clubName: string
    logo: string
  }
}
