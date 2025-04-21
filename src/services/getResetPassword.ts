import axios from "axios";
import api from "./api-routes";

interface ResetParams {
  token: string; // Deve receber o token JWT, não o email
  password: string; // Mantém o nome que o backend espera
}

export async function getResetPassword(params: ResetParams): Promise<void> {
  try {
    // Chama diretamente o endpoint do backend NestJS
    await api.post("api/auth/resetPass", {
      // Remove /api se já está na baseURL
      token: params.token,
      password: params.password, // Mantém consistente com o backend
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Falha ao redefinir senha"
      );
    }
    throw new Error("Erro inesperado ao redefinir senha");
  }
}
