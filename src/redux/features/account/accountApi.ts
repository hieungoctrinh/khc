import { axiosBaseQuery } from '@redux/baseApi'
import { createApi } from '@reduxjs/toolkit/query/react'
import { accountLoginRequest, DeleteAccountResponse, registerDomainRequest } from './accountType'
import { clearAccountData, setToken, setUser } from './accountSlice'
import { setEndpoint, clearEndpoint } from '../app/appSlice'
import NavigationServices from '@navigation/NavigationServices'
import RegisterDomain from '@screens/Auth/RegisterDomain'

export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    accountLogin: builder.mutation({
      query: (body: accountLoginRequest) => ({
        url: '/auth/app/login',
        method: 'POST',
        data: body,
      }),

      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        console.log('login request payload', body)
        try {
          const { data } = await queryFulfilled
          const token = data.data?.accessToken
          const dataUser = data.data

          if (token) {
            const endpoint = data.data?.endpoint

            await Promise.all([
              dispatch(setToken(token)),
              dispatch(setUser(dataUser)),
              ...(endpoint ? [dispatch(setEndpoint(endpoint))] : []),
            ])
            NavigationServices.navigate('HomeScreen')
          }
        } catch (error) {
          console.log('Login error:', error)
        }
      },
    }),

    logOutAccount: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),

      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch {
          // ignore errors on logout
        }

        // ✅ Clear toàn bộ data account + endpoint
        await Promise.all([
          dispatch(clearAccountData()),
          dispatch(clearEndpoint()),
        ])

        // Optionally: reset navigation
        // NavigationServices.reset(NAME_SCREEN.LoginScreen)
      },
    }),

    registerAccount: builder.mutation({
      query: (body: accountLoginRequest) => ({
        url: '/auth/app/register',
        method: 'POST',
        data: body,
      }),
    }),
   deleteAccount: builder.mutation<DeleteAccountResponse, void>({
    query: () => ({
      url: '/users/app/me',
      method: 'DELETE',
        }),
      }),
   
  }),
})

export const { useAccountLoginMutation, useLogOutAccountMutation, useRegisterAccountMutation, useDeleteAccountMutation } = accountApi
