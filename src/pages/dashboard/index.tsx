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
  Container,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import Layout from "@components/Layout";
import { getStocksList } from "@services/getStocksList";
import { getProductList } from "@services/getProductList";

interface Product {
  id: number;
  name: string;
  marca: string;
}

interface ChartData {
  products: string[];
  available: number[];
  rented: number[];
  productIds: number[];
}

export default function ProductStockChart() {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | "all">("all");
  const [filteredData, setFilteredData] = useState<Omit<
    ChartData,
    "productIds"
  > | null>(null);

  // Handle container resize
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

  // Fetch products for filter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProductList();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Process stock data into chart format
  const processStockData = useCallback((stocks: any[]) => {
    const productMap = stocks.reduce(
      (
        acc: Record<
          number,
          { name: string; marca: string; available: number; rented: number }
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

        if (stock.status === "Disponível") {
          acc[stock.id_produto].available++;
        } else if (stock.status === "Alugado") {
          acc[stock.id_produto].rented++;
        }

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

  // Fetch and process data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const stocks = await getStocksList();
        const processedData = processStockData(stocks);

        setChartData(processedData);
        setFilteredData({
          products: processedData.products,
          available: processedData.available,
          rented: processedData.rented,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [processStockData]);

  // Filter products
  const handleProductFilter = useCallback(
    (event: SelectChangeEvent<number | "all">) => {
      const productId = event.target.value;
      setSelectedProduct(productId);

      if (productId === "all" || !chartData) {
        setFilteredData({
          products: chartData?.products || [],
          available: chartData?.available || [],
          rented: chartData?.rented || [],
        });
        return;
      }

      const productIndex = chartData.productIds.indexOf(productId as number);

      if (productIndex !== -1) {
        setFilteredData({
          products: [chartData.products[productIndex]],
          available: [chartData.available[productIndex]],
          rented: [chartData.rented[productIndex]],
        });
      }
    },
    [chartData]
  );

  // Chart configuration
  const shouldRotateLabels = filteredData?.products.length
    ? filteredData.products.length > 5 || containerWidth < 600
    : false;
  const barSize = filteredData?.products.length
    ? Math.max(30, Math.min(60, 400 / filteredData.products.length))
    : 40;
  const bottomMargin = filteredData?.products.length
    ? filteredData.products.length > 3
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
        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            display: "flex",
            backgroundColor: "#E0E0E0",
            flexDirection: "column",
            py: 4,
          }}
        >
          <Box
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              backgroundColor: "#E0E0E0",

              position: "relative",
              overflow: "hidden",
              "&:before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              },
            }}
          >
            {/* Header with Filter */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                backgroundColor: "#E0E0E0",
                flexWrap: "wrap",
                gap: 2,
                position: "relative",
                zIndex: 2,
              }}
            >
              <Typography variant="h5" fontWeight="600">
                📊 Estoque por Produto
              </Typography>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="product-filter-label">
                  Filtrar por produto
                </InputLabel>
                <Select
                  labelId="product-filter-label"
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

            {/* Chart Container */}
            <Box
              ref={containerRef}
              sx={{
                position: "relative",
                zIndex: 1,
                height: 500,
                width: "100%",
                minWidth: 600,
                overflowX: "auto",
                border: `1px solid ${theme.palette.action.hover}`,
                borderRadius: 1,
                backgroundColor: theme.palette.background.default,
                p: 2,
              }}
            >
              {loading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <CircularProgress size={60} thickness={4} />
                </Box>
              ) : filteredData?.products.length ? (
                <BarChart
                  width={Math.max(containerWidth, 600)}
                  height={480}
                  dataset={filteredData.products.map((product, index) => ({
                    product,
                    available: filteredData.available[index],
                    rented: filteredData.rented[index],
                  }))}
                  series={[
                    {
                      dataKey: "available",
                      label: "Disponível",
                      color: theme.palette.success.main,
                      barSize,
                      valueFormatter: (value) =>
                        `${value} ${value === 1 ? "item" : "itens"}`,
                    },
                    {
                      dataKey: "rented",
                      label: "Alugado",
                      color: theme.palette.error.main,
                      barSize,
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
                  sx={{
                    "& .MuiBarElement-root": {
                      rx: 6,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        opacity: 0.9,
                        transform: "scaleY(1.05)",
                      },
                    },
                  }}
                />
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                  flexDirection="column"
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      mb: 2,
                      opacity: 0.6,
                      backgroundImage: `radial-gradient(${theme.palette.text.disabled} 1px, transparent 1px)`,
                      backgroundSize: "8px 8px",
                    }}
                  />
                  <Typography variant="body1" color="textSecondary">
                    {chartData
                      ? "Nenhum dado correspondente ao filtro"
                      : "Nenhum dado disponível"}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="caption" color="textSecondary">
                Atualizado em: {new Date().toLocaleDateString("pt-BR")}
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                {[
                  { color: "success.main", label: "Disponível" },
                  { color: "error.main", label: "Alugado" },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: item.color,
                        mr: 1,
                        borderRadius: "2px",
                      }}
                    />
                    <Typography variant="caption">{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Layout>
    </Box>
  );
}
