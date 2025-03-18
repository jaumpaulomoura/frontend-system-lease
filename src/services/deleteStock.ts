import { PedEntProps } from '@interfaces/PedEnt'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

export async function deletePedEnt(id: string): Promise<PedEntProps> {
  try {
    const response: AxiosResponse<PedEntProps> = await api.get(
      `/api/pedEnts/delete/${id}`
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message)
    }

    throw new Error(`Unexpected error ocurred ${error}`)
  }
}
