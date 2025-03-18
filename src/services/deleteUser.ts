import axios, { AxiosResponse } from "axios";
import api from "./api-routes";
import { UserProps } from "@interfaces/User";

export async function deleteUser(id: string): Promise<UserProps> {
  try {
    const response: AxiosResponse<UserProps> = await api.delete(
      `/api/users/delete/${id}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data.message || "Erro ao excluir usuário"
      );
    }

    throw new Error(`Unexpected error occurred: ${error}`);
  }
}
