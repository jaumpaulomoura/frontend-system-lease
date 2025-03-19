import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
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
import { DataGrid, GridColDef } from "@mui/x-data-grid";
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

export type FormData = {
  id?: number;
  name: string;
  marca: string; // Mudança de "name" para "marca"
  description?: string;
  weekly_value?: number | null;
  monthly_value?: number | null;
  annual_value?: number | null;
  active: boolean;
};

export default function ProductPage() {
  const { setLoading } = useContext(InitialContext);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<ProductProps | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [filterName, setFilterName] = useState("");
  const form = useForm<FormData>({
    resolver: yupResolver(ProductResolver),
    mode: "onChange",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProductList();
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
        weekly_value: null,
        monthly_value: null,
        annual_value: null,
        active: true,
      });
    }
  }, [editProduct, form]);

  const handleDelete = async () => {
    if (deleteId) {
      setLoading(true);
      await deleteProduct(deleteId.toString());
      setProducts((prev) => prev.filter((product) => product.id !== deleteId));
      setDeleteId(null);
      setOpenDialog(false);
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
        weekly_value: data.weekly_value ?? null,
        monthly_value: data.monthly_value ?? null,
        annual_value: data.annual_value ?? null,
        active: data.active ?? true,
        createdAt: editProduct?.createdAt,
        updatedAt: new Date().toISOString(),
      };

      if (editProduct?.id) {
        await patchProduct(productData, editProduct.id);
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editProduct.id
              ? { ...product, ...productData }
              : product
          )
        );
      } else {
        const newProduct = await createProduct(productData);
        setProducts((prev) => [...prev, newProduct]);
      }

      setOpenForm(false);
      setEditProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Produtos", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "ID",
          "Name",
          "Marca", // Nome alterado para Marca
          "Descrição",
          "Valor Semanal",
          "Valor Mensal",
          "Valor Anual",
          "Ativo",
        ],
      ],
      body: products.map(
        ({
          id,
          name,
          marca,
          description,
          weekly_value,
          monthly_value,
          annual_value,
          active,
        }) => [
          id,
          name,
          marca,
          description || "", // Substituindo undefined por string vazia
          weekly_value != null ? `R$ ${weekly_value.toFixed(2)}` : "N/A", // Verifica se é null
          monthly_value != null ? `R$ ${monthly_value.toFixed(2)}` : "N/A", // Verifica se é null
          annual_value != null ? `R$ ${annual_value.toFixed(2)}` : "N/A", // Verific
          active ? "Sim" : "Não",
        ]
      ),
    });

    doc.save("Produtos.pdf");
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Nome", width: 200, flex: 1 },
    { field: "marca", headerName: "Marca", width: 200, flex: 1 }, // Nome alterado para Marca
    { field: "description", headerName: "Descrição", width: 300, flex: 1 },
    {
      field: "weekly_value",
      headerName: "Valor Semanal",
      width: 150,
      type: "number",
      // valueFormatter: (params) => (params ? `R$ ${params.toFixed(2)}` : "N/A"),
    },
    {
      field: "monthly_value",
      headerName: "Valor Mensal",
      width: 150,
      type: "number",
    },
    {
      field: "annual_value",
      headerName: "Valor Anual",
      width: 150,
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
      width: 180,
      valueFormatter: (params) =>
        params ? new Date(params).toLocaleDateString("pt-BR") : "",
    },
    {
      field: "updatedAt",
      headerName: "Atualizado em",
      width: 180,
      valueFormatter: (params) =>
        params ? new Date(params).toLocaleDateString("pt-BR") : "",
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            onClick={() => {
              setEditProduct(params.row);
              setOpenForm(true);
            }}
          >
            <MdEdit color="blue" />
          </Button>
          <Button
            onClick={() => {
              setDeleteId(params.row.id);
              setOpenDialog(true);
            }}
          >
            <MdDelete color="red" />
          </Button>
        </Box>
      ),
    },
  ];

  const filteredProducts = products.filter(
    (product) => product.marca.toLowerCase().includes(filterName.toLowerCase()) // Marca no filtro
  );

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
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {/* Filtro e Botões */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 1,
                marginTop: "5px",
              }}
            >
              <TextField
                label="Filtrar por Marca"
                variant="outlined" // Alterado de "Nome" para "Marca"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
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
            <Box sx={{ flexGrow: 1, marginTop: "15px" }}>
              <DataGrid
                rows={filteredProducts}
                columns={columns}
                disableRowSelectionOnClick
                autoHeight={false}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
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
            />
            <TextField
              label="Marca" // Mudado de "Nome" para "Marca"
              fullWidth
              margin="normal"
              {...form.register("marca")}
              error={!!form.formState.errors.marca}
              helperText={form.formState.errors.marca?.message}
            />
            <TextField
              label="Descrição"
              fullWidth
              margin="normal"
              {...form.register("description")}
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
    </Box>
  );
}
