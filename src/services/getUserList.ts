import { UserProps } from '@interfaces/User'
import axios, { AxiosResponse } from 'axios'

import api from './api-routes'

export async function getUserList(): Promise<UserProps[]> {
  try {
    const response: AxiosResponse<UserProps[]> = await api.get('/api/users')

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message)
    }

    throw new Error(`Unexpected error ocurred ${error}`)
  }
}
