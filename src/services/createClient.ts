import { ClientProps } from "@interfaces/Client";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

interface Props {
  name: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  rua_cobranca: string;
  numero_cobranca: string;
  complemento_cobranca: string;
  bairro_cobranca: string;
  cidade_cobranca: string;
  estado_cobranca: string;
  cep_cobranca: string;
}

export async function createClient(data: Props): Promise<ClientProps> {
  try {
    const response: AxiosResponse<ClientProps> = await api.post(
      `/api/clients/create/`,
      { ...data }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error; // ← jogue o erro original (com status/message/etc)
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
