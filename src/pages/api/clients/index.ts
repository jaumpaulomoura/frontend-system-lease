/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientProps } from "@interfaces/Client";
import api from "@services/gateway";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, response: NextApiResponse) => {
  const parsedCookies = parseCookies({ req });
  const token = parsedCookies.auth_token;

  if (!token) {
    throw new Error("Requisição não autorizada");
  }

  try {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    const res = await api.get<ClientProps[]>("/clients");

    const data = res.data;

    response.status(200).json(data);
  } catch (error: any) {
    return new Response(error);
  }
};
