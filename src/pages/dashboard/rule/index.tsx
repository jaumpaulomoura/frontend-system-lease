import { useCallback, useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  Snackbar,
  Alert,
  Grid,
  Typography,
  MenuItem,
  FormHelperText,
  FormControl,
  Select,
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
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { yupResolver } from "@hookform/resolvers/yup";
import { InitialContext } from "@contexts/InitialContext";
import { RuleProps } from "@interfaces/Rule";
import { createRule } from "@services/createRule";
import { deleteRule } from "@services/deleteRule";
import { getRuleList } from "@services/getRuleList";
import { patchRule } from "@services/patchRule";

import { RuleResolver } from "@utils/resolver";
import Layout from "@components/Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
export type FormData = {
  dayIni: number;
  dayFin: number;
  campo: string;
  operador: string;
  valor: number;
  active: boolean;
};

export default function RulePage() {
  const { setLoading } = useContext(InitialContext);
  const [rules, setRules] = useState<RuleProps[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editRule, setEditRule] = useState<RuleProps | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [filterDayIni, setFilterIni] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterDayFin, setFilterFin] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const form = useForm<FormData>({
    resolver: yupResolver(RuleResolver),
    mode: "onChange",
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRuleList();
      setRules(data);
    } catch (error) {
      console.error("Erro ao buscar Rules:", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    // Patch para suprimir avisos de findDOMNode
    const originalError = console.error;
    console.error = (...args) => {
      if (/findDOMNode/.test(args[0])) return;
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    if (editRule) {
      form.reset({
        dayIni: editRule.dayIni,
        dayFin: editRule.dayFin,
        campo: editRule.campo,
        operador: editRule.operador,
        valor: editRule.valor,
        active: editRule.active,
      });
    } else {
      form.reset({
        dayIni: 0,
        dayFin: 0,
        campo: "",
        operador: "",
        valor: 0,
        active: true,
      });
    }
  }, [editRule, form]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await deleteRule(deleteId.toString());
      setRules((prev) => prev.filter((rule) => rule.id !== deleteId));
      setSnackbar({
        open: true,
        message: "Regra deletado com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao deletar o regra:", error);
      setSnackbar({
        open: true,
        message: "Erro ao deletar o regra.",
        severity: "error",
      });
    } finally {
      setDeleteId(null);
      setOpenDialog(false);
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: FormData) => {
    setLoading(true);
    try {
      const ruleData: RuleProps = {
        id: editRule?.id ?? 0,
        dayIni: data.dayIni,
        dayFin: data.dayFin,
        campo: data.campo,
        operador: data.operador,
        valor: data.valor,
        active: data.active,
      };

      if (editRule?.id) {
        await patchRule(ruleData, editRule.id);
        setRules((prev) =>
          prev.map((rule) =>
            rule.id === editRule.id ? { ...rule, ...ruleData } : rule
          )
        );
        setSnackbar({
          open: true,
          message: "Regra atualizada com sucesso!",
          severity: "success",
        });
      } else {
        const newRule = await createRule(ruleData);
        setRules((prev) => [...prev, newRule]);
        setSnackbar({
          open: true,
          message: "Regra criada com sucesso!",
          severity: "success",
        });
      }

      // Reset do formulário
      form.reset({
        dayIni: 0,
        dayFin: 0,
        campo: "",
        operador: "",
        valor: 0,
        active: false,
      });

      setOpenForm(false);
      setEditRule(null);
    } catch (error) {
      console.error("Erro ao criar/atualizar regra:", error);

      if (axios.isAxiosError(error)) {
        const response = error.response;

        if (response?.status === 401) {
          setSnackbar({
            open: true,
            message: "Você não está autenticado. Faça login novamente.",
            severity: "error",
          });
          return;
        }

        if (response?.data?.error) {
          setSnackbar({
            open: true,
            message: `Erro ao salvar regra: ${response.data.error}`,
            severity: "error",
          });
          return;
        }
      }

      setSnackbar({
        open: true,
        message: "Erro inesperado ao salvar regra.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
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
              setEditRule(params.row);
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
      field: "id",
      headerName: "ID",
      width: 100,
      // editable: false, // Não deixa editar
    },
    {
      field: "dayIni",
      headerName: "Data Inicial",
      width: 200,
    },
    {
      field: "dayFin",
      headerName: "Data final",
      width: 200,
    },

    {
      field: "campo",
      headerName: "Campo",
      width: 150,
    },
    {
      field: "operador",
      headerName: "Operador",
      width: 250,
    },
    {
      field: "valor",
      headerName: "Valor",
      width: 250,
    },
  ];
  const filteredRules = rules.filter((rule) => {
    return (
      (!filterId || rule.id.toString().includes(filterId)) &&
      (!filterDayIni || rule.dayIni.toString().includes(filterDayIni)) &&
      (!filterDayFin || rule.dayFin.toString().includes(filterDayFin))
    );
  });

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Regras", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Data Inicial", "Data Final", "Campo", "Operador", "Valor"]],
      body: rules.map((rule) => [
        rule.dayIni ?? "",
        rule.dayFin ?? "",
        rule.campo ?? "",
        rule.operador ?? "",
        rule.valor ?? "",
      ]),
    });

    doc.save("rules.pdf");
  };

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
                label="Filtrar por ID"
                variant="outlined"
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
              />
              <TextField
                label="Filtrar por Data Inicial"
                variant="outlined"
                value={filterDayIni}
                onChange={(e) => setFilterIni(e.target.value)}
              />
              <TextField
                label="Filtrar por Data Final"
                variant="outlined"
                value={filterDayFin}
                onChange={(e) => setFilterFin(e.target.value)}
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
                Adicionar Regra
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

            <Box
              sx={{
                width: "100%",
                flexGrow: 1,
                marginTop: "10px",
              }}
            >
              <DataGrid
                rows={filteredRules}
                columns={columns}
                disableRowSelectionOnClick
                style={{
                  maxWidth: "100%",
                }}
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Tem certeza de que deseja excluir esta regra?
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
      <Dialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditRule(null);
        }}
        TransitionProps={{
          onExited: () => form.reset(),
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{editRule ? "Editar Rule" : "Adicionar Rule"}</DialogTitle>
        <DialogContent>
          <form onSubmit={form.handleSubmit(handleCreateOrUpdate)}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom></Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...form.register("dayIni")}
                    label="Data Inicial"
                    fullWidth
                    margin="normal"
                    error={!!form.formState.errors.dayIni}
                    helperText={form.formState.errors.dayIni?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...form.register("dayFin")}
                    label="Data Final"
                    fullWidth
                    margin="normal"
                    error={!!form.formState.errors.dayFin}
                    helperText={form.formState.errors.dayFin?.message}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={!!form.formState.errors.campo}
                  >
                    <InputLabel id="campo-label">Campo</InputLabel>
                    <Select
                      labelId="campo-label"
                      label="Campo"
                      defaultValue=""
                      {...form.register("campo")}
                      // Para funcionar com react-hook-form e Select do MUI, às vezes é necessário usar o Controller,
                      // mas vou te mostrar o jeito mais simples primeiro, se precisar uso Controller depois.
                    >
                      <MenuItem value="diario">Diário</MenuItem>
                      <MenuItem value="semanal">Semanal</MenuItem>
                      <MenuItem value="quinzenal">Quinzenal</MenuItem>
                      <MenuItem value="mensal">Mensal</MenuItem>
                    </Select>
                    <FormHelperText>
                      {form.formState.errors.campo?.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={!!form.formState.errors.operador}
                  >
                    <InputLabel id="operador-label">Operador</InputLabel>
                    <Controller
                      name="operador"
                      control={form.control}
                      defaultValue=""
                      render={({ field }) => (
                        <Select
                          labelId="operador-label"
                          label="Operador"
                          {...field}
                        >
                          <MenuItem value="+">+</MenuItem>
                          <MenuItem value="-">-</MenuItem>
                          <MenuItem value="*">*</MenuItem>
                          <MenuItem value="/">/</MenuItem>
                        </Select>
                      )}
                    />
                    <FormHelperText>
                      {form.formState.errors.operador?.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...form.register("valor")}
                    label="Valor"
                    fullWidth
                    margin="normal"
                    error={!!form.formState.errors.valor}
                    helperText={form.formState.errors.valor?.message}
                  />
                </Grid>
              </Grid>
            </Box>
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenForm(false);
              setEditRule(null);
            }}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleCreateOrUpdate)}
            color="primary"
            variant="contained"
          >
            {editRule ? "Salvar Alterações" : "Adicionar Regra"}
          </Button>
        </DialogActions>
      </Dialog>
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
