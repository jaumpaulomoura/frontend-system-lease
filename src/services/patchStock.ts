import { StockProps } from "@interfaces/Stock";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

interface Props {
  status: string;
}

export async function patchStock(data: Props, id: number): Promise<StockProps> {
  try {
    const response: AxiosResponse<StockProps> = await api.post(
      `/api/stocks/patch/`,
      { ...data, id }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
