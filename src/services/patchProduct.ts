import { ProductProps } from "@interfaces/Product";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

interface Props {
  name: string;
  marca?: string;
  description?: string;
  daily_value?: number | null;
  weekly_value?: number | null;
  monthly_value?: number | null;
  annual_value?: number | null;
  active: boolean;
  image?: string;
}

export async function patchProduct(
  data: Props,
  id: number
): Promise<ProductProps> {
  try {
    // Formatar os valores monetários, caso sejam definidos
    const formattedData = {
      ...data,
      daily_value: data.daily_value != null ? data.daily_value : null,
      weekly_value: data.weekly_value != null ? data.weekly_value : null,
      monthly_value: data.monthly_value != null ? data.monthly_value : null,
      annual_value: data.annual_value != null ? data.annual_value : null,
    };

    const response: AxiosResponse<ProductProps> = await api.post(
      `/api/products/patch/`,
      { ...formattedData, id }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error occurred: ${error}`);
  }
}
