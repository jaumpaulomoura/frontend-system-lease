/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const calcularDiferencaDias = (dataInicio: string, dataFim: string): number => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diff =
      Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
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
    }
  }, [selectedLease]);

  useEffect(() => {
    calcularDias();
  }, [form.watch("data_inicio"), form.watch("data_prevista_devolucao")]);

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
    }));

    setLeaseItems([...leaseItems, ...novosItens]);
    setSelectedLease(null);
    setSelectedStocks([]);
    setQuantity(1);
  };

  const handleRemoveLeaseItem = (index: number) => {
    const novosItens = leaseItems.filter((_, i) => i !== index);
    setLeaseItems(novosItens);
  };

  const valorTotalItens = useMemo(() => {
    return leaseItems.reduce((total, item) => {
      if (!item.periodo_cobranca || !item.quantidade_dias) return total;

      const valorNegociado = item[
        `valor_negociado_${item.periodo_cobranca}` as keyof LeaseItemProps
      ] as number || 0;

      let valorItem = 0;

      // Como o banco salva valores divididos (valor diário),
      // todos os períodos se reduzem à mesma fórmula: valorDiário × dias
      valorItem = valorNegociado * item.quantidade_dias;

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
                width: "40%",
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
                onChange={(_, newValue) =>
                  form.setValue("cliente_id", newValue?.id || 0)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" required />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
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
                  onChange={(e) => {
                    form.setValue("data_prevista_devolucao", e.target.value);
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
                    style: { height: 40 },
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

            {/* Seção de produtos - lado direito */}
            <Box sx={{ width: "60%", pl: 2, overflowY: "auto" }}>
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
                          selectedLease.availableStock.slice(0, newQuantity)
                        );
                      }}
                      inputProps={{
                        min: 1,
                        max: selectedLease.totalAvailable,
                      }}
                      sx={{ mb: 2 }}
                    />

                    {/* Campos da Regra Editáveis */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: 2,
                        mb: 2,
                      }}
                    >
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

                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Valor Base: R$ {itemRegra.valorBase.toFixed(2)} |
                      Valor Final: R$ {itemRegra.valorCalculado.toFixed(2)}
                    </Typography>

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
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Itens Adicionados
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Produto</TableCell>
                          <TableCell>Patrimônio</TableCell>
                          <TableCell>Período</TableCell>
                          <TableCell>Valor</TableCell>
                          <TableCell>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {leaseItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {item.patrimonio?.produto?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              {item.patrimonio?.numero_patrimonio || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.periodo_cobranca}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              R$ {item.periodo_cobranca ? (item[`valor_negociado_${item.periodo_cobranca}` as keyof LeaseItemProps] as number || 0).toFixed(2) : '0.00'}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveLeaseItem(index)}
                                color="error"
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
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