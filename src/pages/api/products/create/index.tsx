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
    name,
    marca,
    description,
    daily_value,
    fortnightly_value,
    weekly_value,
    monthly_value,
    annual_value,
    active,
  } = req.body;
  const { auth_token: token } = parseCookies({ req });

  if (!token) {
    return res.status(401).json({ error: "Requisição não autorizada" });
  }

  try {
    const response = await api.post(
      "/products",
      {
        name,
        marca,
        description,
        daily_value,
        fortnightly_value,
        weekly_value,
        monthly_value,
        annual_value,
        active,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error(
      "Erro ao criar produto:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || "Erro interno do servidor",
    });
  }
}
