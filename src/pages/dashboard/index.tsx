import React from "react";

// { useEffect, useState}
// import { Bar } from 'react-chartjs-2'
import { Box } from "@mui/material";

import Layout from "@components/Layout";
import { ThemeToggleProvider } from "@theme/ThemeToggleContext";

export default function DashboardPage() {
  return (
    <ThemeToggleProvider>
      <Layout>
        <Box></Box>
      </Layout>
    </ThemeToggleProvider>
  );
}
