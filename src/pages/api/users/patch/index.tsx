/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@services/gateway";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

export default async (req: NextApiRequest, response: NextApiResponse) => {
  const { name, user, email, document, password, id } = req.body;

  const parsedCookies = parseCookies({ req });
  const token = parsedCookies.auth_token;

  if (!token) {
    throw new Error("Requisição não autorizada");
  }

  try {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    const res: any = await (() => {
      return api
        .patch<any>(`/users/${id}`, { name, user, email, document, password })
        .then((resp) => resp.data);
    })();

    response.status(200).json({ ...res });
  } catch (error: any) {
    return new Response(error);
  }
};
