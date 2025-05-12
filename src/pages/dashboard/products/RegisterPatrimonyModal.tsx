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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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

interface PatrimonyItem {
  numero_patrimonio: string;
  editable: boolean;
}

export default function RegisterPatrimonyModal({
  open,
  onClose,
  product,
  stockData = [],
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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockProps | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [stock, setStock] = useState<StockProps[]>(stockData || []);
  const [generatedPatrimonies, setGeneratedPatrimonies] = useState<
    PatrimonyItem[]
  >([]);
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    setStock(stockData || []);
  }, [stockData]);

  function getNextPatrimonyNumber(stock: StockProps[] | undefined): number {
    if (!stock) return 1;

    const sequentials = stock
      .map((item) => {
        if (!item.numero_patrimonio) return 0;

        const match = item.numero_patrimonio.match(/^PAT-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num) => !isNaN(num));

    const maxSequential = Math.max(...sequentials, 0);
    return maxSequential + 1;
  }

  const generatePatrimonies = (data: FormData) => {
    if (!product) return;

    const startNumber = getNextPatrimonyNumber(product.stock);
    const newPatrimonies: PatrimonyItem[] = Array.from(
      { length: data.quantity },
      (_, index) => ({
        numero_patrimonio: `PAT-${startNumber + index}`,
        editable: false,
      })
    );

    setGeneratedPatrimonies(newPatrimonies);
    setFormData(data);
    setConfirmModalOpen(true);
  };

  const handleEditPatrimony = (index: number) => {
    const updatedPatrimonies = [...generatedPatrimonies];
    updatedPatrimonies[index].editable = !updatedPatrimonies[index].editable;
    setGeneratedPatrimonies(updatedPatrimonies);
  };

  const handlePatrimonyChange = (index: number, value: string) => {
    const updatedPatrimonies = [...generatedPatrimonies];
    updatedPatrimonies[index].numero_patrimonio = value;
    setGeneratedPatrimonies(updatedPatrimonies);
  };

  const confirmPatrimonies = async () => {
    if (!product || !formData) return;
    setLoading(true);

    try {
      const stockItems: StockProps[] = generatedPatrimonies.map((item) => ({
        id_produto: product.id,
        numero_patrimonio: item.numero_patrimonio,
        nota_fiscal: formData.nfNumber,
        valor_pago: formData.value,
        status: "Disponível",
        observacoes: `Adicionado em ${new Date().toLocaleDateString()}`,
        id: 0,
        produto: product,
      }));

      const newStockItems = await Promise.all(
        stockItems.map((item) => createStock(item))
      );
      setStock((prevStock) => [...prevStock, ...newStockItems]);

      showSnackbar(
        `${formData.quantity} itens adicionados ao estoque com sucesso!`,
        "success"
      );
      reset();
      setConfirmModalOpen(false);
      setAddModalOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      showSnackbar(
        `Erro ao adicionar itens ao estoque: ${errorMessage}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      showSnackbar(
        `Erro ao atualizar status do item: ${errorMessage}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

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
              style={{ textAlign: "center", padding: "40px 0", color: "#666" }}
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
                "& .status-row-disponível": { bgcolor: "#e8f5e9" },
                "& .status-row-roubado": { bgcolor: "#ffebee" },
                "& .status-row-danificado": { bgcolor: "#fff8e1" },
                "& .status-disponível": {
                  color: "#2e7d32",
                  fontWeight: "bold",
                },
                "& .status-roubado": { color: "#d32f2f", fontWeight: "bold" },
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
            onClick={handleSubmit(generatePatrimonies)}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Gerando..." : "Gerar Patrimônios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação de Patrimônios */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ bgcolor: "#f5f5f5", borderBottom: "1px solid #ddd" }}
        >
          Confirme os Números de Patrimônio
        </DialogTitle>
        <DialogContent sx={{ paddingTop: 3 }}>
          <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Item</TableCell>
                  <TableCell>Número de Patrimônio</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generatedPatrimonies.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {item.editable ? (
                        <TextField
                          value={item.numero_patrimonio}
                          onChange={(e) =>
                            handlePatrimonyChange(index, e.target.value)
                          }
                          size="small"
                          fullWidth
                        />
                      ) : (
                        <span style={{ fontFamily: "monospace" }}>
                          {item.numero_patrimonio}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditPatrimony(index)}
                      >
                        {item.editable ? "Confirmar" : "Editar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ marginBottom: 2 }}>
            Revise os números de patrimônio gerados. Você pode editar
            individualmente antes de confirmar a inserção no estoque.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ padding: 2, borderTop: "1px solid #ddd" }}>
          <Button
            onClick={() => setConfirmModalOpen(false)}
            variant="outlined"
            disabled={loading}
          >
            Voltar
          </Button>
          <Button
            onClick={confirmPatrimonies}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Confirmar Patrimônios"}
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
