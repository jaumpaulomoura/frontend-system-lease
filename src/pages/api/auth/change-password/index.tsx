import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
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
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        error: "Nova senha é obrigatória",
      });
    }

    const { auth_token: token } = parseCookies({ req });

    if (!token) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    // Chama endpoint específico do backend para alterar senha (usuário logado)
    await api.post(
      "/auth/change-password",
      {
        password: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(200).json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);

    if (error instanceof AxiosError) {
      return res.status(error.response?.status || 500).json({
        error: error.response?.data?.message || "Falha ao alterar senha",
      });
    }

    return res.status(500).json({
      error: "Erro interno no servidor",
    });
  }
}
