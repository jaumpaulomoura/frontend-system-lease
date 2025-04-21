import { NextApiRequest, NextApiResponse } from "next";
import { AxiosError } from "axios";
import api from "@services/gateway";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email é obrigatório",
      });
    }

    // Chama o backend externo (gateway) com o email
    const { data } = await api.post("/auth/forget", { email });

    return res.status(200).json(data); // Retorna a resposta da API externa
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);

    if (error instanceof AxiosError) {
      return res.status(error.response?.status || 500).json({
        error: error.response?.data?.message || "Falha ao enviar e-mail",
      });
    }

    return res.status(500).json({
      error: "Erro interno no servidor",
    });
  }
}
