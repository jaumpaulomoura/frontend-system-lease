import { SectionProps } from '@interfaces/Section'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

interface Props {
  name: string
  order: number
}

export async function patchSection(
  data: Props,
  id: number
): Promise<SectionProps> {
  try {
    const response: AxiosResponse<SectionProps> = await api.post(
      `/api/sections/patch/`,
      { ...data, id }
    )

    console.log(response.data)

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message)
    }

    throw new Error(`Unexpected error ocurred ${error}`)
  }
}
