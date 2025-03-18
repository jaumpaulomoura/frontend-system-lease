import { ProductProps } from '@interfaces/Products'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

interface Props {
  name: string
  image?: string
  description?: string
  skus: []
}

export async function patchProduct(
  data: Props,
  id: number
): Promise<ProductProps> {
  try {
    const response: AxiosResponse<ProductProps> = await api.post(
      `/api/products/patch/`,
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
