import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@redux/baseApi'

export const ticketApi = createApi({
  reducerPath: 'ticketApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    checkTicket: builder.mutation({
      query: (ticketCode: string) => ({
        url: `/admin/tickets/checkin`,
        method: 'GET',
        params: { ticketCode },
      }),
    }),
    confirmCheckin: builder.mutation({
      query: (ticketCode: string) => ({
        url: `/admin/tickets/checkin`,
        method: 'POST',
        data: { ticketCode },
      }),
    }),
    getCheckinLogs: builder.query({
  query: ({ limit = 10, offset = 0 }) => ({
    url: `/admin/tickets/checkin/logs?limit=${limit}&offset=${offset}`,
    method: "GET",
  }),
}),

  }),
})

export const { useCheckTicketMutation, useConfirmCheckinMutation, useGetCheckinLogsQuery } = ticketApi
