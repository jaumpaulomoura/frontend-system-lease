import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
  Grid,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipModel,
  TooltipItem,
} from "chart.js";
import Layout from "@components/Layout";
import { getStocksList } from "@services/getStocksList";
import { getProductList } from "@services/getProductList";
import { getLeaseList } from "@services/getLeaseList";
import { StockProps } from "@interfaces/Stock";
import { LeaseProps } from "@interfaces/Lease";
import { InitialContext } from "@contexts/InitialContext";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Product {
  id: number;
  name: string;
  marca: string;
}

interface StockChartData {
  products: string[];
  available: number[];
  rented: number[];
  productIds: number[];
}
interface UpcomingReturn {
  id_locacao: number;
  clienteName: string;
  clienteTelefone: string;
  data_prevista_devolucao: string;
  status: string;
}

export default function CombinedChartsPage() {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [stockChartData, setStockChartData] = useState<StockChartData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [leases, setLeases] = useState<LeaseProps[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | "all">("all");
  const [filteredStockData, setFilteredStockData] = useState<Omit<
    StockChartData,
    "productIds"
  > | null>(null);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { showLoginSuccess, setShowLoginSuccess } = useContext(InitialContext);
  const [upcomingLeases, setUpcomingLeases] = useState<UpcomingReturn[]>([]);
  console.log("upcomingLeases", upcomingLeases);

  const leaseColumns: GridColDef[] = [
    { field: "id_locacao", headerName: "ID Locação", width: 120 },
    { field: "clienteName", headerName: "Cliente", width: 180 },
    { field: "clienteTelefone", headerName: "Telefone", width: 150 },
    {
      field: "data_prevista_devolucao",
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

  // Busca e processa locações
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
          const dueDate = new Date(lease.data_prevista_devolucao);
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
          data_prevista_devolucao: lease.data_prevista_devolucao,
          status: lease.status,
        }));

      setUpcomingLeases(upcoming);
    } catch (error) {
      console.error("Erro ao buscar locações:", error);
    }
  }, []);

  // Atualiza largura do container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Busca dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, stocksData] = await Promise.all([
          getProductList(),
          getStocksList(),
        ]);

        setProducts(productsData);

        // Processar dados de estoque
        const processedStockData = processStockData(stocksData);
        setStockChartData(processedStockData);
        setFilteredStockData({
          products: processedStockData.products,
          available: processedStockData.available,
          rented: processedStockData.rented,
        });

        // Busca locações
        await fetchAndProcessLeases();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAndProcessLeases]);

  // Mostra alerta e modal quando vem do login
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

  // Processa dados de estoque para o gráfico
  const processStockData = useCallback((stocks: StockProps[]) => {
    const productMap = stocks.reduce((acc, stock) => {
      if (!acc[stock.id_produto]) {
        acc[stock.id_produto] = {
          name: stock.produto.name,
          marca: stock.produto.marca,
          available: 0,
          rented: 0,
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      stock.status === "Disponível"
        ? acc[stock.id_produto].available++
        : acc[stock.id_produto].rented++;

      return acc;
    }, {} as Record<number, { name: string; marca: string; available: number; rented: number }>);

    const products = Object.values(productMap);
    return {
      products: products.map((p) => `${p.name} (${p.marca})`),
      available: products.map((p) => p.available),
      rented: products.map((p) => p.rented),
      productIds: Object.keys(productMap).map(Number),
    };
  }, []);

  // Filtra produtos no gráfico de estoque
  const handleProductFilter = useCallback(
    (event: SelectChangeEvent<number | "all">) => {
      const productId = event.target.value;
      setSelectedProduct(productId === "all" ? "all" : Number(productId));

      if (productId === "all" || !stockChartData) {
        setFilteredStockData({
          products: stockChartData?.products || [],
          available: stockChartData?.available || [],
          rented: stockChartData?.rented || [],
        });
        return;
      }

      const productIndex = stockChartData.productIds.indexOf(
        productId as number
      );
      if (productIndex !== -1) {
        setFilteredStockData({
          products: [stockChartData.products[productIndex]],
          available: [stockChartData.available[productIndex]],
          rented: [stockChartData.rented[productIndex]],
        });
      }
    },
    [stockChartData]
  );

  // Processa dados para o gráfico de receita
  const processRevenueData = useCallback(() => {
    const monthlyRevenue: Record<string, number> = {};

    leases.forEach((lease) => {
      if (lease.status !== "Finalizado") return;

      const date = new Date(lease.data_prevista_devolucao);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyRevenue[monthYear] =
        (monthlyRevenue[monthYear] || 0) + Number(lease.valor_total);
    });

    // Ordena por data
    const sortedMonths = Object.keys(monthlyRevenue).sort((a, b) => {
      const [aMonth, aYear] = a.split("/").map(Number);
      const [bMonth, bYear] = b.split("/").map(Number);
      return aYear - bYear || aMonth - bMonth;
    });

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Receita (R$)",
          data: sortedMonths.map((month) => monthlyRevenue[month]),
          backgroundColor: theme.palette.secondary.main,
        },
      ],
    };
  }, [leases, theme.palette.secondary.main]);

  const revenueChartData = processRevenueData();
  const shouldRotateLabels = filteredStockData?.products.length
    ? filteredStockData.products.length > 5 || containerWidth < 600
    : false;
  const bottomMargin = filteredStockData?.products.length
    ? filteredStockData.products.length > 3
      ? 120
      : 80
    : 80;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const upcomingDueLeases = leases
    .filter((lease) => {
      const dueDate = new Date(lease.data_prevista_devolucao);
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
      data_prevista_devolucao: lease.data_prevista_devolucao,
      status: lease.status,
    }));

  const overdueLeases = leases
    .filter((lease) => {
      const dueDate = new Date(lease.data_prevista_devolucao);
      dueDate.setHours(0, 0, 0, 0);
      return lease.status === "Ativo" && dueDate.getTime() < today.getTime();
    })
    .map((lease) => ({
      id_locacao: lease.id_locacao,
      clienteName: lease.cliente?.name || "",
      clienteTelefone: lease.cliente?.telefone || "",
      data_prevista_devolucao: lease.data_prevista_devolucao,
      status: lease.status,
    }));

  console.log("upcomingDueLeases", upcomingDueLeases);
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#E0E0E0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Snackbar de boas-vindas */}
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

          {/* Modal de boas-vindas com locações */}
          <Dialog
            open={showWelcomeModal}
            onClose={() => setShowWelcomeModal(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              👋 Bem-vindo ao Sistema - Atenção às Locações
            </DialogTitle>

            <DialogContent>
              {overdueLeases.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  ⚠️ Você tem {overdueLeases.length} locação(ões){" "}
                  <strong>atrasada(s)</strong>!
                </Alert>
              )}

              {upcomingDueLeases.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  🕒 Você tem {upcomingDueLeases.length} locação(ões) com
                  devolução <strong>hoje ou amanhã</strong>!
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
                        const dueDate = new Date(
                          params.row?.data_prevista_devolucao
                        );
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

          {/* Conteúdo principal do dashboard */}
          <Grid container spacing={3}>
            {/* Gráfico de Estoque */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="600">
                    📊 Estoque por Produto
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Filtrar por produto</InputLabel>
                    <Select
                      value={selectedProduct}
                      onChange={handleProductFilter}
                      label="Filtrar por produto"
                    >
                      <MenuItem value="all">Todos os produtos</MenuItem>
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name} ({product.marca})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {loading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress size={60} thickness={4} />
                  </Box>
                ) : filteredStockData?.products.length ? (
                  <Box ref={containerRef} sx={{ height: 500 }}>
                    <BarChart
                      width={Math.max(containerWidth, 600)}
                      height={480}
                      dataset={filteredStockData.products.map(
                        (product, index) => ({
                          product,
                          available: filteredStockData.available[index],
                          rented: filteredStockData.rented[index],
                        })
                      )}
                      series={[
                        {
                          dataKey: "available",
                          label: "Disponível",
                          color: theme.palette.success.main,
                          valueFormatter: (value) =>
                            `${value} ${value === 1 ? "item" : "itens"}`,
                        },
                        {
                          dataKey: "rented",
                          label: "Alugado",
                          color: theme.palette.error.main,
                          valueFormatter: (value) =>
                            `${value} ${value === 1 ? "item" : "itens"}`,
                        },
                      ]}
                      xAxis={[
                        {
                          scaleType: "band",
                          dataKey: "product",
                          label: "Produtos",
                          tickLabelStyle: shouldRotateLabels
                            ? { angle: -45, textAnchor: "end", fontSize: 12 }
                            : { fontSize: 12 },
                        },
                      ]}
                      yAxis={[
                        {
                          label: "Quantidade de Itens",
                          tickMinStep: 1,
                        },
                      ]}
                      margin={{
                        left: 80,
                        right: 50,
                        top: 30,
                        bottom: bottomMargin,
                      }}
                      slotProps={{
                        legend: {
                          direction: "row",
                          position: { vertical: "top", horizontal: "right" },
                        },
                      }}
                      grid={{ horizontal: true }}
                    />
                  </Box>
                ) : (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height={400}
                  >
                    <Typography variant="body1" color="textSecondary">
                      {stockChartData
                        ? "Nenhum dado correspondente ao filtro"
                        : "Nenhum dado disponível"}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Gráfico de Receita */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  💰 Receita Mensal de Locações
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ height: 400 }}>
                    <Bar
                      data={revenueChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: function (
                                this: TooltipModel<"bar">,
                                tooltipItem: TooltipItem<"bar">
                              ) {
                                return typeof tooltipItem.raw === "number"
                                  ? `R$ ${tooltipItem.raw.toFixed(2)}`
                                  : `R$ 0.00`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value) => `R$ ${value}`,
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Layout>
    </Box>
  );
}
