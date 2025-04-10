import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import api from "@services/gateway";
import { AxiosError } from "axios";

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

interface LeaseRequestBody {
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
  valor_total: number;
  valor_multa: number;
  status: string;
  observacoes?: string;
  leaseItems: LeaseItem[];
}

interface ApiErrorResponse {
  error: string;
  message?: string;
  status?: number;
  missingFields?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaseRequestBody | ApiErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const body: Partial<LeaseRequestBody> = req.body;

  console.log(
    "📦 Dados recebidos na API de locação:",
    JSON.stringify(body, null, 2)
  );
  // Validate required fields
  const requiredFields: (keyof LeaseRequestBody)[] = [
    "cliente_id",
    "rua_locacao",
    "numero_locacao",
    "bairro_locacao",
    "cidade_locacao",
    "estado_locacao",
    "cep_locacao",
    "data_inicio",
    "data_prevista_devolucao",
    "valor_total",
    "valor_multa",
    "status",
    "leaseItems",
  ];

  const missingFields = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Campos obrigatórios faltando",
      missingFields,
    });
  }

  // Validate leaseItems
  if (body.leaseItems && body.leaseItems.length === 0) {
    return res.status(400).json({
      error: "Pelo menos um item de locação é obrigatório",
    });
  }

  const { auth_token: token } = parseCookies({ req });

  if (!token) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    const response = await api.post<LeaseRequestBody>("/leases", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.status(201).json(response.data);
  } catch (error) {
    console.error("Erro ao criar locação:", error);

    if (error instanceof AxiosError) {
      return res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || "Erro na requisição",
        message: error.response?.data?.message,
        status: error.response?.status,
      });
    }

    return res.status(500).json({
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
