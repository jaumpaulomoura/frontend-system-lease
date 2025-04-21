import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { PiFilePdf } from "react-icons/pi";
import {
  Box,
  Button,
  Container,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { yupResolver } from "@hookform/resolvers/yup";
import { InitialContext } from "@contexts/InitialContext";
import { ProductProps } from "@interfaces/Product";
import { createProduct } from "@services/createProduct";
import { deleteProduct } from "@services/deleteProduct";
import { getProductList } from "@services/getProductList";
import { patchProduct } from "@services/patchProduct";

import { ProductResolver } from "@utils/resolver";
import Layout from "@components/Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import RegisterPatrimonyModal from "./RegisterPatrimonyModal";
import { getStocksSearch } from "@services/getStockSearch";

import { StockProps } from "@interfaces/Stock";

export type FormData = {
  id?: number;
  name: string;
  marca: string; // Mudança de "name" para "marca"
  description?: string;
  daily_value?: number | null;
  weekly_value?: number | null;
  monthly_value?: number | null;
  annual_value?: number | null;
  active: boolean;
};
type TableCell =
  | string
  | { content: string; colSpan?: number; styles?: Record<string, string> };
type TableRow = TableCell[];

export default function ProductPage() {
  const { setLoading } = useContext(InitialContext);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<ProductProps | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterMarca, setFilterMarca] = useState("");

  const [filterActive, setFilterActive] = useState<boolean | "all">("all");
  const [openPatrimonyModal, setOpenPatrimonyModal] = useState(false);
  const [stockData, setStockData] = useState<StockProps[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductProps | null>(
    null
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const form = useForm<FormData>({
    resolver: yupResolver(ProductResolver),
    mode: "onChange",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProductList();
      console.log(data);
      setProducts(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (editProduct) {
      form.reset({
        name: editProduct.name,
        marca: editProduct.marca,
        description: editProduct.description || "",
        daily_value: editProduct.daily_value ?? null,
        weekly_value: editProduct.weekly_value ?? null,
        monthly_value: editProduct.monthly_value ?? null,
        annual_value: editProduct.annual_value ?? null,
        active: editProduct.active ?? true,
      });
    } else {
      form.reset({
        name: "",
        marca: "",
        description: "",
        daily_value: null,
        weekly_value: null,
        monthly_value: null,
        annual_value: null,
        active: true,
      });
    }
  }, [editProduct, form]);
  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      // Verificar se há itens em estoque antes de deletar
      const stockData = await getStocksSearch(deleteId);

      if (stockData && stockData.length > 0) {
        setSnackbar({
          open: true,
          message:
            "Não é possível excluir o produto pois existem itens em estoque vinculados a ele.",
          severity: "error",
        });
        setOpenDialog(false);
        return;
      }

      await deleteProduct(deleteId.toString());
      setProducts((prev) => prev.filter((product) => product.id !== deleteId));

      setDeleteId(null);
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: "Produto deletado com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao deletar o produto:", error);
      setSnackbar({
        open: true,
        message: "Erro ao deletar o produto.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: FormData) => {
    setLoading(true);

    try {
      const productData: ProductProps = {
        id: editProduct?.id ?? 0,
        name: data.name,
        marca: data.marca,
        description: data.description || "",
        daily_value: data.daily_value ?? null,
        weekly_value: data.weekly_value ?? null,
        monthly_value: data.monthly_value ?? null,
        annual_value: data.annual_value ?? null,
        active: data.active ?? true,
        createdAt: editProduct?.createdAt,
        updatedAt: new Date().toISOString(),
      };

      let actionMessage = "";

      if (editProduct?.id) {
        await patchProduct(productData, editProduct.id);
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editProduct.id
              ? { ...product, ...productData }
              : product
          )
        );
        actionMessage = "Produto atualizado com sucesso!";
      } else {
        const newProduct = await createProduct(productData);
        setProducts((prev) => [...prev, newProduct]);
        actionMessage = "Produto criado com sucesso!";
      }

      setOpenForm(false);
      setEditProduct(null);

      // Feedback visual para o usuário
      setSnackbar({
        open: true,
        message: actionMessage,
        severity: "success",
      });
    } catch (error: unknown) {
      console.error("Erro na operação de produto:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro durante a operação";

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const generatePDF = () => {
    console.log(
      "Dados dos produtos para o PDF:",
      JSON.parse(JSON.stringify(filteredProducts))
    );

    const doc = new jsPDF();

    // Configurações iniciais
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("Relatório de Produtos com Estoque", 105, 20, { align: "center" });

    // Data de emissão
    doc.setFontSize(10);
    doc.text(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);

    // Preparar os dados para a tabela
    const tableData: TableRow[] = [];

    filteredProducts.forEach((product) => {
      // Linha do produto (mesclada)
      tableData.push([
        {
          content: `${product.id} - ${product.name}`,
          colSpan: 8,
          styles: {
            fillColor: `rgb(220, 220, 220)`,

            fontStyle: "bold",
          },
        },
      ]);

      // Cabeçalhos dos itens de estoque
      tableData.push([
        { content: "Patrimônio", styles: { fontStyle: "bold" } },
        { content: "Status", styles: { fontStyle: "bold" } },
        { content: "Valor Diário", styles: { fontStyle: "bold" } },
        { content: "Valor Semanal", styles: { fontStyle: "bold" } },
        { content: "Valor Mensal", styles: { fontStyle: "bold" } },
        { content: "Data Criação", styles: { fontStyle: "bold" } },
        { content: "Status", styles: { fontStyle: "bold" } },
        { content: "", styles: { fontStyle: "bold" } },
      ]);

      // Itens de estoque (ou mensagem se não houver)
      if (product.stock && product.stock.length > 0) {
        product.stock.forEach((stock) => {
          tableData.push([
            stock.numero_patrimonio || "N/A",
            stock.status || "N/A",
            formatCurrency(product.daily_value ?? 0),
            formatCurrency(product.weekly_value ?? 0),
            formatCurrency(product.monthly_value ?? 0),
            stock.createdAt
              ? new Date(stock.createdAt).toLocaleDateString("pt-BR")
              : "N/A",
            product.active ? "Disponível" : "Alugado",
            "", // Célula vazia para completar
          ]);
        });
      } else {
        tableData.push([
          {
            content: "Nenhum item em estoque",
            colSpan: 8,
            styles: { fontStyle: "italic" },
          },
        ]);
      }

      // Espaçamento entre produtos
      tableData.push(["", "", "", "", "", "", "", ""]);
    });

    // Gerar a tabela
    autoTable(doc, {
      startY: 40,
      head: [["ID/Nome", "", "", "", "", "", "", ""]], // Cabeçalho vazio
      body: tableData,
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
        7: { cellWidth: 10 },
      },
      didDrawPage: (data) => {
        // Rodapé com número de páginas
        doc.setFontSize(10);
        const pageCount = doc.getNumberOfPages();
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    doc.save(`produtos_estoque_${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };
  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Ações",
      width: 80,
      renderCell: (params) => (
        <Box
          margin={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          width="100%"
          gap={0.1}
        >
          <Button
            onClick={() => {
              setEditProduct(params.row);
              setOpenForm(true);
            }}
            sx={{ width: "40px", minWidth: "40px" }}
          >
            <MdEdit color="blue" />
          </Button>
          <Button
            onClick={() => {
              setDeleteId(params.row.id);
              setOpenDialog(true);
            }}
            sx={{ width: "40px", minWidth: "40px" }}
          >
            <MdDelete color="red" />
          </Button>
        </Box>
      ),
    },
    {
      field: "addPatrimony",
      headerName: "Patrimônio",
      width: 100,
      renderCell: (params: GridRenderCellParams<ProductProps>) => (
        <Button
          onClick={() => handleAddPatrimony(params)}
          sx={{ width: "40px", minWidth: "40px" }}
        >
          <IoAddCircleOutline color="green" />
        </Button>
      ),
    },
    { field: "id", headerName: "Codigo Produto", width: 120 },
    { field: "name", headerName: "Nome", width: 130 },
    { field: "marca", headerName: "Marca", width: 130 }, // Nome alterado para Marca
    { field: "description", headerName: "Descrição", width: 130 },

    {
      field: "daily_value",
      headerName: "Valor Diario",
      width: 100,
      type: "number",
      // valueFormatter: (params) => (params ? `R$ ${params.toFixed(2)}` : "N/A"),
    },
    {
      field: "weekly_value",
      headerName: "Valor Semanal",
      width: 120,
      type: "number",
      // valueFormatter: (params) => (params ? `R$ ${params.toFixed(2)}` : "N/A"),
    },
    {
      field: "monthly_value",
      headerName: "Valor Mensal",
      width: 100,
      type: "number",
    },
    {
      field: "annual_value",
      headerName: "Valor Anual",
      width: 90,
      type: "number",
      // valueFormatter: (params) => (params ? `R$ ${params.toFixed(2)}` : "N/A"),
    },
    {
      field: "active",
      headerName: "Ativo",
      width: 100,
      type: "boolean",
    },
    {
      field: "createdAt",
      headerName: "Criado em",
      width: 100,
      valueFormatter: (params) =>
        params ? new Date(params).toLocaleDateString("pt-BR") : "",
    },
    {
      field: "updatedAt",
      headerName: "Atualizado em",
      width: 100,
      valueFormatter: (params) =>
        params ? new Date(params).toLocaleDateString("pt-BR") : "",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name
      .toLowerCase()
      .includes(filterName.toLowerCase());

    const activeMatch =
      filterActive === "all" || product.active === filterActive;

    const marcaMatch = product.marca
      .toLowerCase()
      .includes(filterMarca.toLowerCase());

    return nameMatch && activeMatch && marcaMatch;
  });

  const handleAddPatrimony = async (
    params: GridRenderCellParams<ProductProps>
  ) => {
    const id_produto = params.row.id; // Pega o id do produto
    setSelectedProduct(params.row);
    setOpenPatrimonyModal(true); // Abre o modal

    try {
      // Chama a função do service passando o id_produto
      const stockData = await getStocksSearch(id_produto);
      console.log(stockData); // Exibe os dados no console
      setStockData(stockData); // Atualiza o estado com os dados do estoque
    } catch (error) {
      console.error("Erro ao buscar dados de estoque:", error);
    }
  };
  const capitalizeWords = (str: string) =>
    str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  return (
    <Box
      sx={{
        height: "100vh", // Define a altura da tela inteira
        backgroundColor: "#E0E0E0", // Cor de fundo global
        display: "flex",
        flexDirection: "column", // Garante que o conteúdo será organizado em coluna
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              padding: 0, // Remove o padding do Box
              height: "calc(100vh - 64px)", // Subtrai a altura do menu, assumindo que é 64px
            }}
          >
            {/* Filtro e Botões */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 1,
                padding: 0, // Define o padding interno para o Box de filtros e botões
                marginTop: "5px",
              }}
            >
              <TextField
                label="Filtrar por nome"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
              <TextField
                label="Filtrar por Marca"
                value={filterMarca}
                onChange={(e) => setFilterMarca(e.target.value)}
              />

              <FormControl sx={{ width: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterActive}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "true") setFilterActive(true);
                    else if (value === "false") setFilterActive(false);
                    else setFilterActive("all");
                  }}
                  label="Status"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="true">Ativos</MenuItem>
                  <MenuItem value="false">Inativos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                marginTop: "15px",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenForm(true)}
                startIcon={<IoAddCircleOutline />}
              >
                Adicionar Produto
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={generatePDF}
                startIcon={<PiFilePdf />}
              >
                Gerar PDF
              </Button>
            </Box>

            {/* DataGrid de Produtos */}
            <Box sx={{ flexGrow: 1, marginTop: "10px" }}>
              <DataGrid
                rows={filteredProducts}
                columns={columns}
                disableRowSelectionOnClick
                autoHeight={false}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
              />
            </Box>
          </Box>
        </Container>
      </Layout>
      {/* Diálogo de Exclusão */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Tem certeza de que deseja excluir este produto?
          <br />
          <br />
          <br />
          {deleteId && (
            <small>
              Observação: Se houver itens em estoque vinculados a este produto,
              a exclusão não será permitida.
            </small>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
      {/* Formulário de Adicionar/Editar Produto */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>
          {editProduct ? "Editar Produto" : "Adicionar Produto"}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={form.handleSubmit(handleCreateOrUpdate)}>
            <TextField
              label="Nome" // Mudado de "Nome" para "Marca"
              fullWidth
              margin="normal"
              {...form.register("name")}
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
              onChange={(e) => {
                const capitalized = capitalizeWords(e.target.value);
                form.setValue("name", capitalized, {
                  shouldValidate: true,
                });
              }}
            />
            <TextField
              label="Marca" // Mudado de "Nome" para "Marca"
              fullWidth
              margin="normal"
              {...form.register("marca")}
              error={!!form.formState.errors.marca}
              helperText={form.formState.errors.marca?.message}
              onChange={(e) => {
                const capitalized = capitalizeWords(e.target.value);
                form.setValue("marca", capitalized, {
                  shouldValidate: true,
                });
              }}
            />
            <TextField
              label="Descrição"
              fullWidth
              margin="normal"
              {...form.register("description")}
            />
            <TextField
              label="Valor Diario"
              fullWidth
              margin="normal"
              {...form.register("daily_value")}
              type="number"
              error={!!form.formState.errors.daily_value}
              helperText={form.formState.errors.daily_value?.message}
            />
            <TextField
              label="Valor Semanal"
              fullWidth
              margin="normal"
              {...form.register("weekly_value")}
              type="number"
              error={!!form.formState.errors.weekly_value}
              helperText={form.formState.errors.weekly_value?.message}
            />
            <TextField
              label="Valor Mensal"
              fullWidth
              margin="normal"
              {...form.register("monthly_value")}
              type="number"
              error={!!form.formState.errors.monthly_value}
              helperText={form.formState.errors.monthly_value?.message}
            />
            <TextField
              label="Valor Anual"
              fullWidth
              margin="normal"
              {...form.register("annual_value")}
              type="number"
              error={!!form.formState.errors.annual_value}
              helperText={form.formState.errors.annual_value?.message}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <input
                type="checkbox"
                {...form.register("active")}
                defaultChecked={true}
              />
              <label>Ativo</label>
            </Box>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleCreateOrUpdate)}
            color="primary"
          >
            {editProduct ? "Salvar Alterações" : "Adicionar Produto"}
          </Button>
        </DialogActions>
      </Dialog>
      <RegisterPatrimonyModal
        open={openPatrimonyModal}
        onClose={() => setOpenPatrimonyModal(false)}
        product={selectedProduct} // Passando o produto para o modal
        stockData={stockData} // Passando os dados de estoque para o modal
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{
          vertical: "bottom", // Posiciona na parte inferior
          horizontal: "right", // Alinha à direita
        }}
        sx={{
          // Ajuste para não sobrepor o menu lateral
          marginLeft: "240px", // Use o mesmo valor da largura do seu menu
          "@media (max-width: 600px)": {
            marginLeft: "0px", // Remove o margin em telas pequenas
            bottom: "70px", // Evita conflito com mobile navigation
          },
        }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            width: "100%",
            boxShadow: 3, // Sombra para melhor visibilidade
            alignItems: "center", // Alinha o ícone e texto verticalmente
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
