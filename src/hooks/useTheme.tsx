import { useState, useCallback } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export type ThemeType = "DEFAULT" | "LIGHT" | null;

export function useTheme() {
  const [themeName, setThemeName] = useState<ThemeType>("DEFAULT");

  const onThemeChange = useCallback((newTheme: string) => {
    setThemeName(newTheme as ThemeType);
  }, []);

  // Definir o tema com base no `themeName`
  const theme = createTheme({
    palette: {
      mode: themeName === "LIGHT" ? "light" : "dark",
    },
  });

  return {
    themeName,
    setThemeName,
    onThemeChange,
    ThemeWrapper: ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    ),
  };
}
