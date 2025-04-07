import React, { useEffect, useState, useRef, useCallback } from "react";
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

// Registra os componentes do Chart.js
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

// interface LeaseItem {
//   valor_negociado_diario: string;
//   valor_negociado_semanal: string;
//   valor_negociado_mensal: string;
//   valor_negociado_anual: string;
// }

// interface Lease {
//   id_locacao: number;
//   data_prevista_devolucao: string;
//   valor_: string;
//   leaseItems: LeaseItem[];
//   status: string;
// }

interface StockChartData {
  products: string[];
  available: number[];
  rented: number[];
  productIds: number[];
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
        const [productsData, stocksData, leasesData] = await Promise.all([
          getProductList(),
          getStocksList(),
          getLeaseList(),
        ]);
        console.log("Dados brutos das locações:", leasesData);
        setProducts(productsData);
        setLeases(leasesData); // Agora usa os dados diretamente sem conversão

        // Processar dados de estoque
        const processedStockData = processStockData(stocksData);
        setStockChartData(processedStockData);
        setFilteredStockData({
          products: processedStockData.products,
          available: processedStockData.available,
          rented: processedStockData.rented,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Processa dados de estoque para o gráfico
  const processStockData = useCallback((stocks: StockProps[]) => {
    const productMap = stocks.reduce(
      (
        acc: Record<
          number,
          {
            name: string;
            marca: string;
            available: number;
            rented: number;
          }
        >,
        stock
      ) => {
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
      },
      {}
    );

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
  const processRevenueData = () => {
    const monthlyRevenue: Record<string, number> = {};

    leases.forEach((lease) => {
      if (lease.status !== "Finalizado") return;

      const date = new Date(lease.data_prevista_devolucao);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

      // Usa diretamente o valor_total convertido para número
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
  };

  const revenueChartData = processRevenueData();
  const shouldRotateLabels = filteredStockData?.products.length
    ? filteredStockData.products.length > 5 || containerWidth < 600
    : false;
  const bottomMargin = filteredStockData?.products.length
    ? filteredStockData.products.length > 3
      ? 120
      : 80
    : 80;

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
                            ? {
                                angle: -45,
                                textAnchor: "end",
                                fontSize: 12,
                              }
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
                            // Na configuração do seu gráfico:
                            callbacks: {
                              label: function (
                                this: TooltipModel<"bar">,
                                tooltipItem: TooltipItem<"bar">
                              ) {
                                // Verifica se raw existe e é número
                                if (typeof tooltipItem.raw === "number") {
                                  return `R$ ${tooltipItem.raw.toFixed(2)}`;
                                }
                                // Caso contrário (pode ser string, undefined, etc)
                                return `R$ 0.00`;
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
