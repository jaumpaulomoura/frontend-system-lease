import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light", // Define o tema claro
    background: {
      default: "##e0e0e0",
    },
    primary: {
      light: "#757ce8",
      main: "#3f50b5",
      dark: "#002884",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark", // Define o tema escuro
    primary: {
      main: "#ff5252",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});
