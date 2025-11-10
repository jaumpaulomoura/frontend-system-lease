/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { IoAddCircleOutline } from "react-icons/io5";
import CancelIcon from "@mui/icons-material/Cancel";
import { MdClear, MdDelete } from "react-icons/md";
import {
  Box,
  Button,
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
  InputAdornment,
} from "@mui/material";
import { InitialContext } from "@contexts/InitialContext";
import { StockProps } from "@interfaces/Stock";
import { ProductProps } from "@interfaces/Product";
import { LeaseItemProps } from "@interfaces/LeaseItens";
import { RuleProps } from "@interfaces/Rule";

type Periodo = "diario" | "semanal" | "quinzenal" | "mensal" | "anual";

interface ClientProps {
  id: number;
  name: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
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
  telefone_contato?: string;
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
    valor_unit_quinzenal: number;
    valor_unit_mensal: number;
    valor_unit_anual: number;
    valor_negociado_diario: number;
    valor_negociado_semanal: number;
    valor_negociado_quinzenal: number;
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
  telefone_contato?: string | null;
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

interface ProductWithStock extends ProductProps {
  availableStock: StockProps[];
  totalAvailable: number;
}

interface LeaseFormModalProps {
  open: boolean;
  onClose: () => void;
  editLease: LeaseRequestPayload | null;
  clients: ClientProps[];
  products: ProductWithStock[];
  rules: RuleProps[];
  onSubmit: (data: FormData) => void;
  leaseItems: LeaseItemProps[];
  setLeaseItems: React.Dispatch<React.SetStateAction<LeaseItemProps[]>>;
}

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

export default function LeaseFormModal({
  open,
  onClose,
  editLease,
  clients,
  products,
  rules,
  onSubmit,
  leaseItems,
  setLeaseItems,
}: LeaseFormModalProps) {
  const { setLoading } = useContext(InitialContext);
  const [selectedLease, setSelectedLease] = useState<ProductWithStock | null>(null);
  const [selectedStocks, setSelectedStocks] = useState<StockProps[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [valorNegociado, setValorNegociado] = useState<number>(0);
  const [period, setPeriod] = useState<Periodo>("diario");
  const [diasLocacao, setDiasLocacao] = useState(0);
  const [itemRegra, setItemRegra] = useState({
    periodo: "diario" as Periodo,
    operador: "+",
    valorRegra: 0,
    valorBase: 0,
    valorCalculado: 0,
    diasLocacao: 0,
  });
  const [valorTotalEditavel, setValorTotalEditavel] = useState<string>("");
  const [valorManualmenteEditado, setValorManualmenteEditado] = useState(false);

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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
      telefone_contato: "",
      data_inicio: getCurrentDateTime(),
      data_prevista_devolucao: getCurrentDateTime(),
      data_real_devolucao: "",
      data_pagamento: "",
      valor_total: 0,
      valor_multa: 0,
      valor_frete: 60,
      status: "Ativo",
      observacoes: "",
    },
  });

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const calcularDiferencaDias = (dataInicio: string, dataFim: string): number => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    // Calcula diferença em horas
    const diffEmHoras = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);

    // Arredonda para cima (qualquer fração de dia conta como dia inteiro)
    // Exemplo: 44 horas = 1.83 dias → arredonda para 2 dias
    const dias = Math.ceil(diffEmHoras / 24);

    return dias > 0 ? dias : 1; // Mínimo 1 dia
  };

  const calcularValorComRegra = (
    valorBase: number,
    operador: string,
    valorRegra: number
  ): number => {
    switch (operador) {
      case "+":
        return valorBase + valorRegra;
      case "-":
        return Math.max(0, valorBase - valorRegra);
      case "*":
        return valorBase * valorRegra;
      case "/":
        return valorRegra !== 0 ? valorBase / valorRegra : valorBase;
      case "%":
        return valorBase * (1 + valorRegra / 100);
      default:
        return valorBase;
    }
  };

  const calcularDias = () => {
    const dataInicio = form.watch("data_inicio");
    const dataFim = form.watch("data_prevista_devolucao");

    if (dataInicio && dataFim) {
      const dias = calcularDiferencaDias(dataInicio as string, dataFim as string);
      setDiasLocacao(dias);
      return dias;
    }
    return 0;
  };

  useEffect(() => {
    if (selectedLease) {
      setQuantity(1);
      setSelectedStocks(selectedLease.availableStock.slice(0, 1));
      setValorTotalEditavel(""); // Limpa ao mudar produto
      setValorManualmenteEditado(false); // Reseta flag
    }
  }, [selectedLease]);

  useEffect(() => {
    calcularDias();
  }, [form.watch("data_inicio"), form.watch("data_prevista_devolucao")]);

  // Pré-preencher valor total automaticamente (só se não foi editado manualmente)
  useEffect(() => {
    if (itemRegra.valorCalculado && diasLocacao > 0 && !valorManualmenteEditado) {
      const totalAutomatico = itemRegra.valorCalculado * diasLocacao;
      setValorTotalEditavel(totalAutomatico.toFixed(2));
    }
  }, [itemRegra.valorCalculado, diasLocacao, valorManualmenteEditado]);

  const handleAddLease = () => {
    const dataInicio = form.watch("data_inicio");
    const dataFim = form.watch("data_prevista_devolucao");

    if (
      !selectedLease ||
      selectedStocks.length === 0 ||
      !dataInicio ||
      !dataFim
    ) {
      return;
    }

    const dias = calcularDiferencaDias(dataInicio as string, dataFim as string);

    const valorPorPeriodo = {
      diario: itemRegra.valorCalculado,
      semanal: itemRegra.valorCalculado,
      quinzenal: itemRegra.valorCalculado,
      mensal: itemRegra.valorCalculado,
      anual: itemRegra.valorCalculado,
    };

    const novosItens: LeaseItemProps[] = selectedStocks.map((stock) => ({
      id: stock.id,
      patrimonio: stock,
      valor_unit_diario: selectedLease.daily_value || 0,
      valor_unit_semanal: selectedLease.weekly_value || 0,
      valor_unit_quinzenal: selectedLease.fortnightly_value || 0,
      valor_unit_mensal: selectedLease.monthly_value || 0,
      valor_unit_anual: selectedLease.annual_value || 0,
      valor_negociado_diario: valorPorPeriodo.diario,
      valor_negociado_semanal: valorPorPeriodo.semanal,
      valor_negociado_quinzenal: valorPorPeriodo.quinzenal,
      valor_negociado_mensal: valorPorPeriodo.mensal,
      valor_negociado_anual: valorPorPeriodo.anual,
      quantidade_dias: dias,
      periodo_cobranca: itemRegra.periodo,
      valor_total: valorTotalEditavel ? Number(valorTotalEditavel) : null,
    }));

    setLeaseItems([...leaseItems, ...novosItens]);
    setSelectedLease(null);
    setSelectedStocks([]);
    setQuantity(1);
    setValorTotalEditavel(""); // Limpa o campo editável
    setValorManualmenteEditado(false); // Reseta flag
  };

  const handleRemoveLeaseItem = (index: number) => {
    const novosItens = leaseItems.filter((_, i) => i !== index);
    setLeaseItems(novosItens);
  };

  const valorTotalItens = useMemo(() => {
    return leaseItems.reduce((total, item) => {
      // Se o item tem valor_total definido (editado manualmente), usa ele
      if (item.valor_total) {
        return total + Number(item.valor_total);
      }

      // Caso contrário, calcula: valor unitário × dias
      if (!item.periodo_cobranca || !item.quantidade_dias) return total;

      const valorNegociado = item[
        `valor_negociado_${item.periodo_cobranca}` as keyof LeaseItemProps
      ] as number || 0;

      const valorItem = valorNegociado * item.quantidade_dias;

      return total + valorItem;
    }, 0);
  }, [leaseItems]);

  useEffect(() => {
    const valorFrete = form.watch("valor_frete") || 0;
    form.setValue("valor_total", valorTotalItens + valorFrete);
  }, [valorTotalItens, form.watch("valor_frete")]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                width: "55%",
                pr: 2,
                overflowY: "auto",
                borderRight: "1px solid #e0e0e0",
              }}
            >
              <Autocomplete
                options={clients}
                getOptionLabel={(option) => `${option.id} - ${option.name}`}
                value={
                  clients.find((c) => c.id === form.watch("cliente_id")) || null
                }
                onChange={(_, newValue) => {
                  form.setValue("cliente_id", newValue?.id || 0);

                  // Preenche automaticamente o endereço da locação com o endereço do cliente
                  if (newValue) {
                    form.setValue("rua_locacao", capitalizeWords(newValue.rua || ""));
                    form.setValue("numero_locacao", newValue.numero || "");
                    form.setValue("complemento_locacao", capitalizeWords(newValue.complemento || ""));
                    form.setValue("bairro_locacao", capitalizeWords(newValue.bairro || ""));
                    form.setValue("cidade_locacao", capitalizeWords(newValue.cidade || ""));
                    form.setValue("estado_locacao", newValue.estado?.toUpperCase() || "");
                    form.setValue("cep_locacao", newValue.cep || "");
                    form.setValue("telefone_contato", newValue.telefone || "");
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" required />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 0.8fr 1.2fr",
                  gap: 2,
                  mt: 2,
                }}
              >
                <TextField
                  {...form.register("rua_locacao")}
                  label="Rua"
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
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
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  {...form.register("complemento_locacao")}
                  label="Complemento"
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
                  {...form.register("bairro_locacao")}
                  label="Bairro"
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
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
                  InputLabelProps={{ shrink: true }}
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
                  InputLabelProps={{ shrink: true }}
                  error={!!form.formState.errors.estado_locacao}
                  helperText={form.formState.errors.estado_locacao?.message}
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

                <TextField
                  {...form.register("cep_locacao")}
                  label="CEP"
                  size="small"
                  fullWidth
                  margin="normal"
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!form.formState.errors.cep_locacao}
                  helperText={form.formState.errors.cep_locacao?.message}
                  variant="outlined"
                  inputProps={{
                    maxLength: 9,
                  }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const formattedValue = value.replace(/^(\d{5})(\d)/, "$1-$2");
                    form.setValue("cep_locacao", formattedValue, {
                      shouldValidate: true,
                    });
                  }}
                />

                <TextField
                  {...form.register("telefone_contato")}
                  label="Telefone de Contato"
                  size="small"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  inputProps={{
                    maxLength: 15,
                  }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    let formattedValue = value;
                    if (value.length <= 10) {
                      formattedValue = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, (match, p1, p2, p3) => {
                        if (p3) return `(${p1}) ${p2}-${p3}`;
                        if (p2) return `(${p1}) ${p2}`;
                        if (p1) return `(${p1}`;
                        return match;
                      });
                    } else {
                      formattedValue = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, (match, p1, p2, p3) => {
                        if (p3) return `(${p1}) ${p2}-${p3}`;
                        if (p2) return `(${p1}) ${p2}`;
                        if (p1) return `(${p1}`;
                        return match;
                      });
                    }
                    form.setValue("telefone_contato", formattedValue, {
                      shouldValidate: true,
                    });
                  }}
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
                {/* Data de Início */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Data e Hora de Início *
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      type="date"
                      size="small"
                      sx={{ flex: 1 }}
                      InputLabelProps={{ shrink: true }}
                      required
                      value={form.watch("data_inicio")?.split("T")[0] || ""}
                      onChange={(e) => {
                        const currentTime = form.watch("data_inicio")?.split("T")[1] || "08:00";
                        form.setValue("data_inicio", `${e.target.value}T${currentTime}`);
                      }}
                    />
                    <TextField
                      type="time"
                      size="small"
                      sx={{ width: 120 }}
                      InputLabelProps={{ shrink: true }}
                      required
                      value={form.watch("data_inicio")?.split("T")[1] || "08:00"}
                      onChange={(e) => {
                        const currentDate = form.watch("data_inicio")?.split("T")[0] || new Date().toISOString().split("T")[0];
                        form.setValue("data_inicio", `${currentDate}T${e.target.value}`);
                      }}
                    />
                  </Box>
                </Box>

                {/* Data Prevista de Devolução */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Previsão de Devolução *
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      type="date"
                      size="small"
                      sx={{ flex: 1 }}
                      InputLabelProps={{ shrink: true }}
                      required
                      value={form.watch("data_prevista_devolucao")?.split("T")[0] || ""}
                      onChange={(e) => {
                        const currentTime = form.watch("data_prevista_devolucao")?.split("T")[1] || "18:00";
                        form.setValue("data_prevista_devolucao", `${e.target.value}T${currentTime}`);
                        calcularDias();
                      }}
                      helperText={
                        diasLocacao > 0
                          ? `${diasLocacao} dia${diasLocacao !== 1 ? "s" : ""}`
                          : undefined
                      }
                    />
                    <TextField
                      type="time"
                      size="small"
                      sx={{ width: 120 }}
                      InputLabelProps={{ shrink: true }}
                      required
                      value={form.watch("data_prevista_devolucao")?.split("T")[1] || "18:00"}
                      onChange={(e) => {
                        const currentDate = form.watch("data_prevista_devolucao")?.split("T")[0] || new Date().toISOString().split("T")[0];
                        form.setValue("data_prevista_devolucao", `${currentDate}T${e.target.value}`);
                        calcularDias();
                      }}
                    />
                  </Box>
                </Box>

                {/* Data de Pagamento */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Data do Pagamento
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      type="date"
                      size="small"
                      sx={{ flex: 1 }}
                      InputLabelProps={{ shrink: true }}
                      value={form.watch("data_pagamento")?.split("T")[0] || ""}
                      onChange={(e) => {
                        const currentTime = form.watch("data_pagamento")?.split("T")[1] || "12:00";
                        form.setValue("data_pagamento", e.target.value ? `${e.target.value}T${currentTime}` : "");
                      }}
                    />
                    <TextField
                      type="time"
                      size="small"
                      sx={{ width: 120 }}
                      InputLabelProps={{ shrink: true }}
                      value={form.watch("data_pagamento")?.split("T")[1] || "12:00"}
                      onChange={(e) => {
                        const currentDate = form.watch("data_pagamento")?.split("T")[0] || new Date().toISOString().split("T")[0];
                        form.setValue("data_pagamento", `${currentDate}T${e.target.value}`);
                      }}
                    />
                  </Box>
                </Box>
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
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                    style: { height: 40 },
                  }}
                />

                <TextField
                  {...form.register("valor_frete", {
                    valueAsNumber: true,
                  })}
                  label="Valor Frete"
                  size="small"
                  InputLabelProps={{ shrink: true }}
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
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
            </Box>

            {/* Seção de produtos - lado direito */}
            <Box sx={{ width: "45%", pl: 2, overflowY: "auto" }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Produtos da Locação
              </Typography>

              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  p: 1.5,
                  maxHeight: 250,
                  overflowY: "auto",
                }}
              >
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                  Adicionar Produto
                </Typography>
                <Autocomplete
                  options={products.filter((p) => {
                    if (!p || typeof p.totalAvailable === "undefined") {
                      return false;
                    }
                    const isAvailable = Number(p.totalAvailable) > 0;
                    const isAlreadyAdded = leaseItems.some((item) => {
                      if (!item || !item.patrimonio) {
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
                    setSelectedLease(newValue);
                    setSelectedStocks([]);
                    setQuantity(1);

                    if (newValue) {
                      const dataInicio = form.watch("data_inicio");
                      const dataFim = form.watch("data_prevista_devolucao");

                      if (!dataInicio || !dataFim) return;

                      const dias = calcularDiferencaDias(dataInicio as string, dataFim as string);

                      const regraEncontrada = rules.find(
                        (r) => dias >= r.dayIni && dias <= r.dayFin && r.active
                      );

                      if (regraEncontrada) {
                        const valorBase = Number(
                          regraEncontrada.campo === "diario"
                            ? newValue.daily_value
                            : regraEncontrada.campo === "semanal"
                            ? newValue.weekly_value
                            : regraEncontrada.campo === "quinzenal"
                            ? newValue.fortnightly_value
                            : regraEncontrada.campo === "mensal"
                            ? newValue.monthly_value
                            : newValue.annual_value
                        );

                        const operador = regraEncontrada.operador || "+";
                        const valorRegra = regraEncontrada.valor || 0;

                        const valorCalculado = calcularValorComRegra(
                          valorBase,
                          operador,
                          Number(valorRegra)
                        );

                        setItemRegra({
                          periodo: regraEncontrada.campo as Periodo,
                          operador,
                          valorRegra: Number(valorRegra),
                          valorBase,
                          valorCalculado,
                          diasLocacao: dias,
                        });
                      }
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
                  sx={{ mb: 1.5 }}
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
                          selectedLease.availableStock.slice(0, newQuantity)
                        );
                      }}
                      inputProps={{
                        min: 1,
                        max: selectedLease.totalAvailable,
                      }}
                      sx={{ mb: 1.5 }}
                    />

                    {/* Campos da Regra - OCULTOS (processamento em background) */}
                    <Box sx={{ display: "none" }}>
                      <TextField
                        select
                        label="Período"
                        size="small"
                        value={itemRegra.periodo}
                        onChange={(e) => {
                          const periodo = e.target.value as Periodo;
                          const valorBase =
                            periodo === "diario"
                              ? selectedLease.daily_value
                              : periodo === "semanal"
                              ? selectedLease.weekly_value
                              : periodo === "quinzenal"
                              ? selectedLease.fortnightly_value
                              : periodo === "mensal"
                              ? selectedLease.monthly_value
                              : selectedLease.annual_value;
                          setItemRegra((prev) => {
                            const novoValorCalculado = calcularValorComRegra(
                              Number(valorBase),
                              prev.operador,
                              prev.valorRegra
                            );
                            return {
                              ...prev,
                              periodo,
                              valorBase: Number(valorBase),
                              valorCalculado: novoValorCalculado,
                            };
                          });
                        }}
                        helperText={`Sugerido: ${diasLocacao} dias`}
                      >
                        <MenuItem value="diario">Diário</MenuItem>
                        <MenuItem value="semanal">Semanal</MenuItem>
                        <MenuItem value="quinzenal">Quinzenal</MenuItem>
                        <MenuItem value="mensal">Mensal</MenuItem>
                        <MenuItem value="anual">Anual</MenuItem>
                      </TextField>

                      <TextField
                        label="Valor Base"
                        type="number"
                        size="small"
                        value={itemRegra.valorBase}
                        onChange={(e) => {
                          const valorBase = Number(e.target.value);
                          setItemRegra((prev) => {
                            const novoValorCalculado = calcularValorComRegra(
                              valorBase,
                              prev.operador,
                              prev.valorRegra
                            );
                            return {
                              ...prev,
                              valorBase,
                              valorCalculado: novoValorCalculado,
                            };
                          });
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">R$</InputAdornment>
                          ),
                        }}
                        helperText="Editável"
                      />

                      <TextField
                        select
                        label="Operador"
                        size="small"
                        value={itemRegra.operador}
                        onChange={(e) => {
                          const operador = e.target.value;
                          setItemRegra((prev) => {
                            const novoValorCalculado = calcularValorComRegra(
                              prev.valorBase,
                              operador,
                              prev.valorRegra
                            );
                            return {
                              ...prev,
                              operador,
                              valorCalculado: novoValorCalculado,
                            };
                          });
                        }}
                      >
                        <MenuItem value="+">+ (Soma)</MenuItem>
                        <MenuItem value="-">- (Subtração)</MenuItem>
                        <MenuItem value="*">× (Multiplicação)</MenuItem>
                        <MenuItem value="/">÷ (Divisão)</MenuItem>
                        <MenuItem value="%">% (Porcentagem)</MenuItem>
                      </TextField>

                      <TextField
                        label="Valor"
                        type="number"
                        size="small"
                        value={itemRegra.valorRegra}
                        onChange={(e) => {
                          const valorRegra = Number(e.target.value);
                          setItemRegra((prev) => {
                            const novoValorCalculado = calcularValorComRegra(
                              prev.valorBase,
                              prev.operador,
                              valorRegra
                            );
                            return {
                              ...prev,
                              valorRegra,
                              valorCalculado: novoValorCalculado,
                            };
                          });
                        }}
                      />
                    </Box>

                    {/* Valor Unitário e Valor Total - LADO A LADO */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1.5,
                        mb: 1.5,
                      }}
                    >
                      {/* Valor Unitário - CALCULADO AUTOMATICAMENTE */}
                      <TextField
                        label="Valor Unitário"
                        size="small"
                        fullWidth
                        value={itemRegra.valorCalculado.toFixed(2)}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">R$</InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiInputBase-input": {
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5"
                          }
                        }}
                        helperText="Calculado automaticamente"
                      />

                      {/* Valor Total - EDITÁVEL */}
                      <TextField
                        label="Valor Total"
                        type="number"
                        size="small"
                        fullWidth
                        value={valorTotalEditavel}
                        onChange={(e) => {
                          const novoValorTotal = e.target.value;
                          setValorTotalEditavel(novoValorTotal);
                          setValorManualmenteEditado(true);

                          // Calcula o valor unitário baseado no total digitado
                          if (novoValorTotal && diasLocacao > 0) {
                            const valorUnitarioCalculado = Number(novoValorTotal) / diasLocacao;
                            setItemRegra((prev) => ({
                              ...prev,
                              valorCalculado: valorUnitarioCalculado
                            }));
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">R$</InputAdornment>
                          ),
                        }}
                        helperText={`Digite o total (${diasLocacao} ${diasLocacao !== 1 ? 'dias' : 'dia'})`}
                      />
                    </Box>

                    <Button
                      onClick={handleAddLease}
                      variant="contained"
                      startIcon={<IoAddCircleOutline />}
                      fullWidth
                    >
                      Adicionar à Locação
                    </Button>
                  </>
                )}
              </Box>

              {/* Lista de itens adicionados */}
              {leaseItems.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Itens Adicionados
                  </Typography>
                  <TableContainer>
                    <Table size="small" sx={{ fontSize: '0.875rem' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>Produto</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>Patrimônio</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>Dias</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>Vlr Unit.</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>Total</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {leaseItems.map((item, index) => {
                          const valorUnitario = item.periodo_cobranca
                            ? (item[`valor_negociado_${item.periodo_cobranca}` as keyof LeaseItemProps] as number || 0)
                            : 0;
                          const dias = item.quantidade_dias || 0;
                          const valorTotal = item.valor_total || (valorUnitario * dias);

                          return (
                            <TableRow key={index}>
                              <TableCell sx={{ py: 0.5, fontSize: '0.8rem' }}>
                                {item.patrimonio?.produto?.name || "N/A"}
                              </TableCell>
                              <TableCell sx={{ py: 0.5, fontSize: '0.8rem' }}>
                                {item.patrimonio?.numero_patrimonio || "N/A"}
                              </TableCell>
                              <TableCell sx={{ py: 0.5, fontSize: '0.8rem' }}>
                                {dias}
                              </TableCell>
                              <TableCell sx={{ py: 0.5, fontSize: '0.8rem' }}>
                                R$ {valorUnitario.toFixed(2)}
                              </TableCell>
                              <TableCell sx={{ py: 0.5, fontSize: '0.8rem', fontWeight: 600 }}>
                                R$ {valorTotal.toFixed(2)}
                              </TableCell>
                              <TableCell sx={{ py: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveLeaseItem(index)}
                                  color="error"
                                  sx={{ p: 0.5 }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
      </form>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          color="primary"
        >
          {editLease ? "Salvar Alterações" : "Adicionar Locação"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}