import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import api from "@services/gateway";
import { AxiosError } from "axios";

interface RuleRequestBody {
  id: number;
  dayIni: number;
  dayFin: number;
  campo: string;
  operador?: string;
  valor?: number;
  active: boolean;
}

interface ApiErrorResponse {
  error: string;
  message?: string;
  status?: number;
  missingFields?: string[]; // Add missingFields to the interface
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RuleRequestBody | ApiErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const body: Partial<RuleRequestBody> = req.body;

  // Validate required fields
  const requiredFields: (keyof RuleRequestBody)[] = [
    "dayIni",
    "dayFin",
    "campo",
    "operador",
    "valor",
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
    const response = await api.post<RuleRequestBody>("/rules", body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Erro ao criar rulee:", error);

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
