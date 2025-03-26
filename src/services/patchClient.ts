import { ClientProps } from "@interfaces/Client";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

export async function patchClient(
  clientData: ClientProps, // Passa os dados completos do cliente
  id: number // Passa o ID do cliente
): Promise<ClientProps> {
  try {
    const response: AxiosResponse<ClientProps> = await api.put(
      `/api/clients/patch/${id}`, // Usando PUT para atualizar o recurso com base no ID
      clientData // Envia os dados do cliente
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error occurred: ${error}`);
  }
}
