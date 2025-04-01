/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@services/gateway";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, response: NextApiResponse) => {
  console.log("Iniciando requisição para atualizar status do produto");
  console.log("Método:", req.method);
  console.log("Body recebido:", req.body);

  const { status, id } = req.body;
  console.log(`Parâmetros recebidos - ID: ${id}, Novo Status: ${status}`);

  const parsedCookies = parseCookies({ req });
  const token = parsedCookies.auth_token;
  console.log("Token encontrado nos cookies:", token ? "Sim" : "Não");

  if (!token) {
    console.error("Erro: Token de autenticação não encontrado");
    throw new Error("Requisição não autorizada");
  }

  try {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    console.log("Headers configurados:", api.defaults.headers.common);

    console.log(`Enviando PATCH para /stocks/${id} com status: ${status}`);
    const res: any = await api
      .patch<any>(`/stocks/${id}`, {
        status,
      })
      .then((resp) => {
        console.log("Resposta da API:", resp.data);
        return resp.data;
      });

    console.log("Requisição concluída com sucesso");
    response.status(200).json({ ...res });
  } catch (error: any) {
    console.error("Erro na requisição:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    return response.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
};
