import { UserProps } from '@interfaces/User'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

interface Props {
  id?: number
  name: string
  password: string
  email: string
  document: string
}

export async function createUser(data: Props): Promise<UserProps> {
  try {
    const response: AxiosResponse<UserProps> = await api.post(
      `/api/users/create/`,
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
