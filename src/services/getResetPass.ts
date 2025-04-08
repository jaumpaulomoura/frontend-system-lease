import axios from "axios";
import api from "./api-routes";

interface ResetParams {
  email: string;
  password: string; // Mantém o nome original
}

export async function getResetPass(params: ResetParams): Promise<void> {
  try {
    // Chama diretamente a API route sem adicionar token
    await api.post("/api/auth/reset", {
      email: params.email,
      newPassword: params.password, // Transforma para newPassword aqui
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Falha ao redefinir senha"
      );
    }
    throw new Error("Erro inesperado");
  }
}
