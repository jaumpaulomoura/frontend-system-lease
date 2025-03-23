import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ProductProps } from "@interfaces/Product";
import { StockProps } from "@interfaces/Stock";
import { createStock } from "@services/createStock";

interface RegisterPatrimonyModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductProps | null;
  stockData: StockProps[] | null;
}

interface FormData {
  nfNumber: string;
  value: number;
  quantity: number;
  numero_patrimonio: string;
}

// Esquema de validação com Yup
const patrimonySchema = yup.object().shape({
  nfNumber: yup.string().required("Número da NF é obrigatório"),
  value: yup
    .number()
    .required("Valor é obrigatório")
    .min(0, "O valor não pode ser negativo"),
  quantity: yup
    .number()
    .required("Quantidade é obrigatória")
    .min(1, "A quantidade deve ser pelo menos 1"),
});

export default function RegisterPatrimonyModal({
  open,
  onClose,
  product,
  stockData = [], // Usando stockData caso seja passado do componente pai
}: RegisterPatrimonyModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(patrimonySchema),
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [stock, setStock] = useState<StockProps[]>(stockData || []); // Inicializa com array vazio caso stockData seja null

  // Logando o estado inicial de stock
  console.log("Dados iniciais de estoque:", stockData);

  // Atualiza o estado sempre que stockData mudar
  useEffect(() => {
    console.log("Dados iniciais de estoque recebidos no modal:", stockData);
    setStock(stockData || []); // Atualiza o estado com array vazio caso stockData seja null
  }, [stockData]);

  const onSubmit = async (data: FormData) => {
    if (!product) return;
    setLoading(true);

    try {
      const stockData: StockProps = {
        id_produto: product.id,
        numero_patrimonio: "abc", // O número do patrimônio pode ser alterado dinamicamente
        nota_fiscal: data.nfNumber,
        valor_pago: data.value,
        status: "Disponível",
        observacoes: `Adicionado ${data.quantity} unidades`,
        id_patrimonio: 0,
      };

      // Chamada à API para criar o item no estoque
      const newStock = await createStock(stockData);

      // Atualiza o estado local com o novo item
      setStock((prevStock) => [...prevStock, newStock]);

      setSnackbarMessage("Item adicionado ao estoque com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      reset(); // Reseta o formulário
      setAddModalOpen(false); // Fecha o modal de adição
    } catch (error) {
      console.error("Erro ao adicionar ao estoque:", error);
      setSnackbarMessage("Erro ao adicionar item ao estoque.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID Patrimônio", flex: 1 },
    { field: "nota_fiscal", headerName: "Nota Fiscal", flex: 1 },
    { field: "valor_pago", headerName: "Valor Pago", flex: 1, type: "number" },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Gerenciar Estoque - {product?.name}</DialogTitle>
      <DialogContent>
        {stock && stock.length === 0 ? (
          <p>Sem itens no estoque</p> // Verifica se stock tem elementos
        ) : (
          <DataGrid
            rows={stock.map((item) => ({ ...item, id: item.id }))}
            columns={columns}
            autoHeight
            pageSizeOptions={[5, 10]}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={() => setAddModalOpen(true)}
          style={{ marginTop: 10 }}
        >
          Adicionar
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={loading}>
          Fechar
        </Button>
      </DialogActions>

      {/* Modal para Adicionar ao Estoque */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <DialogTitle>Adicionar ao Estoque</DialogTitle>
        <DialogContent>
          <Controller
            name="nfNumber"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Número da NF"
                fullWidth
                margin="normal"
                error={!!errors.nfNumber}
                helperText={errors.nfNumber?.message}
              />
            )}
          />
          <Controller
            name="value"
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <TextField
                {...field}
                label="Valor"
                fullWidth
                margin="normal"
                type="number"
                error={!!errors.value}
                helperText={errors.value?.message}
              />
            )}
          />
          <Controller
            name="quantity"
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <TextField
                {...field}
                label="Quantidade"
                fullWidth
                margin="normal"
                type="number"
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAddModalOpen(false)}
            color="primary"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            color="primary"
            disabled={loading}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
