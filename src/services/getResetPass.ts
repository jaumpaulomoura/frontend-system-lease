import axios from "axios";
import api from "./api-routes";

interface ResetParams {
  email: string;
  password: string; // Mantém o nome original
}

export async function getResetPass(params: ResetParams): Promise<void> {
  try {
    // Chama o endpoint de alterar senha (usuário logado)
    await api.post("/api/auth/change-password", {
      newPassword: params.password,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Falha ao alterar senha"
      );
    }
    throw new Error("Erro inesperado");
  }
}
