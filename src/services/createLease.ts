import { LeaseProps } from "@interfaces/Lease";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";
interface LeaseItem {
  id_patrimonio: number;
  valor_unit_diario: number;
  valor_unit_semanal: number;
  valor_unit_mensal: number;
  valor_unit_anual: number;
  valor_negociado_diario: number;
  valor_negociado_semanal: number;
  valor_negociado_mensal: number;
  valor_negociado_anual: number;
}
interface Props {
  cliente_id: number;
  rua_locacao: string;
  numero_locacao: string;
  complemento_locacao?: string;
  bairro_locacao: string;
  cidade_locacao: string;
  estado_locacao: string;
  cep_locacao: string;
  data_inicio: string;
  data_prevista_devolucao: string;
  data_real_devolucao?: string;
  data_pagamento?: string;
  valor_total: number;
  valor_multa: number;
  valor_frete: number;
  status: string;
  observacoes?: string | null;
  leaseItems: LeaseItem[];
}

export async function createLease(data: Props): Promise<LeaseProps> {
  try {
    const response: AxiosResponse<LeaseProps> = await api.post(
      `/api/leases/create/`,
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
