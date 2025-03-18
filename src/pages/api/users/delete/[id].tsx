// pages/api/users/delete/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import api from "@services/gateway";

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
    const response = await api.delete<DeleteResponse>(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error(
      "Erro ao excluir usuário:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || "Erro interno do servidor",
    });
  }
}
