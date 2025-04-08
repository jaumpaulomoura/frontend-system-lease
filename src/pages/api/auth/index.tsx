/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@services/gateway";
import { NextApiRequest, NextApiResponse } from "next";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, response: NextApiResponse) => {
  const { email, password } = req.body;

  try {
    const res: any = await api.post<any>("/auth/login", { email, password });
    const accessToken = res?.data?.accessToken;

    return response.status(200).json({ accessToken });
  } catch (error: any) {
    console.error("Erro ao logar:", error?.response?.data || error.message);

    return response.status(500).json({
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Erro interno no servidor",
    });
  }
};
