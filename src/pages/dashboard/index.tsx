import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Container,
  Divider,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import Layout from "@components/Layout";
import { getProductList } from "@services/getProductList";
import { getLeaseList } from "@services/getLeaseList";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ProductProps } from "@interfaces/Product";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { LeaseProps } from "@interfaces/Lease";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartColors = {
  available: "#2ecc71",
  rented: "#e74c3c",
  revenue: "#3498db",
  background: "#34495e",
  divider: "#7f8c8d",
};

export default function OderanDashboard() {
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [leases, setLeases] = useState<LeaseProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, leasesData] = await Promise.all([
          getProductList(),
          getLeaseList(),
        ]);
        setProducts(productsData || []);
        setLeases(leasesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Falha ao carregar dados. Tente recarregar a página.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare filter options
  const { productOptions, monthOptions, clientOptions } = useMemo(() => {
    const productOptions = [
      { id: "all", name: "Todos os Produtos" },
      ...products.map((product) => ({
        id: product.id.toString(),
        name: `${product.name} (${product.marca})`,
      })),
    ];

    const months = new Set<string>();
    const clients = new Set<string>();

    leases.forEach((lease) => {
      if (lease.data_prevista_devolucao) {
        const date = new Date(lease.data_prevista_devolucao);
        months.add(`${date.getMonth() + 1}/${date.getFullYear()}`);
      }
      if (lease.cliente?.name) {
        clients.add(lease.cliente.name);
      }
    });

    return {
      productOptions,
      monthOptions: ["Todos os Meses", ...Array.from(months).sort()],
      clientOptions: ["Todos os Clientes", ...Array.from(clients).sort()],
    };
  }, [products, leases]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filteredProducts = [...products];
    let filteredLeases = [...leases];

    // Apply product filter
    if (selectedProduct !== "all") {
      filteredProducts = filteredProducts.filter(
        (p) => p.id.toString() === selectedProduct
      );
    }

    // Apply month and client filters
    if (selectedMonth !== "all" || selectedClient !== "all") {
      filteredLeases = filteredLeases.filter((lease) => {
        const monthMatch =
          selectedMonth === "all" ||
          (lease.data_prevista_devolucao &&
            `${
              new Date(lease.data_prevista_devolucao).getMonth() + 1
            }/${new Date(lease.data_prevista_devolucao).getFullYear()}` ===
              selectedMonth);

        const clientMatch =
          selectedClient === "all" || lease.cliente?.name === selectedClient;

        return monthMatch && clientMatch;
      });
    }

    return { filteredProducts, filteredLeases };
  }, [products, leases, selectedProduct, selectedMonth, selectedClient]);

  const calculateStockData = () => {
    const { filteredProducts } = filteredData;

    if (!filteredProducts || filteredProducts.length === 0) {
      return {
        labels: ["Nenhum produto encontrado"],
        datasets: [
          {
            label: "Disponível",
            data: [0],
            backgroundColor: chartColors.available,
          },
          { label: "Alugado", data: [0], backgroundColor: chartColors.rented },
        ],
      };
    }

    const productsWithStock = filteredProducts.filter(
      (product) => product.stock && product.stock.length > 0
    );

    // Se não houver produtos com stock, mostra mensagem
    if (productsWithStock.length === 0) {
      return {
        labels: ["Nenhum item em estoque"],
        datasets: [
          {
            label: "Disponível",
            data: [0],
            backgroundColor: chartColors.available,
          },
          { label: "Alugado", data: [0], backgroundColor: chartColors.rented },
        ],
      };
    }

    const available = productsWithStock.map((product) => {
      const stockItems = product.stock || [];
      return stockItems.filter((s) => s?.status === "Disponível").length;
    });

    const rented = productsWithStock.map((product) => {
      const stockItems = product.stock || [];
      return stockItems.filter((s) => s?.status === "Alugado").length;
    });

    const labels = productsWithStock.map((p) => `${p.name} (${p.marca})`);

    return {
      labels,
      datasets: [
        {
          label: "Disponível",
          data: available,
          backgroundColor: chartColors.available,
        },
        { label: "Alugado", data: rented, backgroundColor: chartColors.rented },
      ],
    };
  };

  const calculateRevenueData = () => {
    const { filteredLeases } = filteredData;

    if (!filteredLeases || filteredLeases.length === 0) {
      return {
        labels: ["Nenhum dado disponível"],
        datasets: [
          {
            label: "Receita (R$)",
            data: [0],
            backgroundColor: chartColors.revenue,
          },
        ],
      };
    }

    const monthlyRevenue: Record<string, number> = {};

    filteredLeases.forEach((lease) => {
      if (!lease || lease.status !== "Finalizado") return;

      try {
        const date = new Date(lease.data_prevista_devolucao);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        monthlyRevenue[monthYear] =
          (monthlyRevenue[monthYear] || 0) + Number(lease.valor_total || 0);
      } catch (error) {
        console.error("Erro ao processar data:", error);
      }
    });

    const sortedMonths = Object.keys(monthlyRevenue).sort((a, b) => {
      const [aMonth, aYear] = a.split("/").map(Number);
      const [bMonth, bYear] = b.split("/").map(Number);
      return aYear - bYear || aMonth - bMonth;
    });

    // Se não houver receita, mostra mensagem
    if (sortedMonths.length === 0) {
      return {
        labels: ["Nenhuma receita encontrada"],
        datasets: [
          {
            label: "Receita (R$)",
            data: [0],
            backgroundColor: chartColors.revenue,
          },
        ],
      };
    }

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Receita (R$)",
          data: sortedMonths.map((month) => monthlyRevenue[month]),
          backgroundColor: chartColors.revenue,
        },
      ],
    };
  };

  const stockData = useMemo(() => calculateStockData(), [filteredData]);
  const revenueData = useMemo(() => calculateRevenueData(), [filteredData]);

  const scrollChart = (direction: "left" | "right") => {
    if (chartRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      chartRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Cálculos totais baseados nos produtos filtrados
  const totalAvailable = filteredData.filteredProducts.reduce(
    (sum, product) =>
      sum +
      (product.stock || []).filter((s) => s?.status === "Disponível").length,
    0
  );

  const totalRented = filteredData.filteredProducts.reduce(
    (sum, product) =>
      sum + (product.stock || []).filter((s) => s?.status === "Alugado").length,
    0
  );

  const totalStock = totalAvailable + totalRented;
  const availablePercentage =
    totalStock > 0 ? Math.round((totalAvailable / totalStock) * 100) : 0;
  const rentedPercentage =
    totalStock > 0 ? Math.round((totalRented / totalStock) * 100) : 0;

  const monthlyRevenue = filteredData.filteredLeases
    .filter((lease) => lease?.status === "Finalizado")
    .reduce((sum, lease) => sum + Number(lease?.valor_total || 0), 0);

  const annualRevenue = monthlyRevenue * 12;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleProductChange = (event: SelectChangeEvent) => {
    setSelectedProduct(event.target.value);
  };

  const handleMonthChange = (event: SelectChangeEvent) => {
    setSelectedMonth(event.target.value);
  };

  const handleClientChange = (event: SelectChangeEvent) => {
    setSelectedClient(event.target.value);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#E0E0E0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={60} aria-label="Carregando dashboard" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#E0E0E0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          p: 3,
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: chartColors.revenue,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Recarregar Página
        </button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "#E0E0E0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Layout>
        <Container
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "calc(100vh - 64px)",
            maxWidth: "1200px",
            justifyContent: "flex-start",
            padding: 0,
            margin: 0,
            paddingTop: "64px",
            backgroundColor: "#E0E0E0",
          }}
        >
          {/* Filter Section */}
          <Grid container spacing={2} sx={{ padding: 2 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="product-filter-label">Produto</InputLabel>
                <Select
                  labelId="product-filter-label"
                  value={selectedProduct}
                  label="Produto"
                  onChange={handleProductChange}
                >
                  {productOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="month-filter-label">Mês</InputLabel>
                <Select
                  labelId="month-filter-label"
                  value={selectedMonth}
                  label="Mês"
                  onChange={handleMonthChange}
                >
                  {monthOptions.map((month, index) => (
                    <MenuItem
                      key={index}
                      value={month === "Todos os Meses" ? "all" : month}
                    >
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="client-filter-label">Cliente</InputLabel>
                <Select
                  labelId="client-filter-label"
                  value={selectedClient}
                  label="Cliente"
                  onChange={handleClientChange}
                >
                  {clientOptions.map((client, index) => (
                    <MenuItem
                      key={index}
                      value={client === "Todos os Clientes" ? "all" : client}
                    >
                      {client}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Dashboard Content */}
          <Grid container spacing={3} sx={{ marginTop: "10px" }}>
            {/* Stock Card */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  backgroundColor: chartColors.background,
                  color: "white",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Estoque {selectedProduct !== "all" ? "(Filtrado)" : ""}
                </Typography>
                <Divider sx={{ bgcolor: chartColors.divider, mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">Disponível</Typography>
                    <Box
                      sx={{
                        height: "10px",
                        bgcolor: chartColors.available,
                        borderRadius: "5px",
                        mt: 1,
                        mb: 2,
                      }}
                    />
                    <Typography variant="h5">{availablePercentage}%</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">Alugado</Typography>
                    <Box
                      sx={{
                        height: "10px",
                        bgcolor: chartColors.rented,
                        borderRadius: "5px",
                        mt: 1,
                        mb: 2,
                      }}
                    />
                    <Typography variant="h5">{rentedPercentage}%</Typography>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    position: "relative",
                    mt: 3,
                    height: "250px",
                    overflow: "hidden",
                  }}
                >
                  <IconButton
                    sx={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(52, 152, 219, 0.7)",
                      color: "white",
                      zIndex: 1,
                      "&:hover": {
                        backgroundColor: chartColors.revenue,
                      },
                    }}
                    onClick={() => scrollChart("left")}
                    aria-label="Rolar gráfico para esquerda"
                  >
                    <ArrowLeftIcon />
                  </IconButton>

                  <Box
                    ref={chartRef}
                    sx={{
                      width: "100%",
                      height: "100%",
                      overflowX: "auto",
                      "&::-webkit-scrollbar": {
                        height: "8px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: chartColors.revenue,
                        borderRadius: "10px",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: `${Math.max(
                          filteredData.filteredProducts.length * 50,
                          500
                        )}px`,
                        height: "100%",
                      }}
                    >
                      <Bar
                        data={stockData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                              labels: {
                                color: "white",
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: "white",
                              },
                            },
                            y: {
                              grid: {
                                color: "rgba(255,255,255,0.1)",
                              },
                              ticks: {
                                color: "white",
                              },
                              beginAtZero: true, // Adicione aqui
                            },
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <IconButton
                    sx={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(52, 152, 219, 0.7)",
                      color: "white",
                      zIndex: 1,
                      "&:hover": {
                        backgroundColor: chartColors.revenue,
                      },
                    }}
                    onClick={() => scrollChart("right")}
                    aria-label="Rolar gráfico para direita"
                  >
                    <ArrowRightIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>

            {/* Revenue Card */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  backgroundColor: chartColors.background,
                  color: "white",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Receita{" "}
                  {selectedMonth !== "all" || selectedClient !== "all"
                    ? "(Filtrado)"
                    : ""}
                </Typography>
                <Divider sx={{ bgcolor: chartColors.divider, mb: 2 }} />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body1">Mês</Typography>
                    <Typography variant="h5">
                      {formatCurrency(monthlyRevenue)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">Ano</Typography>
                    <Typography variant="h5">
                      {formatCurrency(annualRevenue)}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ height: "250px" }}>
                  <Bar
                    data={revenueData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) =>
                              `${formatCurrency(context.raw as number)}`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: "white",
                          },
                        },
                        y: {
                          grid: {
                            color: "rgba(255,255,255,0.1)",
                          },
                          ticks: {
                            color: "white",
                            callback: (value) => formatCurrency(Number(value)),
                          },
                          beginAtZero: true, // Adicione aqui
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Layout>
    </Box>
  );
}
