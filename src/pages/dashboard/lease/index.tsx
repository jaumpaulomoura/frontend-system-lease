import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  Box,
  Button,
  Container,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Typography,
  Autocomplete,
  IconButton,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { InitialContext } from "@contexts/InitialContext";
import { LeaseProps } from "@interfaces/Lease";
import { createLease } from "@services/createLease";
import { deleteLease } from "@services/deleteLease";
import { getLeaseList } from "@services/getLeaseList";
import { patchLease } from "@services/patchLease";
import { getClientList } from "@services/getClientList";
import Layout from "@components/Layout";
import { StockProps } from "@interfaces/Stock";
import { ProductProps } from "@interfaces/Product";
import { getProductList } from "@services/getProductList";
import { getStocksList } from "@services/getStocksList";

interface ClientProps {
  id: number;
  name: string;
}

interface LeaseItemProps {
  id_produto: number;
  stocks: {
    id_stock: number;
    numero_patrimonio: string;
  }[];
  quantidade: number;
  periodo: "diario" | "semanal" | "mensal";
  valor_unitario: number;
}
interface LeaseRequestPayload {
  id_locacao: number;
  cliente_id: number;
  rua_locacao: string;
  numero_locacao: string;
  complemento_locacao?: string;
  bairro_locacao: string;
  cidade_locacao: string;
  estado_locacao: string;
  cep_locacao: string;
  data_inicio: string;
  data_prevista_devolucao: string;
  data_real_devolucao?: string;
  valor_total: number;
  status: string;
  observacoes?: string | null;
  leaseItems: Array<{
    id_patrimonio: number;
    valor_unit_diario: number;
    valor_unit_semanal: number;
    valor_unit_mensal: number;
    valor_unit_anual: number;
    valor_negociado_diario: number;
    valor_negociado_semanal: number;
    valor_negociado_mensal: number;
    valor_negociado_anual: number;
  }>;
}

export type FormData = {
  cliente_id: number;
  rua_locacao: string | null;
  numero_locacao: string | null;
  complemento_locacao?: string | null;
  bairro_locacao: string | null;
  cidade_locacao: string | null;
  estado_locacao: string | null;
  cep_locacao: string | null;
  data_inicio: string | null;
  data_prevista_devolucao: string | null;
  data_real_devolucao?: string | null;
  valor_total: number;
  status: string;
  observacoes?: string | null;
};

interface ProductWithStock extends ProductProps {
  availableStock: StockProps[];
  totalAvailable: number;
}

export default function LeasePage() {
  const { setLoading } = useContext(InitialContext);
  const [leases, setLeases] = useState<LeaseProps[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editLease, setEditLease] = useState<LeaseRequestPayload | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [filterIdLocacao, setFilterIdLocacao] = useState("");
  const [clients, setClients] = useState<ClientProps[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientProps | null>(
    null
  );
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [selectedLease, setselectedLease] = useState<ProductWithStock | null>(
    null
  );
  const [selectedStocks, setSelectedStocks] = useState<StockProps[]>([]);
  const [leaseItems, setLeaseItems] = useState<LeaseItemProps[]>([]);
  const [quantity, setQuantity] = useState(1);

  const [period, setPeriod] = useState<"diario" | "semanal" | "mensal">(
    "diario"
  );

  const form = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      cliente_id: 0,
      rua_locacao: "",
      numero_locacao: "",
      complemento_locacao: "",
      bairro_locacao: "",
      cidade_locacao: "",
      estado_locacao: "",
      cep_locacao: "",
      data_inicio: "",
      data_prevista_devolucao: "",
      data_real_devolucao: "",
      valor_total: 0,
      status: "Ativo",
      observacoes: "",
    },
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const clientData = await getClientList();
      setClients(clientData);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const fetchLeases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeaseList();
      setLeases(data);
    } catch (error) {
      console.error("Erro ao buscar locações:", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const fetchProductsWithStock = useCallback(async () => {
    setLoading(true);
    try {
      const productList = await getProductList();
      const stockList = await getStocksList();

      const productsWithStock = productList.map((product) => {
        const available = stockList.filter(
          (stock) =>
            stock.id_produto === product.id && stock.status === "Disponível"
        );
        return {
          ...product,
          availableStock: available,
          totalAvailable: available.length,
        };
      });

      setProducts(productsWithStock);
    } catch (error) {
      console.error("Erro ao buscar produtos com estoque:", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchClients();
    fetchLeases();
    fetchProductsWithStock();
  }, [fetchClients, fetchLeases, fetchProductsWithStock]);

  useEffect(() => {
    if (editLease) {
      form.reset({
        rua_locacao: editLease.rua_locacao,
        numero_locacao: editLease.numero_locacao,
        complemento_locacao: editLease.complemento_locacao || "",
        bairro_locacao: editLease.bairro_locacao,
        cidade_locacao: editLease.cidade_locacao,
        estado_locacao: editLease.estado_locacao,
        cep_locacao: editLease.cep_locacao,
        data_inicio: editLease.data_inicio.split("T")[0],
        data_prevista_devolucao:
          editLease.data_prevista_devolucao.split("T")[0],
        data_real_devolucao: editLease.data_real_devolucao
          ? editLease.data_real_devolucao.split("T")[0]
          : "",
        valor_total: editLease.valor_total || 0,
        status: editLease.status,
        observacoes: editLease.observacoes || "",
      });

      if (editLease.leaseItems && editLease.leaseItems.length > 0) {
        const formattedItems = editLease.leaseItems.map((item) => {
          const periodo =
            item.valor_negociado_diario > 0
              ? "diario"
              : item.valor_negociado_semanal > 0
              ? "semanal"
              : item.valor_negociado_mensal > 0
              ? "mensal"
              : "diario";

          const valor_unitario =
            periodo === "diario"
              ? item.valor_negociado_diario
              : periodo === "semanal"
              ? item.valor_negociado_semanal
              : item.valor_negociado_mensal;

          return {
            id_produto: item.id_produto || 0,
            stocks: [
              {
                id_stock: item.id_patrimonio,
                numero_patrimonio: item.numero_patrimonio || "",
              },
            ],
            quantidade: 1,
            periodo: periodo,
            valor_unitario: valor_unitario,
            valor_negociado_diario: item.valor_negociado_diario,
            valor_negociado_semanal: item.valor_negociado_semanal,
            valor_negociado_mensal: item.valor_negociado_mensal,
          };
        });

        setLeaseItems(formattedItems);
      } else {
        setLeaseItems([]);
      }
    }
  }, [editLease, form]);

  useEffect(() => {
    if (selectedLease) {
      setQuantity(1);
      setSelectedStocks(selectedLease.availableStock.slice(0, 1));
    }
  }, [selectedLease]);

  const handleDelete = async () => {
    if (deleteId) {
      setLoading(true);
      try {
        await deleteLease(deleteId.toString());
        await fetchLeases();
      } catch (error) {
        console.error("Erro ao excluir locação:", error);
      } finally {
        setDeleteId(null);
        setOpenDialog(false);
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString();
    } catch {
      return "";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleAddLease = () => {
    if (!selectedLease || selectedStocks.length === 0) return;

    const unitPrice = parseFloat(
      period === "diario"
        ? selectedLease.daily_value?.toString() || "0"
        : period === "semanal"
        ? selectedLease.weekly_value?.toString() || "0"
        : selectedLease.monthly_value?.toString() || "0"
    );

    const newItem = {
      id_produto: selectedLease.id,
      stocks: selectedStocks.map((stock) => ({
        id_stock: stock.id!,
        numero_patrimonio: stock.numero_patrimonio || "",
      })),
      quantidade: quantity,
      periodo: period,
      valor_unitario: unitPrice,
    };

    setLeaseItems([...leaseItems, newItem]);

    const newTotal = [...leaseItems, newItem].reduce(
      (total, item) => total + item.valor_unitario * item.quantidade,
      0
    );

    form.setValue("valor_total", parseFloat(newTotal.toFixed(2)));

    setselectedLease(null);
    setSelectedStocks([]);
    setQuantity(1);
  };

  const handleRemoveLease = (index: number) => {
    const newItems = [...leaseItems];
    newItems.splice(index, 1);
    setLeaseItems(newItems);
  };

  const handleCreateOrUpdate = async (data: FormData) => {
    setLoading(true);
    try {
      const ensureDateString = (
        dateString: string | null | undefined
      ): string => {
        if (!dateString) return new Date().toISOString();
        try {
          return new Date(dateString).toISOString();
        } catch {
          return new Date().toISOString();
        }
      };

      if (!data.data_inicio || !data.data_prevista_devolucao) {
        throw new Error(
          "Datas de início e previsão de devolução são obrigatórias"
        );
      }

      const payload: LeaseRequestPayload = {
        ...data,
        id_locacao: editLease?.id_locacao ?? 0,
        rua_locacao: data.rua_locacao || "",
        numero_locacao: data.numero_locacao || "",
        complemento_locacao: data.complemento_locacao ?? undefined,
        bairro_locacao: data.bairro_locacao || "",

        cidade_locacao: data.cidade_locacao || "",
        estado_locacao: data.estado_locacao?.toUpperCase() || "SP",
        cep_locacao: data.cep_locacao || "",
        data_inicio: ensureDateString(data.data_inicio),
        data_prevista_devolucao: ensureDateString(data.data_prevista_devolucao),
        data_real_devolucao: data.data_real_devolucao
          ? ensureDateString(data.data_real_devolucao)
          : undefined,
        valor_total: parseFloat(
          leaseItems
            .reduce(
              (total, item) => total + item.valor_unitario * item.quantidade,
              0
            )
            .toFixed(2)
        ),
        status: data.status || "Ativo",
        leaseItems: leaseItems.flatMap((item) =>
          item.stocks.map((stock) => ({
            id_patrimonio: stock.id_stock,
            valor_unit_diario:
              item.periodo === "diario" ? item.valor_unitario : 0,
            valor_unit_semanal:
              item.periodo === "semanal" ? item.valor_unitario : 0,
            valor_unit_mensal:
              item.periodo === "mensal" ? item.valor_unitario : 0,
            valor_unit_anual: 0,
            valor_negociado_diario:
              item.periodo === "diario" ? item.valor_unitario : 0,
            valor_negociado_semanal:
              item.periodo === "semanal" ? item.valor_unitario : 0,
            valor_negociado_mensal:
              item.periodo === "mensal" ? item.valor_unitario : 0,
            valor_negociado_anual: 0,
          }))
        ),
      };

      console.log("Payload final:", JSON.stringify(payload, null, 2));

      if (editLease?.id_locacao) {
        await patchLease(payload, editLease.id_locacao);
      } else {
        await createLease(payload);
      }

      await fetchLeases();
      setOpenForm(false);
      setEditLease(null);
      setLeaseItems([]);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar locação:", error);
      alert(error instanceof Error ? error.message : "Erro ao salvar locação");
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef<LeaseProps>[] = [
    { field: "id_locacao", headerName: "Nº Locação", width: 100 },
    { field: "cliente_id", headerName: "ID Cliente", width: 100 },
    {
      field: "data_inicio",
      headerName: "Data Início",
      width: 120,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "data_prevista_devolucao",
      headerName: "Previsão Devolução",
      width: 150,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "valor_total",
      headerName: "Valor Total",
      width: 120,
      valueFormatter: (params) => formatCurrency(params),
    },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          {/* Botão Editar - Corrigido para editar a locação */}
          <Button
            onClick={() => {
              const leaseToEdit = leases.find(
                (lease) => lease.id_locacao === params.row.id_locacao
              );
              console.log("leaseToEdit", leaseToEdit);
              if (leaseToEdit) {
                setEditLease(leaseToEdit);
                setOpenForm(true);
              }
            }}
          >
            <MdEdit color="blue" />
          </Button>

          {/* Botão Excluir */}
          <Button
            title="Excluir"
            onClick={() => {
              setDeleteId(params.row.id_locacao);
              setOpenDialog(true);
            }}
            sx={{ minWidth: "40px", padding: 0 }}
          >
            <MdDelete color="red" size={20} />
          </Button>
        </Box>
      ),
    },
  ];

  const filteredLeases = leases.filter((lease) => {
    const matchesClient = selectedClient
      ? lease.cliente_id === selectedClient.id
      : true;
    const matchesLocacao = lease.id_locacao
      .toString()
      .includes(filterIdLocacao);
    return matchesClient && matchesLocacao;
  });

  return (
    <Box sx={{ height: "100vh", backgroundColor: "#E0E0E0" }}>
      <Layout>
        <Container maxWidth="lg" sx={{ pt: 8, height: "calc(100vh - 64px)" }}>
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Typography variant="h4" sx={{ mb: 3 }}>
              Gestão de Locações
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                label="Filtrar por ID Locação"
                value={filterIdLocacao}
                onChange={(e) => setFilterIdLocacao(e.target.value)}
                size="small"
                sx={{ width: 200 }}
              />

              <Autocomplete
                options={clients}
                getOptionLabel={(option) => `${option.id} - ${option.name}`}
                value={selectedClient}
                onChange={(_, newValue) => setSelectedClient(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filtrar por Cliente"
                    size="small"
                    sx={{ width: 300 }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />

              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="contained"
                onClick={() => {
                  setEditLease(null);
                  setOpenForm(true);
                }}
                startIcon={<IoAddCircleOutline />}
              >
                Nova Locação
              </Button>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataGrid
                rows={filteredLeases}
                columns={columns}
                getRowId={(row) => row.id_locacao}
                disableRowSelectionOnClick
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[5, 10, 25]}
                sx={{
                  height: "100%",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                  },
                }}
              />
            </Box>
          </Box>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogContent>
              Tem certeza que deseja excluir esta Locação?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                Excluir
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openForm}
            onClose={() => {
              setOpenForm(false);
              setEditLease(null);
            }}
            maxWidth={false}
            fullWidth={true}
            sx={{
              "& .MuiDialog-paper": {
                maxHeight: "95vh",
                height: "95vh",
                width: "95vw",
                margin: 0,
                overflow: "hidden",
                maxWidth: "none",
              },
              "& .MuiDialog-container": {
                alignItems: "flex-start",
                paddingTop: "2vh",
              },
            }}
          >
            <form onSubmit={form.handleSubmit(handleCreateOrUpdate)}>
              <DialogTitle>
                {editLease
                  ? `Editar Locação #${editLease.id_locacao}`
                  : "Nova Locação"}
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ display: "flex", height: "95%" }}>
                  <Box
                    sx={{
                      width: "50%",
                      pr: 2,
                      overflowY: "auto",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    <Autocomplete
                      options={clients}
                      getOptionLabel={(option) =>
                        `${option.id} - ${option.name}`
                      }
                      value={
                        clients.find(
                          (c) => c.id === form.watch("cliente_id")
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        form.setValue("cliente_id", newValue?.id || 0)
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Cliente" required />
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                    />

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <TextField
                        {...form.register("rua_locacao")}
                        label="Rua"
                        size="small"
                        required
                      />
                      <TextField
                        {...form.register("numero_locacao")}
                        label="Número"
                        size="small"
                        required
                      />
                    </Box>

                    <TextField
                      {...form.register("complemento_locacao")}
                      label="Complemento"
                      size="small"
                      fullWidth
                      sx={{ mt: 2 }}
                    />

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <TextField
                        {...form.register("bairro_locacao")}
                        label="Bairro"
                        size="small"
                        required
                      />
                      <TextField
                        {...form.register("cidade_locacao")}
                        label="Cidade"
                        size="small"
                        required
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <TextField
                        {...form.register("estado_locacao")}
                        label="Estado"
                        size="small"
                        required
                      />
                      <TextField
                        {...form.register("cep_locacao")}
                        label="CEP"
                        size="small"
                        required
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <TextField
                        {...form.register("data_inicio")}
                        label="Data Início"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                      <TextField
                        {...form.register("data_prevista_devolucao")}
                        label="Previsão Devolução"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                      <TextField
                        {...form.register("data_real_devolucao")}
                        label="Devolução Real"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <TextField
                        {...form.register("valor_total", {
                          valueAsNumber: true,
                        })}
                        label="Valor Total"
                        type="number"
                        size="small"
                        inputProps={{ step: "0.01", readOnly: true }}
                        value={leaseItems.reduce(
                          (total, item) =>
                            total + item.valor_unitario * item.quantidade,
                          0
                        )}
                      />
                      <TextField
                        {...form.register("status")}
                        label="Status"
                        select
                        size="small"
                        required
                      >
                        <MenuItem value="Ativo">Ativo</MenuItem>
                        <MenuItem value="Finalizado">Finalizado</MenuItem>
                        <MenuItem value="Cancelado">Cancelado</MenuItem>
                      </TextField>
                    </Box>

                    <TextField
                      {...form.register("observacoes")}
                      label="Observações"
                      size="small"
                      multiline
                      rows={2}
                      fullWidth
                      sx={{ mt: 2 }}
                    />
                  </Box>

                  <Box sx={{ width: "50%", pl: 2, overflowY: "auto" }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Produtos da Locação
                    </Typography>

                    <Box
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        p: 2,
                        maxHeight: 300,
                        overflowY: "auto",
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Adicionar Produto
                      </Typography>

                      <Autocomplete
                        options={products.filter((p) => p.totalAvailable > 0)}
                        getOptionLabel={(option) =>
                          `${option.name} (${option.marca}) - ${option.totalAvailable} disponíveis`
                        }
                        value={selectedLease}
                        onChange={(_, newValue) => {
                          setselectedLease(newValue);
                          setSelectedStocks([]);
                          setQuantity(1);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Selecione o Produto"
                            size="small"
                            fullWidth
                          />
                        )}
                        sx={{ mb: 2 }}
                      />

                      {selectedLease && (
                        <>
                          <TextField
                            label="Quantidade"
                            type="number"
                            size="small"
                            fullWidth
                            value={quantity}
                            onChange={(e) => {
                              const newQuantity = Math.max(
                                1,
                                Math.min(
                                  parseInt(e.target.value) || 1,
                                  selectedLease.totalAvailable
                                )
                              );
                              setQuantity(newQuantity);
                              setSelectedStocks(
                                selectedLease.availableStock.slice(
                                  0,
                                  newQuantity
                                )
                              );
                            }}
                            inputProps={{
                              min: 1,
                              max: selectedLease.totalAvailable,
                            }}
                            sx={{ mb: 2 }}
                          />

                          <Autocomplete
                            multiple
                            options={selectedLease.availableStock}
                            getOptionLabel={(option) =>
                              `${option.numero_patrimonio}`
                            }
                            value={selectedStocks}
                            onChange={(_, newValue) => {
                              setSelectedStocks(newValue);
                              setQuantity(newValue.length);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Selecione os patrimônios"
                                size="small"
                                fullWidth
                                placeholder={`${selectedStocks.length} itens selecionados`}
                              />
                            )}
                            sx={{ mb: 2 }}
                          />

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <TextField
                              select
                              label="Período"
                              size="small"
                              value={period}
                              onChange={(e) =>
                                setPeriod(
                                  e.target.value as
                                    | "diario"
                                    | "semanal"
                                    | "mensal"
                                )
                              }
                            >
                              <MenuItem value="diario">
                                Diário (R$ {selectedLease.daily_value})
                              </MenuItem>
                              <MenuItem value="semanal">
                                Semanal (R$ {selectedLease.weekly_value})
                              </MenuItem>
                              <MenuItem value="mensal">
                                Mensal (R$ {selectedLease.monthly_value})
                              </MenuItem>
                            </TextField>

                            <TextField
                              label="Valor Unitário"
                              size="small"
                              value={
                                period === "diario"
                                  ? selectedLease.daily_value
                                  : period === "semanal"
                                  ? selectedLease.weekly_value
                                  : selectedLease.monthly_value
                              }
                              InputProps={{ readOnly: true }}
                            />
                          </Box>

                          <Button
                            variant="contained"
                            fullWidth
                            onClick={handleAddLease}
                            disabled={selectedStocks.length === 0}
                            startIcon={<IoAddCircleOutline />}
                          >
                            Adicionar à Locação
                          </Button>
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        mb: 3,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        p: 1,
                        height: 400,
                        width: "100%",
                      }}
                    >
                      {leaseItems.length > 0 ? (
                        <DataGrid
                          rows={leaseItems.flatMap((item, itemIndex) => {
                            const product = products.find(
                              (p) => p.id === item.id_produto
                            );
                            return item.stocks.map((stock, stockIndex) => ({
                              id: `${itemIndex}-${stockIndex}`,
                              produtoId: item.id_produto,
                              nome: product?.name || "Desconhecido",
                              patrimonio: stock.numero_patrimonio,
                              valorUnitario: formatCurrency(
                                item.valor_unitario
                              ),
                              periodo: item.periodo,
                              rawItem: item,
                            }));
                          })}
                          columns={[
                            {
                              field: "nome",
                              headerName: "Produto",
                              width: 150,
                            },
                            {
                              field: "patrimonio",
                              headerName: "Patrimônio",
                              width: 150,
                            },
                            {
                              field: "valorUnitario",
                              headerName: "Valor Unitário",
                              width: 120,
                            },
                            {
                              field: "periodo",
                              headerName: "Período",
                              width: 100,
                            },
                            {
                              field: "actions",
                              headerName: "Ações",
                              width: 80,
                              sortable: false,
                              renderCell: (params) => (
                                <IconButton
                                  onClick={() => {
                                    const itemIndex = leaseItems.findIndex(
                                      (item) =>
                                        item.id_produto === params.row.produtoId
                                    );
                                    handleRemoveLease(itemIndex);
                                  }}
                                  size="small"
                                >
                                  <MdDelete color="error" />
                                </IconButton>
                              ),
                            },
                          ]}
                          disableRowSelectionOnClick
                          autoHeight={false}
                          initialState={{
                            pagination: {
                              paginationModel: { pageSize: 10 },
                            },
                          }}
                          pageSizeOptions={[5, 10, 25]}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ p: 1 }}
                        >
                          Nenhum produto adicionado
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
              {/* <DialogActions sx={{ p: 2 }}>
                <Button
                  onClick={() => {
                    setOpenForm(false);
                    setEditLease(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {editLease ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogActions> */}
            </form>
            <DialogActions>
              <Button onClick={() => setOpenForm(false)} color="primary">
                Cancelar
              </Button>
              <Button
                onClick={form.handleSubmit(handleCreateOrUpdate)}
                color="primary"
              >
                {editLease ? "Salvar Alterações" : "Adicionar Produto"}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Layout>
    </Box>
  );
}
