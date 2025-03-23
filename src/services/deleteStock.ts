import { StockProps } from "@interfaces/Stock";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

export async function deleteStock(id: string): Promise<StockProps> {
  try {
    const response: AxiosResponse<StockProps> = await api.get(
      `/api/stocks/delete/${id}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
