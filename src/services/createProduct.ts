import { PedEntProps } from '@interfaces/PedEnt'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createPedEnt(data: any): Promise<PedEntProps> {
  try {
    const response: AxiosResponse<PedEntProps> = await api.post(
      `/api/pedEnts/create/`,
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
