import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import api from "@services/gateway";
import { AxiosError } from "axios";

interface ClientRequestBody {
  name: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  rua_cobranca: string;
  numero_cobranca: string;
  complemento_cobranca?: string;
  bairro_cobranca: string;
  cidade_cobranca: string;
  estado_cobranca: string;
  cep_cobranca: string;
}

interface ApiErrorResponse {
  error: string;
  message?: string;
  status?: number;
  missingFields?: string[]; // Add missingFields to the interface
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClientRequestBody | ApiErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const body: Partial<ClientRequestBody> = req.body;

  // Validate required fields
  const requiredFields: (keyof ClientRequestBody)[] = [
    "name",
    "cpf_cnpj",
    "telefone",
    "email",
    "rua",
    "numero",
    "bairro",
    "cidade",
    "estado",
    "cep",
    "rua_cobranca",
    "numero_cobranca",
    "bairro_cobranca",
    "cidade_cobranca",
    "estado_cobranca",
    "cep_cobranca",
  ];

  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Campos obrigatórios faltando",
      missingFields: missingFields as string[], // Explicitly type as string[]
    });
  }

  const { auth_token: token } = parseCookies({ req });

  if (!token) {
    return res.status(401).json({ error: "Requisição não autorizada" });
  }

  try {
    const response = await api.post<ClientRequestBody>("/clients", body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);

    if (error instanceof AxiosError) {
      return res.status(error.response?.status || 500).json({
        error: error.response?.data?.message || "Erro na requisição",
        status: error.response?.status,
      });
    }

    return res.status(500).json({
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
