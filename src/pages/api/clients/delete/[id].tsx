// pages/api/clients/delete/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import api from "@services/gateway";
import { AxiosError } from "axios";

interface DeleteResponse {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { id } = req.query; // Obtém o ID da URL
  const { auth_token: token } = parseCookies({ req });

  if (!token) {
    return res.status(401).json({ error: "Requisição não autorizada" });
  }

  try {
    const response = await api.delete<DeleteResponse>(`/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.status(200).json(response.data);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      // Se for um erro Axios, temos acesso a error.response
      console.error(
        "Erro ao excluir produto:",
        error.response?.data || error.message
      );
      return res.status(error.response?.status || 500).json({
        error: error.response?.data || "Erro interno do servidor",
      });
    }

    // Se não for erro do Axios, tratamos como erro desconhecido
    console.error("Erro desconhecido:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
}
