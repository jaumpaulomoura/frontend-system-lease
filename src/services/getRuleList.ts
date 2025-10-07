import { RuleProps } from "@interfaces/Rule";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

export async function getRuleList(): Promise<RuleProps[]> {
  try {
    const response: AxiosResponse<RuleProps[]> = await api.get("/api/rules");

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
