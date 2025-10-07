import { RuleProps } from "@interfaces/Rule";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

export async function getRulesSearch(name: string): Promise<RuleProps[]> {
  try {
    const response: AxiosResponse<RuleProps[]> = await api.get("/api/rules", {
      params: { name },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
