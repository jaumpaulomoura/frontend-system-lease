/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useContext,
  useCallback,
} from "react";
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
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar,
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
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { InitialContext } from "@contexts/InitialContext";
import FinancialReportModal, {
  ReportFilters,
} from "@components/FinancialReportModal";
import { generateFinancialReport } from "@components/FinancialPdfReport";
import AssessmentIcon from "@mui/icons-material/Assessment";

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
  openRevenue: "#f39c12", // Nova cor para receita em aberto
  background: "#34495e",
  divider: "#7f8c8d",
};

interface UpcomingReturn {
  id_locacao: number;
  clienteName: string;
  clienteTelefone: string;
  data_pagamento: string;
  status: string;
}

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
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { showLoginSuccess, setShowLoginSuccess } = useContext(InitialContext);
  const [upcomingLeases, setUpcomingLeases] = useState<UpcomingReturn[]>([]);
  const { signOut } = useContext(InitialContext);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  console.log("upcomingLeases", upcomingLeases);

  const leaseColumns: GridColDef[] = [
    { field: "id_locacao", headerName: "ID Locação", width: 120 },
    { field: "clienteName", headerName: "Cliente", width: 180 },
    { field: "clienteTelefone", headerName: "Telefone", width: 150 },
    {
      field: "data_pagamento",
      headerName: "Previsão de Devolução",
      width: 180,

      flex: 1,
      renderCell: (params) => {
        const value = params.value;
        if (!value) return "-";

        const localDate = new Date(value);
        localDate.setHours(localDate.getHours() + 3); // ajusta UTC -> GMT-3 (Brasil)

        return localDate.toLocaleDateString("pt-BR");
      },
    },
    { field: "status", headerName: "Status", width: 120 },
  ];

  useEffect(() => {
    if (showLoginSuccess) {
      setShowWelcomeAlert(true);
      setShowWelcomeModal(true);
      setShowLoginSuccess(false);

      const alertTimer = setTimeout(() => setShowWelcomeAlert(false), 6000);
      const modalTimer = setTimeout(() => setShowWelcomeModal(false), 8000);

      return () => {
        clearTimeout(alertTimer);
        clearTimeout(modalTimer);
      };
    }
  }, [showLoginSuccess, setShowLoginSuccess]);
  const fetchAndProcessLeases = useCallback(async () => {
    try {
      const allLeases = await getLeaseList();
      setLeases(allLeases);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const upcoming = allLeases
        .filter((lease) => {
          const dueDate = new Date(lease.data_pagamento);
          dueDate.setHours(0, 0, 0, 0); // zera horário para comparar apenas a data

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          return (
            lease.status === "Ativo" && dueDate <= tomorrow // inclui atrasadas, hoje e amanhã
          );
        })
        .map((lease) => ({
          id_locacao: lease.id_locacao,
          clienteName: lease.cliente?.name || "",
          clienteTelefone: lease.cliente?.telefone || "",
          data_pagamento: lease.data_pagamento,
          status: lease.status,
        }));

      setUpcomingLeases(upcoming);
    } catch (error) {
      console.error("Erro ao buscar locações:", error);
    }
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, leasesData] = await Promise.all([
          getProductList(),
          getLeaseList(),
        ]);
        setProducts(productsData || []);
        setLeases(leasesData || []);
        await fetchAndProcessLeases();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Falha ao carregar dados. Tente recarregar a página.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchAndProcessLeases]);

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
      const relevantDate =
        lease.data_pagamento || lease.data_prevista_devolucao;
      if (relevantDate) {
        const date = new Date(relevantDate);
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

    // Primeiro, exclui cancelados de todas as locações
    filteredLeases = filteredLeases.filter(
      (lease) => lease.status !== "Cancelado"
    );

    // Apply product filter
    if (selectedProduct !== "all") {
      filteredProducts = filteredProducts.filter(
        (p) => p.id.toString() === selectedProduct
      );
    }

    // Apply month and client filters
    if (selectedMonth !== "all" || selectedClient !== "all") {
      filteredLeases = filteredLeases.filter((lease) => {
        // Verifica tanto data_pagamento quanto data_prevista_devolucao
        const relevantDate =
          lease.data_pagamento || lease.data_prevista_devolucao;

        const monthMatch =
          selectedMonth === "all" ||
          (relevantDate &&
            `${new Date(relevantDate).getMonth() + 1}/${new Date(
              relevantDate
            ).getFullYear()}` === selectedMonth);

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
            label: "Receita Paga (R$)",
            data: [0],
            backgroundColor: chartColors.revenue,
          },
          {
            label: "Receita em Aberto (R$)",
            data: [0],
            backgroundColor: chartColors.openRevenue,
          },
        ],
      };
    }

    const monthlyPaidRevenue: Record<string, number> = {};
    const monthlyOpenRevenue: Record<string, number> = {};

    filteredLeases.forEach((lease) => {
      if (!lease) return;

      const valorTotal = Number(lease.valor_total || 0);

      // Receita paga (com data_pagamento)
      if (lease.data_pagamento) {
        try {
          const date = new Date(lease.data_pagamento);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          monthlyPaidRevenue[monthYear] =
            (monthlyPaidRevenue[monthYear] || 0) + valorTotal;
        } catch (error) {
          console.error("Erro ao processar data de pagamento:", error);
        }
      } else if (lease.data_prevista_devolucao) {
        try {
          const date = new Date(lease.data_prevista_devolucao);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          monthlyOpenRevenue[monthYear] =
            (monthlyOpenRevenue[monthYear] || 0) + valorTotal;
        } catch (error) {
          console.error("Erro ao processar data prevista:", error);
        }
      }
    });

    // Combina todos os meses únicos
    const allMonths = [
      ...new Set([
        ...Object.keys(monthlyPaidRevenue),
        ...Object.keys(monthlyOpenRevenue),
      ]),
    ].sort((a, b) => {
      const [aMonth, aYear] = a.split("/").map(Number);
      const [bMonth, bYear] = b.split("/").map(Number);
      return aYear - bYear || aMonth - bMonth;
    });

    if (allMonths.length === 0) {
      return {
        labels: ["Nenhuma receita encontrada"],
        datasets: [
          {
            label: "Receita Paga (R$)",
            data: [0],
            backgroundColor: chartColors.revenue,
          },
          {
            label: "Receita em Aberto (R$)",
            data: [0],
            backgroundColor: chartColors.openRevenue,
          },
        ],
      };
    }

    return {
      labels: allMonths,
      datasets: [
        {
          label: "Receita Paga (R$)",
          data: allMonths.map((month) => monthlyPaidRevenue[month] || 0),
          backgroundColor: chartColors.revenue,
        },
        {
          label: "Receita em Aberto (R$)",
          data: allMonths.map((month) => monthlyOpenRevenue[month] || 0),
          backgroundColor: chartColors.openRevenue,
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

  // const monthlyRevenue = filteredData.filteredLeases
  //   // .filter((lease) => lease?.status === "Finalizado")
  //   .reduce((sum, lease) => sum + Number(lease?.valor_total || 0), 0);

  // // const annualRevenue = monthlyRevenue * 12;

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

  const handleGenerateReport = async (filters: ReportFilters) => {
    setReportLoading(true);
    try {
      // Filtrar locações baseado nos filtros do relatório (excluindo cancelados)
      const filteredLeases = leases.filter((lease) => {
        // Exclui cancelados primeiro
        if (lease.status === "Cancelado") return false;

        // Filtro por data
        const relevantDate =
          lease.data_pagamento || lease.data_prevista_devolucao;
        if (!relevantDate) return false;

        const leaseDate = new Date(relevantDate);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);

        const dateInRange = leaseDate >= startDate && leaseDate <= endDate;

        // Filtro por cliente
        const clientMatch =
          !filters.clientId ||
          lease.cliente?.id?.toString() === filters.clientId;

        // Filtro por status de pagamento
        const paymentMatch =
          filters.paymentStatus === "all" ||
          (filters.paymentStatus === "paid" && lease.data_pagamento) ||
          (filters.paymentStatus === "unpaid" && !lease.data_pagamento);

        return dateInRange && clientMatch && paymentMatch;
      });

      await generateFinancialReport(filteredLeases, filters);

      setSnackbar({
        open: true,
        message: "Relatório PDF gerado com sucesso!",
        severity: "success" as "success" | "error" | "info" | "warning",
      });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setSnackbar({
        open: true,
        message: "Erro ao gerar relatório PDF",
        severity: "error" as "success" | "error" | "info" | "warning",
      });
    } finally {
      setReportLoading(false);
    }
  };

  // Estado do snackbar para mensagens
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

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
          onClick={() => {
            signOut(); // Só logout, não mexe em login/success
            window.location.reload();
          }}
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const upcomingDueLeases = leases
    .filter((lease) => {
      // Usa data_pagamento se existir, senão data_locacao
      const dueDate = new Date(
        lease.data_pagamento || lease.data_prevista_devolucao
      );
      if (isNaN(dueDate.getTime())) return false; // Data inválida

      dueDate.setHours(0, 0, 0, 0);
      return (
        lease.status === "Ativo" &&
        (dueDate.getTime() === today.getTime() ||
          dueDate.getTime() === tomorrow.getTime())
      );
    })
    .map((lease) => ({
      id_locacao: lease.id_locacao,
      clienteName: lease.cliente?.name || "",
      clienteTelefone: lease.cliente?.telefone || "",
      data_pagamento: lease.data_pagamento,
      status: lease.status,
    }));
  const overdueLeases = leases
    .filter((lease) => {
      const dueDate = new Date(lease.data_pagamento);
      dueDate.setHours(0, 0, 0, 0);
      return lease.status === "Ativo" && dueDate.getTime() < today.getTime();
    })
    .map((lease) => ({
      id_locacao: lease.id_locacao,
      clienteName: lease.cliente?.name || "",
      clienteTelefone: lease.cliente?.telefone || "",
      data_pagamento: lease.data_pagamento,
      status: lease.status,
    }));
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
          <Grid container spacing={1} sx={{ padding: 1 }}>
            {" "}
            {/* Financial Report Button */}
            <Grid container spacing={1} sx={{ padding: 1, mb: 0 }}>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AssessmentIcon />}
                    onClick={() => setShowReportModal(true)}
                    disabled={reportLoading}
                    // sx={{
                    //   backgroundColor: "#2196f3",
                    //   "&:hover": { backgroundColor: "#1976d2" },
                    // }}
                  >
                    {reportLoading ? "Gerando..." : "Relatório Financeiro"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
            {/* Reduzi o spacing e padding */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                {" "}
                {/* Adicionei size="small" */}
                <InputLabel id="product-filter-label">Produto</InputLabel>
                <Select
                  labelId="product-filter-label"
                  value={selectedProduct}
                  label="Produto"
                  onChange={handleProductChange}
                  sx={{ fontSize: "0.875rem" }} // Reduzi o tamanho da fonte
                >
                  {productOptions.map((option) => (
                    <MenuItem
                      key={option.id}
                      value={option.id}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="month-filter-label">Mês</InputLabel>
                <Select
                  labelId="month-filter-label"
                  value={selectedMonth}
                  label="Mês"
                  onChange={handleMonthChange}
                  sx={{ fontSize: "0.875rem" }}
                >
                  {monthOptions.map((month, index) => (
                    <MenuItem
                      key={index}
                      value={month === "Todos os Meses" ? "all" : month}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="client-filter-label">Cliente</InputLabel>
                <Select
                  labelId="client-filter-label"
                  value={selectedClient}
                  label="Cliente"
                  onChange={handleClientChange}
                  sx={{ fontSize: "0.875rem" }}
                >
                  {clientOptions.map((client, index) => (
                    <MenuItem
                      key={index}
                      value={client === "Todos os Clientes" ? "all" : client}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {client}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Dashboard Content */}
          <Grid container spacing={3}>
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
                    <Typography variant="body1">Receita Paga</Typography>
                    <Typography variant="h5">
                      {formatCurrency(
                        filteredData.filteredLeases
                          .filter((lease) => lease.data_pagamento)
                          .reduce(
                            (sum, lease) =>
                              sum + Number(lease.valor_total || 0),
                            0
                          )
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">Receita em Aberto</Typography>
                    <Typography variant="h5">
                      {formatCurrency(
                        filteredData.filteredLeases
                          .filter(
                            (lease) =>
                              !lease.data_pagamento &&
                              lease.data_prevista_devolucao
                          )
                          .reduce(
                            (sum, lease) =>
                              sum + Number(lease.valor_total || 0),
                            0
                          )
                      )}
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
                          position: "top",
                          labels: {
                            color: "white",
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) =>
                              `${context.dataset.label}: ${formatCurrency(
                                context.raw as number
                              )}`,
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
                          beginAtZero: true,
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

      {/* Financial Report Modal */}
      <FinancialReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerateReport={handleGenerateReport}
      />
      <Dialog
        open={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>👋 Bem-vindo ao Sistema - Atenção às Locações</DialogTitle>

        <DialogContent>
          {overdueLeases.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              ⚠️ Você tem {overdueLeases.length} locação(ões){" "}
              <strong>atrasada(s)</strong>!
            </Alert>
          )}

          {upcomingDueLeases.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              🕒 Você tem {upcomingDueLeases.length} locação(ões) com devolução{" "}
              <strong>hoje ou amanhã</strong>!
            </Alert>
          )}

          {overdueLeases.length > 0 || upcomingDueLeases.length > 0 ? (
            <>
              <Box sx={{ height: 260, width: "100%", mt: 2 }}>
                <DataGrid
                  rows={[...overdueLeases, ...upcomingDueLeases]}
                  columns={leaseColumns}
                  getRowId={(row) => row.id_locacao}
                  density="compact"
                  sx={{
                    "& .row-today": { backgroundColor: "#fff8e1" }, // amarelado
                    "& .row-overdue": { backgroundColor: "#ffebee" }, // avermelhado
                  }}
                  getRowClassName={(params) => {
                    const dueDate = new Date(params.row?.data_pagamento);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    dueDate.setHours(0, 0, 0, 0);

                    if (dueDate.getTime() === today.getTime())
                      return "row-today";
                    if (dueDate.getTime() < today.getTime())
                      return "row-overdue";
                    return "";
                  }}
                />
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhuma locação com devolução iminente. Bom trabalho!
            </Typography>
          )}

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={() => setShowWelcomeModal(false)}
            >
              Entendi
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={showWelcomeAlert}
        autoHideDuration={6000}
        onClose={() => setShowWelcomeAlert(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setShowWelcomeAlert(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Login realizado com sucesso! Bem-vindo ao Dashboard!
        </Alert>
      </Snackbar>

      {/* Report Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
