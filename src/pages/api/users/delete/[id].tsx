import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import api from "@services/gateway";
import { AxiosError } from "axios"; // Import AxiosError type

interface DeleteResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
  status?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteResponse | ErrorResponse>
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { id } = req.query;
  const { auth_token: token } = parseCookies({ req });

  if (!token) {
    return res.status(401).json({ error: "Requisição não autorizada" });
  }

  try {
    const response = await api.delete<DeleteResponse>(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);

    if (error instanceof AxiosError) {
      // Handle Axios-specific errors
      return res.status(error.response?.status || 500).json({
        error: error.response?.data?.message || "Erro na requisição",
        status: error.response?.status,
      });
    }

    // Handle generic errors
    return res.status(500).json({
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
