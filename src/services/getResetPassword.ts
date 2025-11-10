import axios from "axios";
import api from "./api-routes";

interface ResetParams {
  token: string; // Deve receber o token JWT, não o email
  password: string; // Mantém o nome que o backend espera
}

export async function getResetPassword(params: ResetParams): Promise<void> {
  try {
    console.log('🔍 [Frontend] Enviando requisição de reset...');
    console.log('🔍 [Frontend] Token:', params.token?.substring(0, 50) + '...');

    // Chama o endpoint do Next.js que faz proxy para o backend
    await api.post("/api/auth/resetPass", {
      token: params.token,
      password: params.password,
    });

    console.log('✅ [Frontend] Reset realizado com sucesso');
  } catch (error) {
    console.error('❌ [Frontend] Erro no reset:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || error.response?.data?.message || "Falha ao redefinir senha"
      );
    }
    throw new Error("Erro inesperado ao redefinir senha");
  }
}
