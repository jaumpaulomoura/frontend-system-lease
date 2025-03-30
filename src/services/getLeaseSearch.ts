import { LeaseProps } from "@interfaces/Lease";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

export async function getLeasesSearch(name: string): Promise<LeaseProps[]> {
  try {
    const response: AxiosResponse<LeaseProps[]> = await api.get("/api/leases", {
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
