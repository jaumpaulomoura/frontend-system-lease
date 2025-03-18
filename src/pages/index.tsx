import { useContext, useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { InitialContext } from "@contexts/InitialContext";

export default function LoginPage() {
  const { signIn } = useContext(InitialContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          type="password"
          variant="outlined"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          onClick={() => signIn(email, password)}
        >
          Acessar
        </Button>
        <Typography variant="body2" fontWeight={400} textAlign="center" mt={2}>
          Versão: 0.0.1
        </Typography>
      </Container>
    </Box>
  );
}
