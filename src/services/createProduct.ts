import { ProductProps } from "@interfaces/Product";

import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProduct(data: any): Promise<ProductProps> {
  try {
    const response: AxiosResponse<ProductProps> = await api.post(
      `/api/products/create/`,
      { ...data }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
