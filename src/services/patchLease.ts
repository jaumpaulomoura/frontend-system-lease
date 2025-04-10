import { LeaseProps } from "@interfaces/Lease";
import axios, { AxiosResponse } from "axios";
import api from "./api-routes";

interface PatchLeasePayload {
  id_locacao: number; // Corrigi o typo "id_locaacao" para "id_locacao"
  cliente_id?: number;
  rua_locacao?: string;
  numero_locacao?: string;
  complemento_locacao?: string | null;
  bairro_locacao?: string;
  cidade_locacao?: string;
  estado_locacao?: string;
  cep_locacao?: string;
  data_inicio?: string;
  data_prevista_devolucao?: string;
  data_real_devolucao?: string | null;
  valor_total?: number;
  valor_multa?: number;
  status?: string;
  observacoes?: string | null;
  leaseItems?: Array<{
    id_patrimonio: number;
    valor_unit_diario: number;
    valor_unit_semanal: number;
    valor_unit_mensal: number;
    valor_negociado_diario: number;
    valor_negociado_semanal: number;
    valor_negociado_mensal: number;
  }>;
}

export async function patchLease(
  data: PatchLeasePayload,
  id: number
): Promise<LeaseProps> {
  console.log("Iniciando patchLease...");
  console.log("ID da locação:", id);
  console.log("Dados recebidos:", JSON.stringify(data, null, 2));

  try {
    console.log("Enviando requisição PATCH para:", `/api/leases/patch/`);

    const payload = { ...data, id };
    console.log("Payload completo:", JSON.stringify(payload, null, 2));

    const response: AxiosResponse<LeaseProps> = await api.post(
      `/api/leases/patch/`,
      payload
    );

    console.log("Resposta da API:", {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.error("Erro no patchLease:");

    if (axios.isAxiosError(error)) {
      console.error("Detalhes do erro Axios:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || error.message);
    }

    console.error("Erro desconhecido:", error);
    throw new Error(`Unexpected error occurred: ${error}`);
  } finally {
    console.log("Finalizando execução de patchLease");
  }
}
