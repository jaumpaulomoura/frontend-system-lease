import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
// import { PiFilePdf } from "react-icons/pi";
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
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
export type FormData = {
  id?: number;
  name: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  rua_cobranca?: string;
  numero_cobranca?: string;
  complemento_cobranca?: string;
  bairro_cobranca?: string;
  cidade_cobranca?: string;
  estado_cobranca?: string;
  cep_cobranca?: string;
};

export default function ClientPage() {
  const { setLoading } = useContext(InitialContext);
  const [clients, setClients] = useState<ClientProps[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editClient, setEditClient] = useState<ClientProps | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [filterName, setFilterName] = useState("");

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
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

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

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await deleteClient(deleteId.toString());
      setClients((prev) => prev.filter((client) => client.id !== deleteId));
      setDeleteId(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Erro ao deletar o produto:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: FormData) => {
    setLoading(true);
    try {
      const clientData: ClientProps = {
        id: editClient?.id ?? 0,
        name: data.name,
        cpf_cnpj: data.cpf_cnpj,
        telefone: data.telefone,
        email: data.email,
        rua: data.rua,
        numero: data.numero,
        complemento: data.complemento || "",
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        rua_cobranca: data.rua_cobranca || "",
        numero_cobranca: data.numero_cobranca || "",
        complemento_cobranca: data.complemento_cobranca || "",
        bairro_cobranca: data.bairro_cobranca || "",
        cidade_cobranca: data.cidade_cobranca || "",
        estado_cobranca: data.estado_cobranca || "",
        cep_cobranca: data.cep_cobranca || "",
      };

      if (editClient?.id) {
        await patchClient(clientData, editClient.id);
        setClients((prev) =>
          prev.map((client) =>
            client.id === editClient.id ? { ...client, ...clientData } : client
          )
        );
      } else {
        console.log(clientData);
        const newClient = await createClient(clientData);
        setClients((prev) => [...prev, newClient]);
      }

      setOpenForm(false);
      setEditClient(null);
    } finally {
      setLoading(false);
    }
  };

  // const generatePDF = () => {
  //   const doc = new jsPDF();
  //   doc.text("Relatório de Produtos", 14, 20);

  //   autoTable(doc, {
  //     startY: 30,
  //     head: [["Name", "Email", "CPF"]],
  //     body: clients.map(({ id, name, email, cpf_cnpj }) => []),
  //   });

  //   doc.save("Produtos.pdf");
  // };

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
      editable: false, // Não deixa editar
    },
    {
      field: "name",
      headerName: "Nome",
      width: 200,
      editable: true, // Permite editar
    },
    {
      field: "cpf_cnpj",
      headerName: "CPF/CNPJ",
      width: 200,
      editable: true,
    },
    {
      field: "telefone",
      headerName: "Telefone",
      width: 150,
      editable: true,
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
      editable: true,
    },
    {
      field: "rua",
      headerName: "Rua",
      width: 250,
      editable: true,
    },
    {
      field: "numero",
      headerName: "Número",
      width: 120,
      editable: true,
    },
    {
      field: "bairro",
      headerName: "Bairro",
      width: 200,
      editable: true,
    },
    {
      field: "cidade",
      headerName: "Cidade",
      width: 200,
      editable: true,
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 150,
      editable: true,
    },
    {
      field: "cep",
      headerName: "CEP",
      width: 150,
      editable: true,
    },
    {
      field: "rua_cobranca",
      headerName: "Rua Cobrança",
      width: 250,
      editable: true,
    },
    {
      field: "numero_cobranca",
      headerName: "Número Cobrança",
      width: 150,
      editable: true,
    },
    {
      field: "bairro_cobranca",
      headerName: "Bairro Cobrança",
      width: 200,
      editable: true,
    },
    {
      field: "cidade_cobranca",
      headerName: "Cidade Cobrança",
      width: 200,
      editable: true,
    },
    {
      field: "estado_cobranca",
      headerName: "Estado Cobrança",
      width: 150,
      editable: true,
    },
    {
      field: "cep_cobranca",
      headerName: "CEP Cobrança",
      width: 150,
      editable: true,
    },
  ];

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(filterName.toLowerCase()) // Marca no filtro
  );

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
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {/* Filtro e Botões */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 1,
                marginTop: "5px",
              }}
            >
              <TextField
                label="Filtrar por Marca"
                variant="outlined" // Alterado de "Nome" para "Marca"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
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
                Adicionar Produto
              </Button>
              {/* <Button
                variant="contained"
                color="secondary"
                onClick={generatePDF}
                startIcon={<PiFilePdf />}
              >
                Gerar PDF
              </Button> */}
            </Box>

            {/* DataGrid de Produtos */}
            <Box sx={{ flexGrow: 1, marginTop: "15px" }}>
              <DataGrid
                rows={filteredClients}
                columns={columns}
                disableRowSelectionOnClick
                autoHeight={false}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
              />
            </Box>
          </Box>
        </Container>
      </Layout>
      {/* Diálogo de Exclusão */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Tem certeza de que deseja excluir este produto?
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
      {/* Formulário de Adicionar/Editar Produto */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>
          {editClient ? "Editar Produto" : "Adicionar Produto"}
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
              {...form.register("cpf_cnpj")}
              label="CPF/CNPJ"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.cpf_cnpj}
              helperText={form.formState.errors.cpf_cnpj?.message}
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
          <Button onClick={() => setOpenForm(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleCreateOrUpdate)}
            color="primary"
          >
            {editClient ? "Salvar Alterações" : "Adicionar Produto"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
