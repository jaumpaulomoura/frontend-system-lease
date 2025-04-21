import { NextApiRequest, NextApiResponse } from "next";

import api from "@services/gateway";
import { AxiosError } from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { password, token } = req.body; // Recebe os campos que o backend espera

    if (!password || !token) {
      return res.status(400).json({
        error: "Senha e token são obrigatórios",
      });
    }

    // Chama diretamente o endpoint do backend NestJS
    const { data } = await api.post("/auth/reset", {
      password,
      token,
    });

    return res.status(200).json({
      message: "Senha redefinida com sucesso",
      accessToken: data.accessToken,
    });
  } catch (error) {
    console.error("Erro ao resetar senha:", error);

    if (error instanceof AxiosError) {
      return res.status(error.response?.status || 500).json({
        error: error.response?.data?.message || "Falha ao resetar senha",
      });
    }

    return res.status(500).json({
      error: "Erro interno no servidor",
    });
  }
}
