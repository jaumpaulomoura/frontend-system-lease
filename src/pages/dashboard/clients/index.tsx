import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import { Snackbar, Alert } from "@mui/material";
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
import { ClientProps } from "@interfaces/Client";
import { createClient } from "@services/createClient";
import { deleteClient } from "@services/deleteClient";
import { getClientList } from "@services/getClientList";
import { patchClient } from "@services/patchClient";

import { ClientResolver } from "@utils/resolver";
import Layout from "@components/Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLeaseList } from "@services/getLeaseList";
export type FormData = {
  id?: number;
  name: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  rua: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  rua_cobranca: string;
  numero_cobranca: string;
  complemento_cobranca?: string | null;
  bairro_cobranca: string;
  cidade_cobranca: string;
  estado_cobranca: string;
  cep_cobranca: string;
};

export default function ClientPage() {
  const { setLoading } = useContext(InitialContext);
  const [clients, setClients] = useState<ClientProps[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editClient, setEditClient] = useState<ClientProps | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterCpfCnpj, setFilterCpfCnpj] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const form = useForm<FormData>({
    resolver: yupResolver(ClientResolver),
    mode: "onChange",
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientList();
      setClients(data);
    } catch (error) {
      console.error("Erro ao buscar Clientes:", error);
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
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (editClient) {
      form.reset({
        name: editClient.name,
        cpf_cnpj: editClient.cpf_cnpj,
        telefone: editClient.telefone,
        email: editClient.email,
        rua: editClient.rua,
        numero: editClient.numero,
        complemento: editClient.complemento,
        bairro: editClient.bairro,
        cidade: editClient.cidade,
        estado: editClient.estado,
        cep: editClient.cep,
        rua_cobranca: editClient.rua_cobranca,
        numero_cobranca: editClient.numero_cobranca,
        complemento_cobranca: editClient.complemento_cobranca,
        bairro_cobranca: editClient.bairro_cobranca,
        cidade_cobranca: editClient.cidade_cobranca,
        estado_cobranca: editClient.estado_cobranca,
        cep_cobranca: editClient.cep_cobranca,
      });
    } else {
      form.reset({
        name: "",
        cpf_cnpj: "",
        telefone: "",
        email: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        rua_cobranca: "",
        numero_cobranca: "",
        complemento_cobranca: "",
        bairro_cobranca: "",
        cidade_cobranca: "",
        estado_cobranca: "",
        cep_cobranca: "",
      });
    }
  }, [editClient, form]);
  const checkClientHasLeases = async (
    clientId: number
  ): Promise<{ hasLeases: boolean; leaseCount: number }> => {
    try {
      const leases = await getLeaseList(); // Supondo que getLeaseList retorna todas as locações
      const clientLeases = leases.filter(
        (lease) => lease.cliente_id === clientId
      );
      return {
        hasLeases: clientLeases.length > 0,
        leaseCount: clientLeases.length,
      };
    } catch (error) {
      console.error("Erro ao verificar locações:", error);
      return { hasLeases: true, leaseCount: 0 }; // Assume que tem locações em caso de erro (para segurança)
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      // Verificar se há locações vinculadas ao cliente
      const { hasLeases, leaseCount } = await checkClientHasLeases(deleteId);

      if (hasLeases) {
        setSnackbar({
          open: true,
          message: `Não é possível excluir. O cliente possui ${leaseCount} locações vinculadas.`,
          severity: "error",
        });
        setOpenDialog(false);
        return;
      }

      await deleteClient(deleteId.toString());
      setClients((prev) => prev.filter((client) => client.id !== deleteId));
      setSnackbar({
        open: true,
        message: "Cliente deletado com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao deletar o cliente:", error);
      setSnackbar({
        open: true,
        message: "Erro ao deletar o cliente.",
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
      const clientData: ClientProps = {
        id: editClient?.id ?? 0,
        name: data.name,
        cpf_cnpj: data.cpf_cnpj.replace(/\D/g, ""), // Remove formatação antes de salvar
        telefone: data.telefone.replace(/\D/g, ""), // Remove formatação
        email: data.email,
        rua: data.rua,
        numero: data.numero,
        complemento: data.complemento || "",
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep.replace(/\D/g, ""), // Remove formatação
        rua_cobranca: data.rua_cobranca || "",
        numero_cobranca: data.numero_cobranca || "",
        complemento_cobranca: data.complemento_cobranca || "",
        bairro_cobranca: data.bairro_cobranca || "",
        cidade_cobranca: data.cidade_cobranca || "",
        estado_cobranca: data.estado_cobranca || "",
        cep_cobranca: data.cep_cobranca?.replace(/\D/g, "") || "",
      };

      if (editClient?.id) {
        await patchClient(clientData, editClient.id);
        setClients((prev) =>
          prev.map((client) =>
            client.id === editClient.id ? { ...client, ...clientData } : client
          )
        );
        setSnackbar({
          open: true,
          message: "Cliente atualizado com sucesso!",
          severity: "success",
        });
      } else {
        const newClient = await createClient(clientData);
        setClients((prev) => [...prev, newClient]);
        setSnackbar({
          open: true,
          message: "Cliente criado com sucesso!",
          severity: "success",
        });
      }

      // Reset completo do formulário após sucesso
      form.reset({
        name: "",
        cpf_cnpj: "",
        telefone: "",
        email: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        rua_cobranca: "",
        numero_cobranca: "",
        complemento_cobranca: "",
        bairro_cobranca: "",
        cidade_cobranca: "",
        estado_cobranca: "",
        cep_cobranca: "",
      });

      setOpenForm(false);
      setEditClient(null);
    } catch (error) {
      console.error("Erro ao criar/atualizar cliente:", error);
      setSnackbar({
        open: true,
        message:
          "Erro ao salvar cliente: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
        severity: "error",
      });

      // Mantém os dados no formulário em caso de erro
      form.reset(data);
    } finally {
      setLoading(false);
    }
  };
  const formatCpfCnpj = (value: string) => {
    const rawValue = value.replace(/\D/g, "");

    if (rawValue.length <= 11) {
      return rawValue
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return rawValue
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .substring(0, 18);
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
              setEditClient(params.row);
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
      field: "name",
      headerName: "Nome",
      width: 200,
    },
    {
      field: "cpf_cnpj",
      headerName: "CPF/CNPJ",
      width: 200,
      valueFormatter: (params) => formatCpfCnpj(params),
    },

    {
      field: "telefone",
      headerName: "Telefone",
      width: 150,
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    {
      field: "rua",
      headerName: "Rua",
      width: 250,
    },
    {
      field: "numero",
      headerName: "Número",
      width: 120,
    },
    {
      field: "bairro",
      headerName: "Bairro",
      width: 200,
    },
    {
      field: "cidade",
      headerName: "Cidade",
      width: 200,
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 150,
    },
    {
      field: "cep",
      headerName: "CEP",
      width: 150,
    },
    {
      field: "rua_cobranca",
      headerName: "Rua Cobrança",
      width: 250,
    },
    {
      field: "numero_cobranca",
      headerName: "Número Cobrança",
      width: 150,
    },
    {
      field: "bairro_cobranca",
      headerName: "Bairro Cobrança",
      width: 200,
    },
    {
      field: "cidade_cobranca",
      headerName: "Cidade Cobrança",
      width: 200,
    },
    {
      field: "estado_cobranca",
      headerName: "Estado Cobrança",
      width: 150,
    },
    {
      field: "cep_cobranca",
      headerName: "CEP Cobrança",
      width: 150,
    },
  ];
  const filteredClients = clients.filter((client) => {
    return (
      (!filterId || client.id.toString().includes(filterId)) &&
      (!filterName ||
        client.name.toLowerCase().includes(filterName.toLowerCase())) &&
      (!filterCpfCnpj ||
        client.cpf_cnpj
          .replace(/\D/g, "")
          .includes(filterCpfCnpj.replace(/\D/g, "")))
    );
  });

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" }); // 👈 modo paisagem
    doc.text("Clientes", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Nome",
          "CPF/CNPJ",
          "Telefone",

          "Rua",
          "Número",
          "Complemento",
          "Bairro",
          "Cidade",
          "Estado",
          "CEP",
        ],
      ],
      body: clients.map((client) => [
        client.name,
        client.cpf_cnpj,
        client.telefone,

        client.rua,
        client.numero,
        client.complemento ?? "",
        client.bairro,
        client.cidade,
        client.estado,
        client.cep,
      ]),
    });

    doc.save("clientes.pdf");
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
                label="Filtrar por Nome"
                variant="outlined"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
              <TextField
                label="Filtrar por CPF/CNPJ"
                variant="outlined"
                value={filterCpfCnpj}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");

                  let formattedValue = "";
                  if (rawValue.length <= 11) {
                    formattedValue = rawValue
                      .replace(/(\d{3})(\d)/, "$1.$2")
                      .replace(/(\d{3})(\d)/, "$1.$2")
                      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                  } else {
                    formattedValue = rawValue
                      .replace(/^(\d{2})(\d)/, "$1.$2")
                      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                      .replace(/\.(\d{3})(\d)/, ".$1/$2")
                      .replace(/(\d{4})(\d)/, "$1-$2")
                      .substring(0, 18);
                  }

                  setFilterCpfCnpj(formattedValue);
                }}
                inputProps={{
                  maxLength: 18,
                }}
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
                Adicionar Cliente
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
                rows={filteredClients}
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
          Tem certeza de que deseja excluir este cliente?
          <br />
          <br />
          <br />
          {deleteId && (
            <small>
              Observação: Se houver locações vinculados a este cliente, a
              exclusão não será permitida.
            </small>
          )}
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
          setEditClient(null); // ainda fecha normalmente
        }}
        TransitionProps={{
          onExited: () => form.reset(), // reset só depois que o modal for totalmente desmontado
        }}
      >
        <DialogTitle>
          {editClient ? "Editar Cliente" : "Adicionar Cliente"}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={form.handleSubmit(handleCreateOrUpdate)}>
            <TextField
              {...form.register("name")}
              label="Nome"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
            />

            <TextField
              label="CPF/CNPJ"
              fullWidth
              margin="normal"
              value={form.watch("cpf_cnpj")}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");

                // Aplica máscara dinâmica
                let formattedValue = "";
                if (rawValue.length <= 11) {
                  formattedValue = rawValue
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                } else {
                  formattedValue = rawValue
                    .replace(/^(\d{2})(\d)/, "$1.$2")
                    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                    .replace(/\.(\d{3})(\d)/, ".$1/$2")
                    .replace(/(\d{4})(\d)/, "$1-$2")
                    .substring(0, 18); // Limite máximo para CNPJ
                }

                form.setValue("cpf_cnpj", formattedValue, {
                  shouldValidate: true,
                });
              }}
              error={!!form.formState.errors.cpf_cnpj}
              helperText={form.formState.errors.cpf_cnpj?.message}
              inputProps={{
                maxLength: 18, // 14 dígitos + máscara
              }}
            />

            <TextField
              {...form.register("telefone")}
              label="Telefone"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.telefone}
              helperText={form.formState.errors.telefone?.message}
            />

            <TextField
              {...form.register("email")}
              label="Email"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.email}
              helperText={form.formState.errors.email?.message}
            />

            <TextField
              {...form.register("rua")}
              label="Rua"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.rua}
              helperText={form.formState.errors.rua?.message}
            />

            <TextField
              {...form.register("numero")}
              label="Número"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.numero}
              helperText={form.formState.errors.numero?.message}
            />

            <TextField
              {...form.register("complemento")}
              label="Complemento"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.complemento}
              helperText={form.formState.errors.complemento?.message}
            />

            <TextField
              {...form.register("bairro")}
              label="Bairro"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.bairro}
              helperText={form.formState.errors.bairro?.message}
            />

            <TextField
              {...form.register("cidade")}
              label="Cidade"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.cidade}
              helperText={form.formState.errors.cidade?.message}
            />

            <TextField
              {...form.register("estado")}
              label="Estado"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.estado}
              helperText={form.formState.errors.estado?.message}
            />

            <TextField
              {...form.register("cep")}
              label="CEP"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.cep}
              helperText={form.formState.errors.cep?.message}
            />

            <TextField
              {...form.register("rua_cobranca")}
              label="Rua de Cobrança"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.rua_cobranca}
              helperText={form.formState.errors.rua_cobranca?.message}
            />

            <TextField
              {...form.register("numero_cobranca")}
              label="Número de Cobrança"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.numero_cobranca}
              helperText={form.formState.errors.numero_cobranca?.message}
            />

            <TextField
              {...form.register("complemento_cobranca")}
              label="Complemento de Cobrança"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.complemento_cobranca}
              helperText={form.formState.errors.complemento_cobranca?.message}
            />

            <TextField
              {...form.register("bairro_cobranca")}
              label="Bairro de Cobrança"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.bairro_cobranca}
              helperText={form.formState.errors.bairro_cobranca?.message}
            />

            <TextField
              {...form.register("cidade_cobranca")}
              label="Cidade de Cobrança"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.cidade_cobranca}
              helperText={form.formState.errors.cidade_cobranca?.message}
            />

            <TextField
              {...form.register("estado_cobranca")}
              label="Estado de Cobrança"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.estado_cobranca}
              helperText={form.formState.errors.estado_cobranca?.message}
            />

            <TextField
              {...form.register("cep_cobranca")}
              label="CEP de Cobrança"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.cep_cobranca}
              helperText={form.formState.errors.cep_cobranca?.message}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenForm(false); // apenas fecha
              setEditClient(null); // se necessário
            }}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleCreateOrUpdate)}
            color="primary"
          >
            {editClient ? "Salvar Alterações" : "Adicionar Cliente"}
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
