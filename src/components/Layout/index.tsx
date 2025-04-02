// "use client";

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
import { useTheme } from "@mui/material/styles";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { usePathname } from "next/navigation"; // CORREÇÃO: Agora usa usePathname

export default function Layout({ children }: { children: React.ReactNode }) {
  const { toggleTheme } = useThemeToggle();
  const { signOut, userAuth } = useContext(InitialContext);
  const [user, setUser] = useState<UserProps | null>(null);
  const theme = useTheme();
  const pathname = usePathname();
  console.log("Rota atual:", pathname);

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
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
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
              display: "block",
              margin: "0 auto",
            }}
          />

          <ListItem>
            <ListItemButton
              component={Link}
              href="/dashboard"
              sx={{
                backgroundColor:
                  pathname === "/dashboard" ? "#fce853" : "transparent",
                color:
                  pathname === "/dashboard"
                    ? "#000000"
                    : theme.palette.primary.contrastText,
                "&:hover": { backgroundColor: theme.palette.secondary.light },
              }}
            >
              <Typography variant="body1">Dashboard</Typography>
            </ListItemButton>
          </ListItem>

          {userAuth?.role === 2 && (
            <ListItem>
              <ListItemButton
                component={Link}
                href="/dashboard/users"
                sx={{
                  backgroundColor: pathname.startsWith("/dashboard/users")
                    ? "#fce853"
                    : "transparent",
                  color: pathname.startsWith("/dashboard/users")
                    ? "#000000"
                    : "#transparent", // Branco e preto para teste
                  "&:hover": { backgroundColor: theme.palette.secondary.light },
                }}
              >
                <Typography variant="body1">Usuários</Typography>
              </ListItemButton>
            </ListItem>
          )}

          <ListItem>
            <ListItemButton
              component={Link}
              href="/dashboard/clients"
              sx={{
                backgroundColor: pathname.startsWith("/dashboard/clients")
                  ? "#fce853"
                  : "transparent",
                color: pathname.startsWith("/dashboard/clients")
                  ? "#000000"
                  : "#transparent", // Branco e preto para teste
                "&:hover": { backgroundColor: theme.palette.secondary.light },
              }}
            >
              <Typography variant="body1">Clientes</Typography>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton
              component={Link}
              href="/dashboard/products"
              sx={{
                backgroundColor: pathname.startsWith("/dashboard/products")
                  ? "#fce853"
                  : "transparent",
                color: pathname.startsWith("/dashboard/products")
                  ? "#000000"
                  : "#transparent", // Branco e preto para teste
                "&:hover": { backgroundColor: theme.palette.secondary.light },
              }}
            >
              <Typography variant="body1">Produtos</Typography>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton
              component={Link}
              href="/dashboard/lease"
              sx={{
                backgroundColor: pathname.startsWith("/dashboard/lease")
                  ? "#fce853"
                  : "transparent",
                color: pathname.startsWith("/dashboard/lease")
                  ? "#000000"
                  : "#transparent", // Branco e preto para teste
                "&:hover": { backgroundColor: theme.palette.secondary.light },
              }}
            >
              <Typography variant="body1">Locação</Typography>
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
            backgroundColor: theme.palette.primary.main,
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
                    minWidth: "40px",
                    height: "40px",
                    marginRight: 0,
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    "&:hover": { backgroundColor: theme.palette.primary.dark },
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
            backgroundColor: "#E0E0E0",
          }}
        >
          {children}
        </div>
      </Box>
    </Box>
  );
}
