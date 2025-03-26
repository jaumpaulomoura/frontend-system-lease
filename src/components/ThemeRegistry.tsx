"use client";

import * as React from "react";
// import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
// import createEmotionCache from "@utils/resolver";

// const clientSideEmotionCache = createEmotionCache();
const theme = createTheme();

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <CacheProvider value={clientSideEmotionCache}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
    // </CacheProvider>
  );
}
