import { RuleProps } from "@interfaces/Rule";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

interface Props {
  id: number;
  dayIni: number;
  dayFin: number;
  campo: string;
  operador?: string;
  valor?: number;
  active: boolean;
}

export async function createRule(data: Props): Promise<RuleProps> {
  try {
    const response: AxiosResponse<RuleProps> = await api.post(
      `/api/rules/create/`,
      { ...data }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error; // ← jogue o erro original (com status/message/etc)
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
