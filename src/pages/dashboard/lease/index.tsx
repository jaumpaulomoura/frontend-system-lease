/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TbTruckReturn } from "react-icons/tb";
import { useForm } from "react-hook-form";
import { IoAddCircleOutline } from "react-icons/io5";
import CancelIcon from "@mui/icons-material/Cancel";
import { MdClear, MdDelete } from "react-icons/md";
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
  Tooltip,
  ListItem,
  List,
  ListItemText,
  TableCell,
  TableRow,
  Table,
  TableContainer,
  TableBody,
  TableHead,
  Chip,
  Grid,
  CircularProgress,
  InputAdornment,
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
import { Snackbar, Alert } from "@mui/material";
import { StockProps } from "@interfaces/Stock";
import { ProductProps } from "@interfaces/Product";
import { getProductList } from "@services/getProductList";
import { getStocksList } from "@services/getStocksList";
import { patchStock } from "@services/patchStock";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FaFilePdf, FaPrint } from "react-icons/fa";
import LeaseContractPDF from "@components/LeaseContractPDF";
import { ErrorOutline } from "@mui/icons-material";
import { PiFilePdf } from "react-icons/pi";
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import { LeaseItemProps } from "@interfaces/LeaseItens";
import { pdf } from "@react-pdf/renderer";
import ReturnReceiptPDF from "@components/ReturnReceiptPDF";

declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable?: {
      finalY?: number;
    };
  }
}
interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => JsPDFWithAutoTable;
  lastAutoTable: {
    finalY: number;
  };
}

interface ClientProps {
  id: number;
  name: string;
}
type Periodo = "diario" | "semanal" | "mensal" | "anual";

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
  data_pagamento?: string;
  valor_total: number;
  valor_multa: number;
  valor_frete: number;
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
  data_pagamento?: string | null;
  valor_total: number;
  valor_multa: number;
  valor_frete: number;
  status: string;
  observacoes?: string | null;
};
type LeaseItem = LeaseRequestPayload["leaseItems"][0];
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
  const [devolucaoModalOpen, setDevolucaoModalOpen] = useState(false);
  const [leaseParaDevolver, setLeaseParaDevolver] = useState<LeaseProps | null>(
    null
  );
  const [dataDevolucao, setDataDevolucao] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dataPagamento, setDataPagamento] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [cancelamentoModalOpen, setCancelamentoModalOpen] = useState(false);
  const [leaseParaCancelar, setLeaseParaCancelar] = useState<LeaseProps | null>(
    null
  );
  const [valorMulta, setValorMulta] = useState<number>(0);
  const [valorNegociado, setValorNegociado] = useState<number>(0);

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [selectedProducts, setSelectedProducts] = useState<ProductProps[]>([]);

  const [period, setPeriod] = useState<Periodo>("diario");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
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
      data_pagamento: "",
      valor_total: 0,
      valor_multa: 0,
      valor_frete: 60,
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
            stock.produto.id === product.id && stock.status === "Disponível"
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
    if (selectedLease) {
      setQuantity(1);
      setSelectedStocks(selectedLease.availableStock.slice(0, 1));
    }
  }, [selectedLease]);

  const handleDelete = async () => {
    if (!deleteId) {
      setSnackbar({
        open: true,
        message: "Nenhuma locação selecionada para exclusão",
        severity: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      const userConfirmed = window.confirm(
        "Tem certeza que deseja excluir esta locação?"
      );
      if (!userConfirmed) return;

      await deleteLease(deleteId.toString());
      await fetchLeases();

      setSnackbar({
        open: true,
        message: "Locação excluída com sucesso!",
        severity: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao excluir locação";

      console.error("Erro ao excluir locação:", error);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setDeleteId(null);
      setOpenDialog(false);
      setLoading(false);
    }
  };

  const calcularDiferencaDias = (
    dataInicio: string,
    dataFim: string
  ): number => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    console.log(
      "[DEPURAÇÃO] Calculando diferença de dias entre:",
      `Início: ${inicio.toISOString().split("T")[0]}`,
      `Fim: ${fim.toISOString().split("T")[0]}`
    );

    const diff =
      Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) +
      1;

    console.log(`[DEPURAÇÃO] Total de dias calculado: ${diff}`);
    return diff;
  };

  const calcularValorLocacao = (valorDiario: number, dias: number): number => {
    console.log("[DEPURAÇÃO] Calculando valor locação:", {
      valorDiario,
      dias,
    });

    const valorCalculado = valorDiario * dias;

    console.log(
      `[DEPURAÇÃO] Valor calculado para ${dias} dias:`,
      valorCalculado
    );

    return valorCalculado;
  };

  const handleAddLease = () => {
    console.group("[DEPURAÇÃO] Iniciando handleAddLease");

    const dataInicio = form.watch("data_inicio");
    const dataFim = form.watch("data_prevista_devolucao");

    if (
      !selectedLease ||
      selectedStocks.length === 0 ||
      !dataInicio ||
      !dataFim
    ) {
      console.error("[DEPURAÇÃO] Dados faltando:", {
        selectedLease,
        selectedStocks,
        dataInicio,
        dataFim,
      });
      console.groupEnd();
      return;
    }

    try {
      new Date(dataInicio);
      new Date(dataFim);
    } catch (error) {
      console.error("[DEPURAÇÃO] Datas inválidas:", error);
      setSnackbar({
        open: true,
        message: "Datas inválidas. Verifique os valores informados.",
        severity: "error",
      });
      console.groupEnd();
      return;
    }

    const dias = calcularDiferencaDias(dataInicio, dataFim);

    console.log("[DEPURAÇÃO] Dados selecionados:", {
      produto: selectedLease.name,
      patrimonio: selectedStocks.map((s) => s.numero_patrimonio),
      period,
      dataInicio,
      dataFim,
      dias,
      valorNegociado,
    });

    const valorTotal = calcularValorLocacao(valorNegociado, dias);

    console.log("[DEPURAÇÃO] Criando novos itens...");
    const newItems = selectedStocks.map((stock) => {
      const valores = {
        valor_unit_diario: period === "diario" ? valorNegociado : 0,
        valor_unit_semanal: period === "semanal" ? valorNegociado : 0,
        valor_unit_mensal: period === "mensal" ? valorNegociado : 0,
        valor_unit_anual: period === "anual" ? valorNegociado : 0,
        valor_negociado_diario: period === "diario" ? valorTotal : 0,
        valor_negociado_semanal: period === "semanal" ? valorTotal : 0,
        valor_negociado_mensal: period === "mensal" ? valorTotal : 0,
        valor_negociado_anual: period === "anual" ? valorTotal : 0,
      };

      console.log(
        `[DEPURAÇÃO] Novo item para patrimônio ${stock.numero_patrimonio}:`,
        valores
      );

      return {
        id_item_locacao: 0,
        id_locacao: 0,
        id_patrimonio: stock.id,
        ...valores,
        periodo: period,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patrimonio: {
          ...stock,
          produto: {
            id: selectedLease.id,
            name: selectedLease.name,
            description: selectedLease.description || "",
            active: true,
            daily_value: selectedLease.daily_value || 0,
            weekly_value: selectedLease.weekly_value || 0,
            monthly_value: selectedLease.monthly_value || 0,
            annual_value: selectedLease.annual_value || 0,
          },
          status: "Alugado",
        },
      };
    });

    console.log("[DEPURAÇÃO] Itens a serem adicionados:", newItems);
    setLeaseItems([...leaseItems, ...newItems]);

    console.log("[DEPURAÇÃO] Resetando seleção...");
    setselectedLease(null);
    setSelectedStocks([]);
    setQuantity(1);
    setValorNegociado(0);

    console.groupEnd();
  };

  useEffect(() => {
    console.group("[DEPURAÇÃO] Atualizando valor total");

    const dataInicio = form.watch("data_inicio");
    const dataFim = form.watch("data_prevista_devolucao");

    if (dataInicio && dataFim && leaseItems.length > 0) {
      console.log("[DEPURAÇÃO] Itens atuais na locação:", leaseItems);

      const novoTotal = leaseItems.reduce((total, item) => {
        const valor =
          item.periodo === "diario"
            ? item.valor_negociado_diario
            : item.periodo === "semanal"
            ? item.valor_negociado_semanal
            : item.periodo === "mensal"
            ? item.valor_negociado_mensal
            : item.valor_negociado_anual;

        console.log(
          `[DEPURAÇÃO] Item ${item.id_patrimonio} (${item.periodo}):`,
          {
            valorNegociado: valor,
            patrimonio: item.patrimonio.numero_patrimonio,
          }
        );

        return total + (Number(valor) || 0);
      }, 0);

      console.log("[DEPURAÇÃO] Novo valor total calculado:", novoTotal);
      form.setValue("valor_total", Number(novoTotal.toFixed(2)));
    } else {
      console.log("[DEPURAÇÃO] Condições não atendidas para cálculo do total");
    }

    console.groupEnd();
  }, [
    leaseItems,
    form.watch("data_inicio"),
    form.watch("data_prevista_devolucao"),
    period,
  ]);
  const handleRemoveLease = (index: number) => {
    const newItems = [...leaseItems];
    newItems.splice(index, 1);
    setLeaseItems(newItems);
  };

  const handleCreateOrUpdate = async (data: FormData) => {
    setLoading(true);
    try {
      if (leaseItems.length === 0) {
        throw new Error("Adicione pelo menos um item à locação");
      }

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
        data_pagamento: data.data_pagamento
          ? ensureDateString(data.data_pagamento)
          : undefined,
        valor_total: Number(
          leaseItems
            .reduce((total, item) => {
              const valor =
                item.periodo === "diario"
                  ? Number(item.valor_negociado_diario) || 0
                  : item.periodo === "semanal"
                  ? Number(item.valor_negociado_semanal) || 0
                  : Number(item.valor_negociado_mensal) || 0;
              return total + valor;
            }, 0)
            .toFixed(2)
        ),
        valor_multa: 0,
        valor_frete: data.valor_frete,
        status: data.status || "Ativo",
        leaseItems: leaseItems.map((item) => {
          const patrimonioId = item.patrimonio?.id || 0;

          if (!patrimonioId) {
            console.error("Invalid lease item:", item);
            throw new Error("Item inválido: ID do patrimônio não encontrado");
          }

          return {
            id_patrimonio: patrimonioId,
            valor_unit_diario: Number(item.valor_negociado_diario) || 0,
            valor_unit_semanal: Number(item.valor_negociado_semanal) || 0,
            valor_unit_mensal: Number(item.valor_negociado_mensal) || 0,
            valor_unit_anual: 0,
            valor_negociado_diario: Number(item.valor_negociado_diario) || 0,
            valor_negociado_semanal: Number(item.valor_negociado_semanal) || 0,
            valor_negociado_mensal: Number(item.valor_negociado_mensal) || 0,
            valor_negociado_anual: 0,
          };
        }),
      };

      console.log("Payload final:", JSON.stringify(payload, null, 2));

      let response;
      if (editLease?.id_locacao) {
        response = await patchLease(payload, editLease.id_locacao);
      } else {
        response = await createLease(payload);

        await Promise.all(
          leaseItems.flatMap((item) => {
            if (!item.patrimonio?.id) {
              console.error("Item sem patrimônio válido:", item);
              return [];
            }

            return patchStock(item.patrimonio.id, { status: "Alugado" }).catch(
              (error) => {
                console.error(
                  `Falha ao atualizar patrimônio ${item.patrimonio.id}:`,
                  error
                );
                return null;
              }
            );
          })
        );
      }

      await fetchLeases();
      setOpenForm(false);
      setEditLease(null);
      setLeaseItems([]);
      form.reset();

      setSnackbar({
        open: true,
        message: "Locação salva com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao salvar locação:", error);

      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Erro ao salvar locação",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const formatDateDatagrid = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const day = date.getUTCDate().toString().padStart(2, "0");
      const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
      const year = date.getUTCFullYear();

      return `${day}/${month}/${year}`;
    } catch {
      return "";
    }
  };
  const handleOpenDevolucaoModal = (lease: LeaseProps) => {
    setLeaseParaDevolver(lease);
    setDevolucaoModalOpen(true);
  };

  const handleCloseDevolucaoModal = () => {
    setDevolucaoModalOpen(false);
    setLeaseParaDevolver(null);
    setDataDevolucao(new Date().toISOString().split("T")[0]);
    setDataPagamento(new Date().toISOString().split("T")[0]);
    setValorMulta(0);
  };

  const handleConfirmarDevolucao = async (imprimirComprovante = false) => {
    if (!leaseParaDevolver) {
      setSnackbar({
        open: true,
        message: "Nenhuma locação selecionada para devolução",
        severity: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        leaseParaDevolver.leaseItems.map((item: LeaseItem) =>
          patchStock(item.id_patrimonio, { status: "Disponível" })
        )
      );

      await patchLease(
        {
          id_locacao: leaseParaDevolver.id_locacao,
          data_real_devolucao: new Date(dataDevolucao).toISOString(),
          data_pagamento: new Date(dataPagamento).toISOString(),
          valor_multa: valorMulta,
          status: "Finalizado",
        },
        leaseParaDevolver.id_locacao
      );

      await fetchLeases();

      handleCloseDevolucaoModal();
      setValorMulta(0);

      setSnackbar({
        open: true,
        message:
          "Devolução realizada com sucesso!" +
          (imprimirComprovante ? " Gerando comprovante..." : ""),
        severity: "success",
      });

      if (imprimirComprovante) {
        const pdfWindow = window.open("", "_blank");
        pdfWindow?.document.write(
          "<div style='text-align:center;margin-top:200px'><h3>Gerando comprovante...</h3></div>"
        );

        const pdfBlob = await pdf(
          <ReturnReceiptPDF
            lease={leaseParaDevolver}
            devolutionData={{
              dataDevolucao,
              valorMulta,
            }}
          />
        ).toBlob();

        const pdfUrl = URL.createObjectURL(pdfBlob);
        pdfWindow?.location.replace(pdfUrl);
      }
    } catch (error) {
      console.error("Erro ao realizar devolução:", error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Erro ao realizar devolução",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleOpenCancelamentoModal = (lease: LeaseProps) => {
    setLeaseParaCancelar(lease);
    setCancelamentoModalOpen(true);
  };

  const handleCloseCancelamentoModal = () => {
    setCancelamentoModalOpen(false);
    setLeaseParaCancelar(null);
  };

  const handleConfirmarCancelamento = async () => {
    if (!leaseParaCancelar) {
      setSnackbar({
        open: true,
        message: "Nenhuma locação selecionada para cancelamento",
        severity: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        leaseParaCancelar.leaseItems.map((item: LeaseItem) =>
          patchStock(item.id_patrimonio, { status: "Disponível" })
        )
      );

      await patchLease(
        {
          id_locacao: leaseParaCancelar.id_locacao,
          status: "Cancelado",
          data_real_devolucao: new Date().toISOString(),
        },
        leaseParaCancelar.id_locacao
      );

      await fetchLeases();

      setSnackbar({
        open: true,
        message: "Locação cancelada com sucesso!",
        severity: "success",
      });
      handleCloseCancelamentoModal();
    } catch (error) {
      console.error("Erro ao cancelar locação:", error);
      setSnackbar({
        open: true,
        message: `Erro ao cancelar locação: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  console.log("=== DEBUG LEASE DATA ===");
  console.log("Número de leases:", leases.length);
  if (leases.length > 0) {
    console.log("Primeiro lease:", leases[0]);
    console.log(
      "Estrutura completa do primeiro lease:",
      JSON.parse(JSON.stringify(leases[0]))
    );
    console.log("Cliente existe?", "cliente" in leases[0]);
    console.log("cliente_id value:", leases[0].cliente_id);
    console.log("cliente object:", leases[0].cliente);
  }
  const columns: GridColDef<LeaseProps>[] = [
    { field: "id_locacao", headerName: "Nº Locação", width: 100 },
    {
      field: "cliente",
      headerName: "Cliente",
      width: 120,
      valueGetter: (params: any) => {
        if (!params || !params.row) return "Sem dados";

        const clienteName = params.row.cliente?.name;
        const clienteId = params.row.cliente_id;

        return clienteName || `ID: ${clienteId ?? "Não especificado"}`;
      },
      renderCell: (params: any) => {
        const clienteName = params.row.cliente?.name;
        const clienteId = params.row.cliente_id;

        return (
          <div>
            <div>{clienteName || `ID: ${clienteId ?? "N/E"}`}</div>

            {clienteName && clienteId && (
              <div style={{ fontSize: "0.75rem", color: "#666" }}>
                ID: {clienteId}
              </div>
            )}
          </div>
        );
      },
    },

    {
      field: "data_inicio",
      headerName: "Data Início",
      width: 120,
      valueFormatter: (params) => formatDateDatagrid(params),
    },
    {
      field: "data_prevista_devolucao",
      headerName: "Previsão Devolução",
      width: 150,
      valueFormatter: (params) => formatDateDatagrid(params),
    },
    {
      field: "data_pagamento",
      headerName: "Pagamento",
      width: 180,
      valueFormatter: (params) => {
        if (!params) return "❌ Não pago";

        const dataFormatada = new Date(params).toLocaleDateString("pt-BR");
        return `✅ Pago em ${dataFormatada}`;
      },
    },

    {
      field: "valor_total",
      headerName: "Valor Total",
      width: 120,
      valueFormatter: (params) => formatCurrency(params),
    },
    {
      field: "valor_multa",
      headerName: "Valor Multa",
      width: 120,
      valueFormatter: (params) => formatCurrency(params),
    },
    {
      field: "valor_frete",
      headerName: "Valor Frete",
      width: 120,
      valueFormatter: (params) => formatCurrency(params),
    },
    { field: "status", headerName: "Status", width: 100 },

    {
      field: "devolucao",
      headerName: "",
      width: 130,
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          sx={{
            gap: 0.055,
            "& .MuiButton-root": {
              padding: "4px 8px",
              minWidth: "auto",
            },
            "& .MuiIconButton-root": {
              padding: "4px",
              marginLeft: "-6px",
            },
          }}
        >
          {/* Botão "Devolvido" (mantido como está) */}
          <Tooltip
            title={
              params.row.status === "Finalizado" ||
              params.row.status === "Cancelado"
                ? "Locação já finalizada/cancelada"
                : "Registrar devolução"
            }
          >
            <span>
              <Button
                variant="outlined"
                color={
                  params.row.status === "Finalizado" ||
                  params.row.status === "Cancelado"
                    ? "inherit"
                    : "secondary"
                }
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDevolucaoModal(params.row);
                }}
                disabled={
                  params.row.status === "Finalizado" ||
                  params.row.status === "Cancelado"
                }
                sx={{
                  textTransform: "none",
                  minWidth: "auto",
                  "&.Mui-disabled": {
                    borderColor: "transparent",
                    color: "text.disabled",
                  },
                }}
                startIcon={<TbTruckReturn size={16} />}
              >
                {params.row.status === "Finalizado" ? "Devolvido" : "Devolver"}
              </Button>
            </span>
          </Tooltip>

          {params.row.status === "Finalizado" && (
            <PDFDownloadLink
              document={
                <ReturnReceiptPDF
                  lease={params.row}
                  devolutionData={{
                    dataDevolucao:
                      params.row.data_real_devolucao ||
                      new Date().toISOString(),
                    valorMulta: params.row.valor_multa || 0,
                  }}
                />
              }
              fileName={`comprovante-devolucao-${params.row.id_locacao}.pdf`}
            >
              {({ loading }) => (
                <Tooltip title="Emitir comprovante de devolução">
                  <IconButton
                    size="small"
                    disabled={loading}
                    sx={{
                      p: 0.5,
                      color: "primary.main",
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                    }}
                  >
                    {loading ? <CircularProgress size={20} /> : <FaPrint />}
                  </IconButton>
                </Tooltip>
              )}
            </PDFDownloadLink>
          )}
        </Box>
      ),
    },
    {
      field: "cancelamento",
      headerName: "",
      width: 110,
      renderCell: (params) => (
        <Tooltip
          title={
            params.row.status !== "Ativo"
              ? "Somente locações ativas podem ser canceladas"
              : "Cancelar locação"
          }
        >
          <span>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                handleOpenCancelamentoModal(params.row);
              }}
              disabled={params.row.status !== "Ativo"}
              sx={{
                textTransform: "none",
                "&.Mui-disabled": {
                  borderColor: "transparent",
                  color: "text.disabled",
                },
              }}
              startIcon={<CancelIcon />}
            >
              Cancelar
            </Button>
          </span>
        </Tooltip>
      ),
    },

    {
      field: "itens_patrimonio",
      headerName: "Itens/Patrimônios",
      width: 100,
      renderCell: (params) => {
        const [open, setOpen] = useState(false);
        const items = params.row.leaseItems || [];
        const clientName = params.row.cliente?.name || "Cliente não informado";

        return (
          <>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              variant="outlined"
              size="small"
              sx={{ textTransform: "none" }}
            >
              {items.length} {items.length === 1 ? "item" : "itens"}
            </Button>

            {items.length > 0 && (
              <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="md"
                fullWidth
              >
                <DialogTitle
                  sx={{ bgcolor: "primary.main", color: "white", py: 2 }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <span>Detalhes da Locação #{params.row.id_locacao}</span>
                    <Chip
                      label={params.row.status}
                      color={
                        params.row.status === "Ativo"
                          ? "success"
                          : params.row.status === "Finalizado"
                          ? "primary"
                          : "error"
                      }
                    />
                  </Box>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Cliente: {clientName}
                  </Typography>
                </DialogTitle>

                <DialogContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Informações da Locação
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4}>
                        <Typography>
                          <strong>Data Início:</strong>{" "}
                          {formatDate(params.row.data_inicio)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography>
                          <strong>Previsão Devolução:</strong>{" "}
                          {formatDate(params.row.data_prevista_devolucao)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography>
                          <strong>Valor Total:</strong>{" "}
                          {formatCurrency(Number(params.row.valor_total))}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Itens Locados
                  </Typography>
                  <TableContainer>
                    <Table size="small" sx={{ border: "1px solid #e0e0e0" }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Produto
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Patrimônio
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }} align="right">
                            Valor Diário
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }} align="right">
                            Valor Semanal
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }} align="right">
                            Valor Mensal
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item: LeaseItemProps, index: number) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box>
                                <Typography fontWeight="medium">
                                  {item.patrimonio.produto.name}{" "}
                                  {/* Corrigido de stocks para patrimonio */}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {item.patrimonio.produto.description}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {item.patrimonio.numero_patrimonio}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(
                                Number(item.valor_negociado_diario)
                              )}
                              <Typography variant="body2" color="textSecondary">
                                (Original:{" "}
                                {formatCurrency(
                                  Number(item.patrimonio.produto.daily_value)
                                )}
                                )
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(
                                Number(item.valor_negociado_semanal)
                              )}
                              <Typography variant="body2" color="textSecondary">
                                (Original:{" "}
                                {formatCurrency(
                                  Number(item.patrimonio.produto.weekly_value)
                                )}
                                )
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(
                                Number(item.valor_negociado_mensal)
                              )}
                              <Typography variant="body2" color="textSecondary">
                                (Original:{" "}
                                {formatCurrency(
                                  Number(item.patrimonio.produto.monthly_value)
                                )}
                                )
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.patrimonio.status}
                                size="small"
                                color={
                                  item.patrimonio.status === "Disponível"
                                    ? "success"
                                    : item.patrimonio.status === "Alocado"
                                    ? "warning"
                                    : "error"
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                  <Button
                    onClick={() => setOpen(false)}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Fechar
                  </Button>
                </DialogActions>
              </Dialog>
            )}
          </>
        );
      },
    },
    {
      field: "imprimir",
      headerName: "Contrato",
      width: 120,
      renderCell: (params) => {
        return (
          <PDFDownloadLink
            document={<LeaseContractPDF lease={params.row} />}
            fileName={`contrato-locacao-${
              params.row.id_locacao || "sem-id"
            }.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading, error }) => {
              return (
                <Tooltip
                  title={error ? "Erro ao gerar PDF" : "Gerar contrato em PDF"}
                  arrow
                >
                  <span>
                    <Button
                      variant="outlined"
                      color={error ? "error" : "primary"}
                      size="small"
                      startIcon={error ? <ErrorOutline /> : <FaFilePdf />}
                      disabled={loading}
                      onClick={() => {
                        console.log(
                          "[PDF] Botão clicado para locação:",
                          params.row.id_locacao
                        );
                      }}
                      sx={{
                        minWidth: 50,
                        "& .MuiButton-startIcon": {
                          mr: 0.5,
                        },
                        "&.Mui-disabled": {
                          opacity: 0.7,
                          borderColor: "transparent",
                        },
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={14} sx={{ mr: 1 }} />
                          Gerando...
                        </>
                      ) : error ? (
                        "Erro"
                      ) : (
                        ""
                      )}
                    </Button>
                  </span>
                </Tooltip>
              );
            }}
          </PDFDownloadLink>
        );
      },
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
    },
  ];
  const [diasLocacao, setDiasLocacao] = useState(0);

  const calcularDias = () => {
    const inicio = form.watch("data_inicio");
    const devolucao = form.watch("data_prevista_devolucao");

    if (inicio && devolucao) {
      // Convertendo as strings para Date e depois para timestamp
      const inicioDate = new Date(inicio).getTime();
      const devolucaoDate = new Date(devolucao).getTime();

      // Verificando se as conversões foram bem sucedidas
      if (!isNaN(inicioDate) && !isNaN(devolucaoDate)) {
        const diffTime = devolucaoDate - inicioDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDiasLocacao(diffDays);
        return;
      }
    }
    setDiasLocacao(0);
  };
  const filteredLeases = useMemo(() => {
    return leases.filter((lease) => {
      const matchesId = filterIdLocacao
        ? lease.id_locacao.toString().includes(filterIdLocacao)
        : true;

      const matchesClient = selectedClient
        ? lease.cliente_id === selectedClient.id
        : true;

      const matchesStatus = filterStatus ? lease.status === filterStatus : true;

      const leaseDate = new Date(lease.data_inicio);
      const matchesDateStart = dateRange.start
        ? leaseDate >= new Date(dateRange.start)
        : true;
      const matchesDateEnd = dateRange.end
        ? leaseDate <= new Date(dateRange.end)
        : true;

      const matchesProducts =
        selectedProducts.length > 0
          ? lease.leaseItems?.some((item) =>
              selectedProducts.some(
                (prod) => item.patrimonio?.produto?.id === prod.id
              )
            )
          : true;

      return (
        matchesId &&
        matchesClient &&
        matchesStatus &&
        matchesDateStart &&
        matchesDateEnd &&
        matchesProducts
      );
    });
  }, [
    leases,
    filterIdLocacao,
    selectedClient,
    filterStatus,
    dateRange,
    selectedProducts,
  ]);
  const generateFilteredLeasesPDF = () => {
    const doc = new jsPDF() as JsPDFWithAutoTable;

    doc.setProperties({
      title: `Relatório de Locações - ${new Date().toLocaleDateString(
        "pt-BR"
      )}`,
      subject: "Relatório de locações filtradas",
      author: "Sistema de Gestão",
      keywords: "locações, relatório, pdf",
      creator: "Sistema de Gestão",
    });

    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("Relatório de Locações", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Emitido em: ${new Date().toLocaleDateString(
        "pt-BR"
      )} às ${new Date().toLocaleTimeString("pt-BR")}`,
      14,
      25
    );

    // let filtersText = "Filtros aplicados: ";
    // const activeFilters = [];

    // if (filterIdLocacao) activeFilters.push(`ID: ${filterIdLocacao}`);
    // if (selectedClient) activeFilters.push(`Cliente: ${selectedClient.name}`);
    // if (filterStatus) activeFilters.push(`Status: ${filterStatus}`);
    // if (dateRange.start || dateRange.end) {
    //   activeFilters.push(
    //     `Período: ${dateRange.start ? formatDate(dateRange.start) : ""} a ${
    //       dateRange.end ? formatDate(dateRange.end) : ""
    //     }`
    //   );
    // }
    // if (selectedProducts.length > 0) {
    //   activeFilters.push(
    //     `Produtos: ${selectedProducts.map((p) => p.name).join(", ")}`
    //   );
    // }

    // filtersText +=
    //   activeFilters.length > 0
    //     ? activeFilters.join(" | ")
    //     : "Nenhum filtro aplicado";

    doc.setFontSize(8);
    // doc.text(filtersText, 14, 35, { maxWidth: 180 });

    doc.setFontSize(10);
    // doc.text(`Total de locações: ${filteredLeases.length}`, 14, 45);
    // doc.text(
    //   `Valor total: ${formatCurrency(
    //     filteredLeases.reduce((sum, lease) => sum + lease.valor_total, 0)
    //   )}`,
    //   14,
    //   55
    // );

    autoTable(doc, {
      startY: 65,
      // head: [["ID", "Cliente", "Início", "Término", "Valor", "Status"]],
      // body: filteredLeases.map((lease) => [
      //   lease.id_locacao,
      //   lease.cliente?.name || "Não informado",
      //   formatDate(lease.data_inicio),
      //   formatDate(lease.data_prevista_devolucao),
      //   formatCurrency(lease.valor_total),
      //   lease.status,
      // ]),
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
      },
    });

    filteredLeases.forEach((lease, index) => {
      if (index > 0) {
        doc.addPage();
      }

      let y = 20;

      doc.setFontSize(14);
      doc.text(`Locação #${lease.id_locacao}`, 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.text(`Cliente: ${lease.cliente?.name || "Não informado"}`, 14, y);
      y += 7;
      doc.text(
        `Endereço: ${[
          lease.rua_locacao,
          lease.numero_locacao,
          lease.complemento_locacao,
          lease.bairro_locacao,
          lease.cidade_locacao,
          lease.estado_locacao,
        ]
          .filter(Boolean)
          .join(", ")}`,
        14,
        y
      );
      y += 7;
      doc.text(
        `Período: ${formatDate(lease.data_inicio)} até ${formatDate(
          lease.data_prevista_devolucao
        )}`,
        14,
        y
      );
      y += 7;
      doc.text(`Valor Total: ${formatCurrency(lease.valor_total)}`, 14, y);
      doc.text(`Valor Multa: ${formatCurrency(lease.valor_multa)}`, 14, y + 7);
      doc.text(`Valor Frete: ${formatCurrency(lease.valor_frete)}`, 14, y + 7);
      y += 14;

      doc.setFontSize(12);
      doc.text("Itens Alugados:", 14, y);
      y += 7;

      if (lease.leaseItems?.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [["Produto", "Patrimônio", "Valor Unitário", "Período"]],
          body: lease.leaseItems.map((item) => [
            item.patrimonio?.produto?.name || "-",
            item.patrimonio?.numero_patrimonio || "-",
            formatCurrency(
              item.periodo === "diario"
                ? item.valor_negociado_diario
                : item.periodo === "semanal"
                ? item.valor_negociado_semanal
                : item.valor_negociado_mensal
            ),
            item.periodo === "diario"
              ? "Diário"
              : item.periodo === "semanal"
              ? "Semanal"
              : item.periodo === "mensal"
              ? "Mensal"
              : "-",
          ]),
          headStyles: {
            fillColor: [51, 51, 51],
            textColor: 255,
          },
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
        });
        y = doc.lastAutoTable.finalY + 5;
      } else {
        doc.text("Nenhum item registrado", 20, y);
        y += 7;
      }

      if (lease.observacoes) {
        doc.text(`Observações: ${lease.observacoes}`, 14, y);
      }
    });

    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Sistema de Gestão - ${new Date().getFullYear()}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`relatorio_locacoes_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const formatCurrency = (
    value: number | string | null | undefined
  ): string => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  };
  const clearAllFilters = () => {
    setFilterIdLocacao("");
    setSelectedClient(null);
    setFilterStatus("");
    setDateRange({ start: "", end: "" });
    setSelectedProducts([]);
  };
  const estadosBrasileiros = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" },
  ];
  const capitalizeWords = (str: string) =>
    str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
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
              padding: 0,
              height: "calc(100vh - 64px)",
            }}
          >
            {/* Filtro e Botões */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 1,
                padding: 0,
                marginTop: "5px",
              }}
            >
              {/* Filtro por ID */}
              <TextField
                label="Nº Locação"
                size="small"
                sx={{ width: 120 }}
                value={filterIdLocacao}
                onChange={(e) => setFilterIdLocacao(e.target.value)}
              />

              {/* Filtro por Cliente */}
              <Autocomplete
                options={clients}
                getOptionLabel={(option) => `${option.id} - ${option.name}`}
                value={selectedClient}
                onChange={(_, newValue) => setSelectedClient(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cliente"
                    size="small"
                    sx={{ width: 180 }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                size="small"
              />

              {/* Filtro por Status */}
              <TextField
                select
                label="Status"
                size="small"
                sx={{ width: 120 }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Ativo">Ativo</MenuItem>
                <MenuItem value="Finalizado">Finalizado</MenuItem>
              </TextField>

              {/* Filtro por Data */}

              <TextField
                label="Início"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ width: 135 }}
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({
                    ...dateRange,
                    start: e.target.value,
                  })
                }
              />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                a
              </Typography>
              <TextField
                label="Fim"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ width: 135 }}
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />

              {/* Botão Limpar */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<MdClear />}
                onClick={clearAllFilters}
                disabled={
                  !filterIdLocacao &&
                  !selectedClient &&
                  !filterStatus &&
                  !dateRange.start &&
                  !dateRange.end
                }
                sx={{ height: 40 }}
              >
                Limpar
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                marginTop: "15px",
              }}
            >
              {/* <Typography variant="h4">Gestão de Locações</Typography> */}

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
              <Button
                variant="contained"
                onClick={generateFilteredLeasesPDF}
                startIcon={<PiFilePdf />}
              >
                Gerar PDF
              </Button>

              {/* Contador de resultados */}
              {/* </Paper> */}
            </Box>

            <Box sx={{ flexGrow: 1, marginTop: "10px" }}>
              <DataGrid
                rows={filteredLeases}
                columns={columns}
                getRowId={(row) => row.id_locacao}
                disableRowSelectionOnClick
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
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
                <Box sx={{ display: "flex", height: "70vh" }}>
                  <Box
                    sx={{
                      height: "70vh",
                      width: "70vw",
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
                        onChange={(e) => {
                          const capitalized = capitalizeWords(e.target.value);
                          form.setValue("rua_locacao", capitalized, {
                            shouldValidate: true,
                          });
                        }}
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
                        onChange={(e) => {
                          const capitalized = capitalizeWords(e.target.value);
                          form.setValue("bairro_locacao", capitalized, {
                            shouldValidate: true,
                          });
                        }}
                      />
                      <TextField
                        {...form.register("cidade_locacao")}
                        label="Cidade"
                        size="small"
                        required
                        onChange={(e) => {
                          const capitalized = capitalizeWords(e.target.value);
                          form.setValue("cidade_locacao", capitalized, {
                            shouldValidate: true,
                          });
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                        mt: 2,
                        alignItems: "center",
                      }}
                    >
                      {/* Campo de Estado - Estilo igual ao TextField */}
                      <TextField
                        select
                        label="Estado"
                        value={form.watch("estado_locacao") || ""}
                        onChange={(e) =>
                          form.setValue("estado_locacao", e.target.value, {
                            shouldValidate: true,
                          })
                        }
                        size="small"
                        fullWidth
                        margin="normal"
                        required
                        error={!!form.formState.errors.estado_locacao}
                        helperText={
                          form.formState.errors.estado_locacao?.message
                        }
                        variant="outlined"
                        sx={{
                          "& .MuiSelect-select": {
                            padding: "8.5px 14px",
                          },
                        }}
                      >
                        <MenuItem value="">Selecione</MenuItem>
                        {estadosBrasileiros.map((estado) => (
                          <MenuItem key={estado.sigla} value={estado.sigla}>
                            {estado.sigla} - {estado.nome}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Campo de CEP */}
                      <TextField
                        {...form.register("cep_locacao")}
                        label="CEP"
                        size="small"
                        fullWidth
                        margin="normal"
                        required
                        error={!!form.formState.errors.cep_locacao}
                        helperText={form.formState.errors.cep_locacao?.message}
                        variant="outlined"
                        inputProps={{
                          maxLength: 9,
                        }}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          const formattedValue = value.replace(
                            /^(\d{5})(\d)/,
                            "$1-$2"
                          );
                          form.setValue("cep_locacao", formattedValue, {
                            shouldValidate: true,
                          });
                        }}
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
                      {/* <TextField
                          {...form.register("data_prevista_devolucao")}
                          label="Previsão Devolução"
                          type="date"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          required
                        /> */}
                      <TextField
                        {...form.register("data_prevista_devolucao")}
                        label="Previsão Devolução"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        required
                        onChange={(e) => {
                          form.setValue(
                            "data_prevista_devolucao",
                            e.target.value
                          );
                          calcularDias();
                        }}
                        helperText={
                          diasLocacao > 0
                            ? `Período de ${diasLocacao} dia${
                                diasLocacao !== 1 ? "s" : ""
                              }`
                            : undefined
                        }
                      />
                      {/* <TextField
                        {...form.register("data_real_devolucao")}
                        label="Devolução Real"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      /> */}
                      <TextField
                        {...form.register("data_pagamento")}
                        label="Data do pagamento"
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
                        {...form.register("valor_total")}
                        label="Valor Total"
                        size="small"
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">R$</InputAdornment>
                          ),
                          style: { height: 40 }, // força altura consistente, ajuste conforme necessário
                        }}
                      />

                      <TextField
                        {...form.register("valor_frete", {
                          valueAsNumber: true,
                        })}
                        label="Valor Frete"
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">R$</InputAdornment>
                          ),
                          style: { height: 40 },
                        }}
                      />
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
                        options={products.filter((p) => {
                          if (!p || typeof p.totalAvailable === "undefined") {
                            console.warn("Produto inválido encontrado:", p);
                            return false;
                          }

                          const isAvailable = p.totalAvailable > 0;

                          const isAlreadyAdded = leaseItems.some((item) => {
                            if (!item || !item.patrimonio) {
                              console.warn("Item de locação inválido:", item);
                              return false;
                            }

                            return item.patrimonio.id_produto === p.id;
                          });

                          return isAvailable && !isAlreadyAdded;
                        })}
                        getOptionLabel={(option) =>
                          `${option.name} (${option.description}) - ${option.totalAvailable} disponíveis`
                        }
                        value={selectedLease}
                        onChange={(_, newValue) => {
                          setselectedLease(newValue);
                          setSelectedStocks([]);
                          setQuantity(1);

                          if (newValue) {
                            setValorNegociado(
                              period === "diario"
                                ? newValue.daily_value || 0
                                : period === "semanal"
                                ? newValue.weekly_value || 0
                                : period === "mensal"
                                ? newValue.monthly_value || 0
                                : newValue.annual_value || 0
                            );
                          } else {
                            setValorNegociado(0);
                          }
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
                              onChange={(e) => {
                                const novoPeriodo = e.target.value as Periodo;
                                setPeriod(novoPeriodo);

                                setValorNegociado(
                                  novoPeriodo === "diario"
                                    ? selectedLease?.daily_value || 0
                                    : novoPeriodo === "semanal"
                                    ? selectedLease?.weekly_value || 0
                                    : novoPeriodo === "mensal"
                                    ? selectedLease?.monthly_value || 0
                                    : selectedLease?.annual_value || 0
                                );
                              }}
                            >
                              <MenuItem value="diario">
                                Diário (R${" "}
                                {Number(
                                  selectedLease?.daily_value || 0
                                ).toFixed(2)}
                                )
                              </MenuItem>
                              <MenuItem value="semanal">
                                Semanal (R${" "}
                                {Number(
                                  (selectedLease?.weekly_value || 0) * 7
                                ).toFixed(2)}
                                )
                              </MenuItem>
                              <MenuItem value="mensal">
                                Mensal (R${" "}
                                {Number(
                                  (selectedLease?.monthly_value || 0) * 30
                                ).toFixed(2)}
                                )
                              </MenuItem>
                              <MenuItem value="anual">
                                Anual (R${" "}
                                {Number(
                                  selectedLease?.annual_value || 0
                                ).toFixed(2)}
                                )
                              </MenuItem>
                            </TextField>

                            <TextField
                              label="Valor Unitário"
                              size="small"
                              type="number"
                              value={valorNegociado}
                              onChange={(e) =>
                                setValorNegociado(Number(e.target.value))
                              }
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    R$
                                  </InputAdornment>
                                ),
                              }}
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
                          rows={leaseItems.flatMap(
                            (item: LeaseItemProps, itemIndex: number) => {
                              if (!item || !item.patrimonio) {
                                console.warn(
                                  "Item de locação inválido ignorado:",
                                  item
                                );
                                return [];
                              }

                              const product = products.find(
                                (p) => p.id === item.patrimonio.produto.id
                              ) || {
                                name: "Produto Desconhecido",
                                description: "",
                                daily_value: 0,
                                weekly_value: 0,
                                monthly_value: 0,
                              };

                              const periodo =
                                item.valor_negociado_diario > 0
                                  ? "diario"
                                  : item.valor_negociado_semanal > 0
                                  ? "semanal"
                                  : item.valor_negociado_mensal > 0
                                  ? "mensal"
                                  : "diario";

                              const valorUnitario =
                                periodo === "diario"
                                  ? item.valor_negociado_diario
                                  : periodo === "semanal"
                                  ? item.valor_negociado_semanal
                                  : item.valor_negociado_mensal;

                              return {
                                id: `${itemIndex}-0`,
                                produtoId: item.patrimonio.produto.id,
                                nome: product.name,
                                description: product.description,
                                patrimonio:
                                  item.patrimonio.numero_patrimonio ||
                                  `Patrimônio ${itemIndex}`,
                                valorUnitario: valorUnitario
                                  ? formatCurrency(valorUnitario)
                                  : "R$ 0,00",
                                periodo,
                                rawItem: item,
                              };
                            }
                          )}
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
                              valueFormatter: (params) => {
                                switch (params) {
                                  case "diario":
                                    return "Diário";
                                  case "semanal":
                                    return "Semanal";
                                  case "mensal":
                                    return "Mensal";
                                  default:
                                    return params;
                                }
                              },
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
                                        item.patrimonio.id_produto ===
                                        params.row.produtoId
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
                          autoHeight
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
            </form>
            <DialogActions>
              <Button onClick={() => setOpenForm(false)} color="primary">
                Cancelar
              </Button>
              <Button
                onClick={form.handleSubmit(handleCreateOrUpdate)}
                color="primary"
              >
                {editLease ? "Salvar Alterações" : "Adicionar Locação"}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
        <Dialog open={devolucaoModalOpen} onClose={handleCloseDevolucaoModal}>
          <DialogTitle>Registrar Devolução</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Data Real de Devolução"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={dataDevolucao}
                    onChange={(e) => setDataDevolucao(e.target.value)}
                  />
                  {/* Adiciona verificação de atraso */}
                  {leaseParaDevolver &&
                    new Date(dataDevolucao) >
                      new Date(leaseParaDevolver.data_prevista_devolucao) && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        Devolução atrasada! A data prevista era{" "}
                        {formatDate(leaseParaDevolver.data_prevista_devolucao)}
                      </Alert>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Valor da Multa (R$)"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">R$</InputAdornment>
                      ),
                    }}
                    value={valorMulta}
                    onChange={(e) => setValorMulta(Number(e.target.value))}
                  />
                </Grid>

                {leaseParaDevolver &&
                  leaseParaDevolver.data_pagamento == null && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Data de Pagamento"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={dataPagamento}
                        onChange={(e) => setDataPagamento(e.target.value)}
                      />
                    </Grid>
                  )}
              </Grid>
              {/* {leaseParaDevolver &&
                    new Date(dataDevolucao) >
                      new Date(leaseParaDevolver.data_prevista_devolucao) && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Sugestão: Multa de 10% do valor total (R${" "}
                        {(leaseParaDevolver.valor_total * 0.1).toFixed(2)})
                      </Typography>
                    )} */}

              {leaseParaDevolver && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">
                    Itens a serem devolvidos:
                  </Typography>
                  <List dense>
                    {leaseParaDevolver.leaseItems.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${item.patrimonio.produto.name} (${item.patrimonio.numero_patrimonio})`}
                          secondary={`Status atual: ${item.patrimonio.status}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDevolucaoModal}>Cancelar</Button>
            <Button
              onClick={() => handleConfirmarDevolucao()}
              variant="contained"
              color="primary"
            >
              Confirmar Devolução
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={cancelamentoModalOpen}
          onClose={handleCloseCancelamentoModal}
        >
          <DialogTitle>Confirmar Cancelamento</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Tem certeza que deseja cancelar a locação #
              {leaseParaCancelar?.id_locacao}?
            </Typography>

            {leaseParaCancelar && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  Itens que serão liberados:
                </Typography>
                <List dense>
                  {leaseParaCancelar.leaseItems.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${item.patrimonio.produto.name} (${item.patrimonio.numero_patrimonio})`}
                        secondary={`Status atual: ${item.patrimonio.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCancelamentoModal}>Voltar</Button>
            <Button
              onClick={handleConfirmarCancelamento}
              variant="contained"
              color="error"
              startIcon={<MdDelete />}
            >
              Confirmar Cancelamento
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        sx={{
          marginLeft: "240px",
          "@media (max-width: 600px)": {
            marginLeft: "0px",
            bottom: "70px",
          },
        }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            width: "100%",
            boxShadow: 3,
            alignItems: "center",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
