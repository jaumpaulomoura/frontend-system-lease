// pages/_app.tsx
import { AppProps } from "next/app";
import { InitialProvider } from "@contexts/InitialContext";
import { ThemeToggleProvider } from "@theme/ThemeToggleContext";
import { GlobalStyles } from "@mui/material";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Estilos globais */}
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: "#f7efef", // Cor de fundo global
            margin: 0,
            padding: 0,
          },
          "*": {
            boxSizing: "border-box", // Para garantir que o padding/margem não afete o layout
          },
        }}
      />
      <InitialProvider>
        <ThemeToggleProvider>
          <Component {...pageProps} />
        </ThemeToggleProvider>
      </InitialProvider>
    </>
  );
}
