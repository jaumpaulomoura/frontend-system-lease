import { StockProps } from "@interfaces/Stock";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

export async function getStocksSearch(
  idProduct: string
): Promise<StockProps[]> {
  try {
    console.log(idProduct);
    const response: AxiosResponse<StockProps[]> = await api.get(
      "/api/stocks/search",
      {
        params: { idProduct },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
