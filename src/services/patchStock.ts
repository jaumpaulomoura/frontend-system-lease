import { MovPedProps } from '@interfaces/MovPed'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

interface Props {
  dateSai: string
  sectionId: number
  pedVenId: number
}

export async function patchMovPed(
  data: Props,
  id: number
): Promise<MovPedProps> {
  try {
    const response: AxiosResponse<MovPedProps> = await api.post(
      `/api/movPeds/patch/`,
      { ...data, id }
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message)
    }

    throw new Error(`Unexpected error ocurred ${error}`)
  }
}
