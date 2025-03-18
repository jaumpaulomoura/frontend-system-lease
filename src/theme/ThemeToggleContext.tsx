import React, { createContext, useContext, useState, ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Definir tipos para o contexto
interface ThemeToggleContextType {
  toggleTheme: () => void;
}

const ThemeToggleContext = createContext<ThemeToggleContextType | undefined>(
  undefined
);

// Temas definidos (dark e light)
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000", // Amarelo vibrante como cor principal
      contrastText: "#FFEB3B", // Texto escuro para contraste no fundo claro
    },
    secondary: {
      main: "#000000", // Preto como cor secundária, para fundo ou texto
      contrastText: "#FFEB3B", // Amarelo para contrastar com o preto
    },
    background: {
      default: "#939393", // Fundo branco para o tema claro
      paper: "#f4f4f4", // Papel com cor clara
    },
    text: {
      primary: "#000", // Texto preto para contraste no fundo claro
      secondary: "#333", // Texto secundário para legibilidade
    },
    success: {
      main: "#4CAF50", // Verde para ações de confirmação
      contrastText: "#fff", // Texto branco para melhor contraste
    },
    error: {
      main: "#F44336", // Vermelho para ações de cancelamento
      contrastText: "#fff",
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#fcec71", // Amarelo vibrante como cor principal
      contrastText: "#000", // Texto preto para contraste no fundo escuro
    },
    secondary: {
      main: "#000000", // Preto como cor principal para fundo escuro
      contrastText: "#FFEB3B", // Amarelo para contraste com o fundo escuro
    },
    background: {
      default: "#000000", // Fundo preto para o tema escuro
      paper: "#121212", // Papel escuro
    },
    text: {
      primary: "#fff", // Texto branco para contraste no fundo escuro
      secondary: "#b0b0b0", // Texto secundário mais suave para uma boa leitura
    },
    success: {
      main: "#4CAF50", // Verde para ações de confirmação
      contrastText: "#fff", // Texto branco para melhor contraste
    },
    error: {
      main: "#F44336", // Vermelho para ações de cancelamento
      contrastText: "#fff",
    },
  },
});

export const ThemeToggleProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = themeMode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeToggleContext.Provider value={{ toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeToggleContext.Provider>
  );
};

// Hook para acessar o contexto
export const useThemeToggle = () => {
  const context = useContext(ThemeToggleContext);
  if (!context) {
    throw new Error("useThemeToggle must be used within a ThemeToggleProvider");
  }
  return context;
};
