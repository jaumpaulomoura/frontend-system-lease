import { useContext, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { InitialContext } from "@contexts/InitialContext";
import ForgotPasswordPage from "../components/ForgotPasswordPage";

export default function LoginPage() {
  const { signIn, loading } = useContext(InitialContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const handleLogin = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();

    try {
      await signIn(email, password);
    } catch (error: unknown) {
      let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";

      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e0e0e0",
      }}
    >
      <Container
        component="form"
        maxWidth="xs"
        onSubmit={handleLogin}
        sx={{
          padding: 3,
          boxShadow: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#e0e0e0",
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          sx={{ maxWidth: 250, marginBottom: 2 }}
        />
        <Typography variant="h6" fontWeight={400} textAlign="center">
          Acesso ao sistema
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="E-mail"
          variant="outlined"
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Senha"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          type="submit"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Acessar"}
        </Button>
        <Button
          fullWidth
          variant="text"
          sx={{ marginTop: 1 }}
          onClick={() => setForgotPasswordOpen(true)}
        >
          Esqueceu sua senha?
        </Button>

        <Typography variant="body2" fontWeight={400} textAlign="center" mt={2}>
          Versão: 0.0.1
        </Typography>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        sx={{
          marginLeft: "240px",
          "@media (max-width: 600px)": {
            marginLeft: "0px",
            bottom: "70px",
          },
        }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            width: "100%",
            boxShadow: 3,
            alignItems: "center",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Adicione o Dialog no final */}
      <ForgotPasswordPage
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </Box>
  );
}
