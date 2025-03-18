/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@services/gateway";
import { NextApiRequest, NextApiResponse } from "next";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, response: NextApiResponse) => {
  const { email, password } = req.body;

  try {
    const res: any = await (() => {
      return api
        .post<any>("/auth/login", { email, password })
        .then((resp) => resp.data);
    })();

    const accessToken = res?.accessToken;

    response.status(200).json({ accessToken });
  } catch (error: any) {
    return new Response(error);
  }
};
