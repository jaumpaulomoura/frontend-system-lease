import { MovPedProps } from '@interfaces/MovPed'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

export async function deleteMovPeds(id: string): Promise<MovPedProps> {
  try {
    const response: AxiosResponse<MovPedProps> = await api.get(
      `/api/movPeds/delete/${id}`
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message)
    }

    throw new Error(`Unexpected error ocurred ${error}`)
  }
}
