import { ClientProps } from "@interfaces/Client";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

export async function getClientsSearch(name: string): Promise<ClientProps[]> {
  try {
    const response: AxiosResponse<ClientProps[]> = await api.get(
      "/api/clients",
      {
        params: { name },
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
