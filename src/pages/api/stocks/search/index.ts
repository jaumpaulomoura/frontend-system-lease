/* eslint-disable @typescript-eslint/no-explicit-any */
import { StockProps } from "@interfaces/Stock";
import api from "@services/gateway";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, response: NextApiResponse) => {
  const parsedCookies = parseCookies({ req });
  const token = parsedCookies.auth_token;

  // Verifica se o token está presente
  if (!token) {
    return response.status(401).json({ error: "Requisição não autorizada" });
  }

  const { query } = req;
  const { idProduct } = query; // Nome correto do parâmetro

  // Validação do parâmetro idProduct
  if (!idProduct) {
    return response.status(400).json({ error: "idProduct não fornecido" });
  }

  try {
    // Configura o token de autorização
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    const idProductNumber = Number(idProduct); // Converte para número
    const res = await api.get<StockProps[]>(
      `/stocks/filtered-stocks/${idProductNumber}`
    );

    const data = res.data;

    // Retorna os dados do estoque
    return response.status(200).json(data);
  } catch (error: any) {
    console.error("Erro ao buscar dados de estoque:", error);
    return response
      .status(500)
      .json({ error: "Erro interno ao processar a requisição" });
  }
};
