import axios from 'axios'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosRequestConfig, AxiosError } from 'axios'
import { BASE_REQUEST } from '@themes/constants'
import { IAppData } from './store'

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: BASE_REQUEST.API_URL }
  ): BaseQueryFn<
    {
      url: string
      method?: AxiosRequestConfig['method']
      data?: AxiosRequestConfig['data']
      params?: AxiosRequestConfig['params']
      headers?: AxiosRequestConfig['headers']
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers }, { getState }) => {
    try {
     
      const state = getState() as IAppData;
      const token = state.account?.token;
     const endpoint = (getState() as IAppData).app?.endpoint || baseUrl;

      const result = await axios({
        url: endpoint + url ,
        method,
        data,
        params,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}), 
          ...headers
        },
        timeout: 10000
      })

      console.log('request API', result)

      return { data: result.data }
    } catch (axiosError) {
      const err = axiosError as AxiosError
      console.log('err', err);
      
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message
        }
      }
    }
  }
