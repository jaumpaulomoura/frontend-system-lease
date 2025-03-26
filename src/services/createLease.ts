// import { MovPedProps } from '@interfaces/MovPed'
// import axios, { AxiosResponse } from 'axios'

// import api from './api-routes'

// interface Props {
//   pedVenId: number
//   sectionId: number
//   dateEnt: string
//   dateSai: string
// }

// export async function createMovPeds(data: Props): Promise<MovPedProps> {
//   try {
//     const response: AxiosResponse<MovPedProps> = await api.post(
//       `/api/movPeds/create/`,
//       { ...data }
//     )
//     return response.data
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data.message)
//     }

//     throw new Error(`Unexpected error ocurred ${error}`)
//   }
// }
