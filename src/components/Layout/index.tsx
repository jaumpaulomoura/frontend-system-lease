"use client";

import { useContext, useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import {
  Avatar,
  Box,
  Button,
  Toolbar,
  AppBar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Divider,
} from "@mui/material";
import { UserProps } from "@interfaces/User";
import { getMeData } from "@services/getMeData";
import Link from "next/link";
import { InitialContext } from "@contexts/InitialContext";
import { useThemeToggle } from "@theme/ThemeToggleContext";
import { useTheme } from "@mui/material/styles"; // Para acessar o tema atual
import { Brightness4, Brightness7 } from "@mui/icons-material";
export default function Layout({ children }: { children: React.ReactNode }) {
  const { toggleTheme } = useThemeToggle();
  const { signOut, userAuth } = useContext(InitialContext);
  const [user, setUser] = useState<UserProps | null>(null);
  const theme = useTheme(); // Acesso ao tema atual

  const getData = async () => {
    try {
      const users = await getMeData();
      setUser(users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="row"
      height="100vh"
      sx={{ backgroundColor: "#e0e0e0" }}
    >
      {/* Menu Lateral (Drawer) */}
      <Drawer
        sx={{
          width: 220,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 220,
            boxSizing: "border-box",
            backgroundColor: theme.palette.primary.main, // Cor de fundo do tema
            color: theme.palette.primary.contrastText, // Cor de texto do tema
          },
        }}
        variant="permanent"
        anchor="left"
        open
      >
        <Divider />
        <List>
          <Box
            component="img"
            src="/logo.png"
            sx={{
              maxWidth: 250,
              marginBottom: 2,
              display: "block", // Evita espaços extras em inline elements
              margin: "0 auto", // Centraliza horizontalmente se necessário
            }}
          />

          <ListItem>
            <ListItemButton component={Link} href="/dashboard">
              <Typography
                variant="body1"
                sx={{ color: theme.palette.primary.contrastText }}
              >
                Dashboard
              </Typography>
            </ListItemButton>
          </ListItem>

          {userAuth?.role === 2 && (
            <ListItem>
              <ListItemButton component={Link} href="/dashboard/users">
                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.primary.contrastText }}
                >
                  Usuários
                </Typography>
              </ListItemButton>
            </ListItem>
          )}

          <ListItem>
            <ListItemButton component={Link} href="/dashboard/clients">
              <Typography
                variant="body1"
                sx={{ color: theme.palette.primary.contrastText }}
              >
                Clientes
              </Typography>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton component={Link} href="/dashboard/products">
              <Typography
                variant="body1"
                sx={{ color: theme.palette.primary.contrastText }}
              >
                Produtos
              </Typography>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton component={Link} href="/dashboard/pedEnts">
              <Typography
                variant="body1"
                sx={{ color: theme.palette.primary.contrastText }}
              >
                Locação
              </Typography>
            </ListItemButton>
          </ListItem>
        </List>

        <Box sx={{ display: "flex", marginTop: "auto", padding: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={signOut}
            startIcon={<FiLogOut />}
          >
            Sair
          </Button>
        </Box>
      </Drawer>

      {/* Conteúdo Principal */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100%",
        }}
      >
        <AppBar
          sx={{
            width: "100%",
            backgroundColor: theme.palette.primary.main, // Cor de fundo do tema
            color: theme.palette.primary.contrastText,
            padding: 0,
            margin: 0,
          }}
        >
          <Toolbar>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "auto",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    marginRight: 1,
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  {user ? user.name : "Carregando..."}
                </Typography>
                <Avatar
                  src="https://bit.ly/tioluwani-kolawole"
                  alt={user ? user.name : ""}
                  sx={{ width: 46, height: 46, marginRight: 1 }}
                />
                <Button
                  onClick={toggleTheme}
                  sx={{
                    minWidth: "40px", // Garante um tamanho mínimo para o botão
                    height: "40px", // Mantém um tamanho adequado
                    marginRight: 0,
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.main,
                    display: "flex", // Centraliza o ícone
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%", // Deixa o botão arredondado
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {theme.palette.mode === "dark" ? (
                    <Brightness7 />
                  ) : (
                    <Brightness4 />
                  )}
                </Button>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Conteúdo da Página */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "95vh",
            backgroundColor: "##E0E0E0", // Cor de fundo que você deseja
          }}
        >
          {children}
        </div>
      </Box>
    </Box>
  );
}
