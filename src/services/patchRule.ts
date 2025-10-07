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

export async function patchRule(data: Props, id: number): Promise<RuleProps> {
  try {
    const response: AxiosResponse<RuleProps> = await api.post(
      `/api/rules/patch/`,
      { ...data, id }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
