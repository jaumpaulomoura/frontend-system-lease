import { StockProps } from "@interfaces/Stock";

import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createStock(data: any): Promise<StockProps> {
  try {
    const response: AxiosResponse<StockProps> = await api.post(
      `/api/stocks/create/`,
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
