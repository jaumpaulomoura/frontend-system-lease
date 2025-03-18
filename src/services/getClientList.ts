import { EstoqueProps } from '@interfaces/Estoque'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

export async function getEstoqueList(): Promise<EstoqueProps[]> {
  try {
    const response: AxiosResponse<EstoqueProps[]> = await api.get(
      '/api/estoques'
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message)
    }

    throw new Error(`Unexpected error ocurred ${error}`)
  }
}
