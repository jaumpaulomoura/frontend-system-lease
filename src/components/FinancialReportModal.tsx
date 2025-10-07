  import React, { useState, useEffect, useMemo } from "react";
  import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    SelectChangeEvent,
  } from "@mui/material";
  import { LeaseProps } from "@interfaces/Lease";
  import { getLeaseList } from "@services/getLeaseList";

  interface FinancialReportModalProps {
    open: boolean;
    onClose: () => void;
    onGenerateReport: (filters: ReportFilters, leases: LeaseProps[]) => void;
  }

  export interface ReportFilters {
    startDate: string;
    endDate: string;
    clientId?: string;
    clientName?: string;
    paymentStatus: "all" | "paid" | "unpaid";
  }

  export default function FinancialReportModal({
    open,
    onClose,
    onGenerateReport,
  }: FinancialReportModalProps) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedClient, setSelectedClient] = useState<string>("all");
    const [paymentStatus, setPaymentStatus] = useState<string>("all");
    const [leases, setLeases] = useState<LeaseProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (open) {
        const fetchLeases = async () => {
          setLoading(true);
          try {
            const leasesData = await getLeaseList();
            // 🔥 Remove cancelados
            const validLeases = (leasesData || []).filter(
              (lease) => lease.status !== "Cancelado"
            );
            setLeases(validLeases);
          } catch (err) {
            setError("Erro ao carregar dados das locações");
            console.error(err);
          } finally {
            setLoading(false);
          }
        };

        fetchLeases();
      }
    }, [open]);

    console.log(leases);
    // Opções de clientes únicos
    const clientOptions = useMemo(() => {
      const uniqueClients = new Map<string, string>();

      leases.forEach((lease) => {
        if (lease.cliente?.name && lease.cliente?.id) {
          uniqueClients.set(lease.cliente.id.toString(), lease.cliente.name);
        }
      });

      return [
        { id: "all", name: "Todos os Clientes" },
        ...Array.from(uniqueClients.entries()).map(([id, name]) => ({
          id,
          name,
        })),
      ];
    }, [leases]);

    const handleGenerateReport = () => {
      if (!startDate || !endDate) {
        setError("Preencha as datas inicial e final");
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        setError("A data inicial deve ser anterior à data final");
        return;
      }

      const selectedClientData = clientOptions.find(
        (client) => client.id === selectedClient
      );

      const filters: ReportFilters = {
        startDate,
        endDate,
        clientId: selectedClient !== "all" ? selectedClient : undefined,
        clientName:
          selectedClient !== "all" ? selectedClientData?.name : undefined,
        paymentStatus: paymentStatus as "all" | "paid" | "unpaid",
      };

      // 🔥 filtra cancelados antes de enviar
      const filteredLeases = leases.filter(
        (lease) => lease.status !== "Cancelado"
      );

      onGenerateReport(filters, filteredLeases);
      handleClose();
    };

    const handleClose = () => {
      setStartDate("");
      setEndDate("");
      setSelectedClient("all");
      setPaymentStatus("all");
      setError(null);
      onClose();
    };

    const handleClientChange = (event: SelectChangeEvent) => {
      setSelectedClient(event.target.value);
    };

    const handlePaymentStatusChange = (event: SelectChangeEvent) => {
      setPaymentStatus(event.target.value);
    };

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            📊 Relatório Financeiro
          </Typography>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Carregando dados...</Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                {/* Período */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Período do Relatório
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Data Inicial"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Data Final"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </Grid>

                {/* Filtros */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Filtros (Opcionais)
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Cliente</InputLabel>
                    <Select
                      value={selectedClient}
                      label="Cliente"
                      onChange={handleClientChange}
                    >
                      {clientOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status de Pagamento</InputLabel>
                    <Select
                      value={paymentStatus}
                      label="Status de Pagamento"
                      onChange={handlePaymentStatusChange}
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      <MenuItem value="paid">Apenas Pagos</MenuItem>
                      <MenuItem value="unpaid">Apenas Não Pagos</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            disabled={loading || !startDate || !endDate}
          >
            Gerar Relatório PDF
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
