import { MaterialProps } from '@interfaces/Material'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

interface Props {
  name: string
  unitMed: string
}

export async function createMaterial(data: Props): Promise<MaterialProps> {
  try {
    const response: AxiosResponse<MaterialProps> = await api.post(
      `/api/materials/create/`,
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
