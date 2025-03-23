/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@services/gateway";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const {
    id_produto,
    numero_patrimonio,
    nota_fiscal,
    valor_pago,
    status,
    observacoes = null, // Aqui, definimos como null quando não enviado
  } = req.body;

  const { auth_token: token } = parseCookies({ req });

  if (!token) {
    return res.status(401).json({ error: "Requisição não autorizada" });
  }

  try {
    // Console para verificar os dados antes da requisição
    console.log("Dados enviados para o estoque:", {
      id_produto,
      numero_patrimonio,
      nota_fiscal,
      valor_pago,
      status,
      observacoes,
    });

    const response = await api.post(
      "/stocks",
      {
        id_produto,
        numero_patrimonio,
        nota_fiscal,
        valor_pago,
        status,
        observacoes,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Console para verificar a resposta da API
    console.log("Resposta da API:", response.data);

    return res.status(200).json(response.data);
  } catch (error: any) {
    // Console para erros
    console.error(
      "Erro ao adicionar ao estoque:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      error: error.response?.data || "Erro interno do servidor",
    });
  }
}
