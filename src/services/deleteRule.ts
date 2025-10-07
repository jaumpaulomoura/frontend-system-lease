import { RuleProps } from "@interfaces/Rule";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

export async function deleteRule(id: string): Promise<RuleProps> {
  try {
    const response: AxiosResponse<RuleProps> = await api.delete(
      `/api/rules/delete/${id}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
