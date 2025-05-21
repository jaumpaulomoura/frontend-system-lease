import { destroyCookie, parseCookies } from "nookies";
import type { NextApiRequest, NextApiResponse } from "next";
import api from "@services/gateway";
import { AxiosError } from "axios";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = parseCookies({ req });
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Requisição não autorizada" });
  }

  try {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const { data } = await api.post("/auth/me");
    const { user } = data;

    return res.status(200).json(user);
  } catch (err: unknown) {
    const error = err as AxiosError<{ message: string }>;

    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message || "Erro interno no servidor";

    // Limpa o cookie se for 401 ou 403
    if ([401, 403].includes(status)) {
      destroyCookie({ res }, "auth_token", { path: "/" });
    }

    return res.status(status).json({ message });
  }
};
