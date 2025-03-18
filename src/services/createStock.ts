import { PedVenProps } from '@interfaces/PedVen'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createPedVen(data: any): Promise<PedVenProps> {
  try {
    const response: AxiosResponse<PedVenProps> = await api.post(
      `/api/pedVens/create/`,
      { ...data }
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message)
    }

    throw new Error(`Unexpected error ocurred ${error}`)
  }
}
