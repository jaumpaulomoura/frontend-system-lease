import api from "@services/gateway";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

interface LeaseUpdateData {
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

interface ApiResponse {
  success: boolean;
  data?: LeaseUpdateData;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  console.log("--- INÍCIO DA REQUISIÇÃO PATCH ---");
  console.log("Método:", req.method);
  console.log("Endpoint:", req.url);
  console.log("Headers:", req.headers);

  // if (req.method !== "PATCH") {
  //   console.log("Erro: Método não permitido");
  //   return res
  //     .status(405)
  //     .json({ success: false, error: "Method not allowed" });
  // }

  console.log("Corpo da requisição:", JSON.stringify(req.body, null, 2));

  const { id, ...updateData }: { id: string } & LeaseUpdateData = req.body;

  if (!id) {
    console.error("Erro: ID da locação não fornecido");
    return res.status(400).json({
      success: false,
      error: "Lease ID is required",
    });
  }

  console.log(`Atualizando locação ID: ${id}`);
  console.log("Dados para atualização:", JSON.stringify(updateData, null, 2));

  // Verificação de itens
  if (updateData.leaseItems) {
    console.log(`Quantidade de itens: ${updateData.leaseItems.length}`);
    updateData.leaseItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        patrimonio: item.id_patrimonio,
        valor_mensal: item.valor_negociado_mensal,
        valor_semanal: item.valor_negociado_semanal,
        valor_diario: item.valor_negociado_diario,
      });
    });
  }

  const parsedCookies = parseCookies({ req });
  const token = parsedCookies.auth_token;

  if (!token) {
    console.error("Erro: Token de autenticação não encontrado");
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  try {
    console.log("Configurando cabeçalho de autorização...");
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    console.log("Enviando requisição para a API...");
    const response = await api.patch<LeaseUpdateData>(
      `/leases/${id}`,
      updateData
    );

    console.log("Resposta da API:", {
      status: response.status,
      data: response.data,
    });

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error: unknown) {
    console.error("\n--- ERRO NA ATUALIZAÇÃO ---");
    console.error("Tipo do erro:", typeof error);

    if (typeof error === "object" && error !== null) {
      const axiosError = error as {
        response?: {
          status: number;
          data?: { message?: string };
        };
        message?: string;
      };

      console.error("Detalhes do erro:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to update lease";
      const statusCode = axiosError.response?.status || 500;

      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }

    console.error("Erro desconhecido:", error);
    return res.status(500).json({
      success: false,
      error: "An unknown error occurred",
    });
  } finally {
    console.log("--- FIM DA REQUISIÇÃO PATCH ---\n");
  }
}
