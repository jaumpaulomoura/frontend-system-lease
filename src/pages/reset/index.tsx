/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { getResetPassword } from "@services/getResetPassword";

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = router.query.token as string;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token inválido");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await getResetPassword({ token, password: newPassword });
      setSuccess("Senha redefinida com sucesso!");
      setTimeout(() => {
        router.push("/"); // ou /login, onde você quiser levar o usuário
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Redefinir Senha
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Nova Senha"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <TextField
          label="Confirme a Nova Senha"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Redefinir Senha"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
