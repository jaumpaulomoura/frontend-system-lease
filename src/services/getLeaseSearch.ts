// import { MaterialProps } from '@interfaces/Material'
// import axios, { AxiosResponse } from 'axios'

// import api from './api-routes'

// export async function getMaterialsSearch(
//   name: string
// ): Promise<MaterialProps[]> {
//   try {
//     const response: AxiosResponse<MaterialProps[]> = await api.get(
//       '/api/materials',
//       {
//         params: { name }
//       }
//     )

//     return response.data
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data.message)
//     }

//     throw new Error(`Unexpected error ocurred ${error}`)
//   }
// }
