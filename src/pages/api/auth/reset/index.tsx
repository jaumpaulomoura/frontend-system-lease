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

    const { data } = await api.post("/auth/reset", {
      password: newPassword,
      token, // <- token no body, conforme o backend espera
    });

    return res.status(200).json({ token: data.accessToken });
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
