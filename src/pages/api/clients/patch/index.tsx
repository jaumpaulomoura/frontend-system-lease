/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@services/gateway";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, response: NextApiResponse) => {
  const {
    name,
    cpf_cnpj,
    telefone,
    email,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    cep,
    rua_cobranca,
    numero_cobranca,
    complemento_cobranca,
    bairro_cobranca,
    cidade_cobranca,
    estado_cobranca,
    cep_cobranca,
    id,
  } = req.body;

  const parsedCookies = parseCookies({ req });
  const token = parsedCookies.auth_token;

  if (!token) {
    throw new Error("Requisição não autorizada");
  }

  try {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    const res: any = await api
      .patch<any>(`/clients/${id}`, {
        name,
        cpf_cnpj,
        telefone,
        email,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        rua_cobranca,
        numero_cobranca,
        complemento_cobranca,
        bairro_cobranca,
        cidade_cobranca,
        estado_cobranca,
        cep_cobranca,
      })
      .then((resp) => resp.data);

    response.status(200).json({ ...res });
  } catch (error: any) {
    return new Response(error);
  }
};
