import { LeaseProps } from "@interfaces/Lease";
import axios, { AxiosResponse } from "axios";

import api from "./api-routes";

export async function deleteLease(id: string): Promise<LeaseProps> {
  try {
    const response: AxiosResponse<LeaseProps> = await api.delete(
      `/api/leases/delete/${id}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }

    throw new Error(`Unexpected error ocurred ${error}`);
  }
}
