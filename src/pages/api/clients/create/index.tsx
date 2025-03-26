import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import api from "@services/gateway";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const body: Partial<ClientRequestBody> = req.body;

  if (
    !body.name ||
    !body.cpf_cnpj ||
    !body.telefone ||
    !body.email ||
    !body.rua ||
    !body.numero ||
    !body.bairro ||
    !body.cidade ||
    !body.estado ||
    !body.cep ||
    !body.rua_cobranca ||
    !body.numero_cobranca ||
    !body.bairro_cobranca ||
    !body.cidade_cobranca ||
    !body.estado_cobranca ||
    !body.cep_cobranca
  ) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }

  const { auth_token: token } = parseCookies({ req });

  if (!token) {
    return res.status(401).json({ error: "Requisição não autorizada" });
  }

  try {
    const response = await api.post("/clients", body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.status(200).json(response.data);
  } catch (error: unknown) {
    console.error("Erro ao criar cliente:", error);

    let status = 500;
    let message = "Erro interno do servidor";

    if (typeof error === "object" && error !== null && "response" in error) {
      const axiosError = error as { response?: { status: number; data: any } };
      status = axiosError.response?.status || 500;
      message = axiosError.response?.data || message;
    }

    return res.status(status).json({ error: message });
  }
}
