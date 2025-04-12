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
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProductProps } from "@interfaces/Product";
import { StockProps } from "@interfaces/Stock";
import { createStock } from "@services/createStock";
import { patchStock } from "@services/patchStock";
import { patrimonySchema } from "@utils/resolver";

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
  numero_patrimonio?: string;
}

export default function RegisterPatrimonyModal({
  open,
  onClose,
  product,
  stockData = [],
}: RegisterPatrimonyModalProps) {
  // Formulário principal
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(patrimonySchema),
    mode: "onChange",
  });

  // Estados do componente
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockProps | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [stock, setStock] = useState<StockProps[]>(stockData || []);

  // Atualiza o estado quando stockData muda
  useEffect(() => {
    setStock(stockData || []);
  }, [stockData]);

  // Adiciona novos itens ao estoque
  const onSubmit = async (data: FormData) => {
    if (!product) return;
    setLoading(true);

    try {
      const stockItems: StockProps[] = Array.from(
        { length: data.quantity },
        (_, index) => ({
          id_produto: product.id,
          numero_patrimonio: `PAT-${product.id}-${index + 1}-${Date.now()}`,
          nota_fiscal: data.nfNumber,
          valor_pago: data.value,
          status: "Disponível",
          observacoes: `Adicionado em ${new Date().toLocaleDateString()}`,
          id: 0,
          produto: product,
        })
      );

      const newStockItems = await Promise.all(
        stockItems.map((item) => createStock(item))
      );
      setStock((prevStock) => [...prevStock, ...newStockItems]);

      showSnackbar(
        `${data.quantity} itens adicionados ao estoque com sucesso!`,
        "success"
      );
      reset();
      setTimeout(() => setAddModalOpen(false), 500);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showSnackbar("Erro ao adicionar itens ao estoque.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Atualiza status do item (roubado/danificado)
  const handleUpdateStatus = async (status: "Roubado" | "Danificado") => {
    if (!selectedItem) return;
    setLoading(true);

    try {
      const updatedItem = await patchStock(selectedItem.id, {
        status,
        observacoes:
          selectedItem?.observacoes ||
          `Item ${status.toLowerCase()} em ${new Date().toLocaleDateString()}`,
      });

      setStock((prevStock) =>
        prevStock.map((item) =>
          item.id === selectedItem.id ? updatedItem : item
        )
      );

      showSnackbar(
        `Item indisponibilizado (${status.toLowerCase()}) com sucesso!`,
        "success"
      );
      setIncidentModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showSnackbar("Erro ao atualizar status do item", "error");
    } finally {
      setLoading(false);
    }
  };

  // Mostra feedback ao usuário
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Configuração das colunas da tabela
  const columns: GridColDef[] = [
    {
      field: "numero_patrimonio",
      headerName: "Nº Patrimônio",
      flex: 1,
      renderCell: (params) => (
        <strong style={{ fontFamily: "monospace" }}>{params.value}</strong>
      ),
    },
    { field: "nota_fiscal", headerName: "Nota Fiscal", flex: 1 },
    {
      field: "valor_pago",
      headerName: "Valor (R$)",
      flex: 1,
      type: "number",
      // valueFormatter: (params) => {
      //   return params.toLocaleString("pt-BR", {
      //     style: "currency",
      //     currency: "BRL",
      //   });
      // },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellClassName: (params) => `status-${params.value.toLowerCase()}`,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={() => {
            setSelectedItem(params.row);
            setIncidentModalOpen(true);
          }}
          disabled={params.row.status !== "Disponível"}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Indisponibilizar
        </Button>
      ),
    },
  ];

  // Estilo condicional para as linhas
  const getRowClassName = (params: GridRowParams) => {
    return `status-row-${params.row.status.toLowerCase()}`;
  };

  return (
    <>
      {/* Modal Principal */}
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{ bgcolor: "#f5f5f5", borderBottom: "1px solid #ddd" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Gerenciar Estoque - {product?.name}</span>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setAddModalOpen(true)}
              size="small"
            >
              Adicionar Itens
            </Button>
          </div>
        </DialogTitle>

        <DialogContent sx={{ paddingTop: 3 }}>
          {stock.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#666",
              }}
            >
              <p>Nenhum item registrado no estoque</p>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setAddModalOpen(true)}
                sx={{ mt: 2 }}
              >
                Adicionar Primeiro Item
              </Button>
            </div>
          ) : (
            <DataGrid
              rows={stock}
              columns={columns}
              getRowClassName={getRowClassName}
              autoHeight
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              sx={{
                "& .status-row-disponível": {
                  bgcolor: "#e8f5e9",
                },
                "& .status-row-roubado": {
                  bgcolor: "#ffebee",
                },
                "& .status-row-danificado": {
                  bgcolor: "#fff8e1",
                },
                "& .status-disponível": {
                  color: "#2e7d32",
                  fontWeight: "bold",
                },
                "& .status-roubado": {
                  color: "#d32f2f",
                  fontWeight: "bold",
                },
                "& .status-danificado": {
                  color: "#ff9800",
                  fontWeight: "bold",
                },
              }}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ padding: 2, borderTop: "1px solid #ddd" }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Adicionar Itens */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ bgcolor: "#f5f5f5", borderBottom: "1px solid #ddd" }}
        >
          Adicionar Itens ao Estoque
        </DialogTitle>
        <DialogContent sx={{ paddingTop: 3 }}>
          <Controller
            name="nfNumber"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Número da Nota Fiscal"
                fullWidth
                margin="normal"
                error={!!errors.nfNumber}
                helperText={errors.nfNumber?.message}
                variant="outlined"
                size="small"
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
                label="Valor Unitário (R$)"
                fullWidth
                margin="normal"
                type="number"
                error={!!errors.value}
                helperText={errors.value?.message}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: "R$",
                }}
              />
            )}
          />
          <Controller
            name="quantity"
            control={control}
            defaultValue={1}
            render={({ field }) => (
              <TextField
                {...field}
                label="Quantidade"
                fullWidth
                margin="normal"
                type="number"
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
                variant="outlined"
                size="small"
                inputProps={{
                  min: 1,
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ padding: 2, borderTop: "1px solid #ddd" }}>
          <Button
            onClick={() => setAddModalOpen(false)}
            variant="outlined"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Indisponibilização */}
      <Dialog
        open={incidentModalOpen}
        onClose={() => setIncidentModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ bgcolor: "#f5f5f5", borderBottom: "1px solid #ddd" }}
        >
          Indisponibilizar Patrimônio
        </DialogTitle>
        <DialogContent sx={{ paddingTop: 3 }}>
          <div style={{ marginBottom: 16 }}>
            <strong>Item:</strong> {selectedItem?.numero_patrimonio}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={() => handleUpdateStatus("Roubado")}
              disabled={loading}
              sx={{ height: 56 }}
            >
              Registrar Roubo
            </Button>

            <Button
              variant="contained"
              sx={{
                bgcolor: "#ff9800",
                color: "white",
                "&:hover": { bgcolor: "#f57c00" },
                height: 56,
              }}
              onClick={() => handleUpdateStatus("Danificado")}
              disabled={loading}
            >
              Registrar Danificação
            </Button>
          </div>

          <TextField
            label="Motivo/Detalhes"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={selectedItem?.observacoes || ""}
            onChange={(e) => {
              if (selectedItem) {
                setSelectedItem({
                  ...selectedItem,
                  observacoes: e.target.value,
                });
              }
            }}
            variant="outlined"
            placeholder="Descreva os detalhes da ocorrência..."
          />
        </DialogContent>
        <DialogActions sx={{ padding: 2, borderTop: "1px solid #ddd" }}>
          <Button
            onClick={() => setIncidentModalOpen(false)}
            variant="outlined"
            disabled={loading}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
