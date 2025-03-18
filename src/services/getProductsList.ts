import { ProductProps } from '@interfaces/Products'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

export async function getProductList(): Promise<ProductProps[]> {
  try {
    const response: AxiosResponse<ProductProps[]> = await api.get(
      '/api/products'
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message)
    }

    throw new Error(`Unexpected error ocurred ${error}`)
  }
}
