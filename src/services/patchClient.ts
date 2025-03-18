import { SectionProps } from '@interfaces/Section'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

export async function patchEstoque(
  quantity: number,
  id: number
): Promise<SectionProps> {
  try {
    const response: AxiosResponse<SectionProps> = await api.post(
      `/api/estoques/patch/`,
      { quantity, id }
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message)
    }

    throw new Error(`Unexpected error ocurred ${error}`)
  }
}
