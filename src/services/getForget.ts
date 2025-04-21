import axios from "axios";

interface ForgetParams {
  email: string;
}

export async function getForget(params: ForgetParams): Promise<void> {
  try {
    await axios.post("/api/auth/forget", { email: params.email });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Falha ao redefinir senha"
      );
    }
    throw new Error("Erro inesperado");
  }
}
