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
import { UserProps } from "@interfaces/User";
import { createUser } from "@services/createUser";
import { deleteUser } from "@services/deleteUser";
import { getUserList } from "@services/getUserList";
import { patchUser } from "@services/patchUser";

import { UserResolver } from "@utils/resolver";
import Layout from "@components/Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Ensure proper import for the plugin

export type FormData = {
  id?: number;
  name: string;
  user: string;
  password?: string;
  email: string;
  document: string;
};

export default function UserPage() {
  const { setLoading } = useContext(InitialContext);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<UserProps | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const form = useForm<FormData>({
    resolver: yupResolver(UserResolver),
    mode: "onChange",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserList();
      setUsers(data); // Atualiza o estado com os dados recebidos
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false); // Garante que o carregamento será desativado, mesmo em caso de erro
    }
  }, [setLoading]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (editUser) {
      form.reset({
        name: editUser.name,
        user: editUser.user,
        email: editUser.email,
        document: editUser.document,
      });
    } else {
      form.reset({ name: "", user: "", email: "", document: "", password: "" });
    }
  }, [editUser, form]);

  const handleDelete = async () => {
    if (deleteId) {
      setLoading(true);
      try {
        await deleteUser(deleteId.toString());
        setUsers((prev) => prev.filter((user) => user.id !== deleteId));
        setSnackbar({
          open: true,
          message: "Usuário excluído com sucesso!",
          severity: "success",
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Erro ao excluir usuário",
          severity: "error",
        });
      } finally {
        setDeleteId(null);
        setOpenDialog(false);
        setLoading(false);
      }
    }
  };
  const handleCreateOrUpdate = async (data: FormData) => {
    setLoading(true);
    try {
      const userData = { ...data };

      if (editUser?.id && !userData.password) {
        // Em edição, remove o campo se estiver vazio
        delete userData.password;
      } else if (!editUser?.id && !userData.password) {
        // Em criação, senha é obrigatória
        throw new Error("A senha é obrigatória!");
      }

      if (editUser?.id) {
        await patchUser(userData, editUser.id);
        setUsers((prev) =>
          prev.map((user) =>
            user.id === editUser.id ? { ...user, ...userData } : user
          )
        );
        setSnackbar({
          open: true,
          message: "Usuário atualizado com sucesso!",
          severity: "success",
        });
      } else {
        // Aqui a senha está garantida como string
        const { password, ...rest } = userData;
        const newUser = await createUser({
          ...rest,
          password: password as string,
        });
        setUsers((prev) => [...prev, newUser]);
        setSnackbar({
          open: true,
          message: "Usuário criado com sucesso!",
          severity: "success",
        });
      }

      setOpenForm(false);
      setEditUser(null);
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error?.message || "Erro ao salvar usuário",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Test PDF", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Name", "Email", "CPF"]],
      body: users.map(({ name, email, document }) => [name, email, document]),
    });

    doc.save("Usuarios.pdf");
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nome", flex: 1, minWidth: 150 },
    { field: "user", headerName: "Usuario", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "document", headerName: "CPF", flex: 1, minWidth: 150 },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            onClick={() => {
              setEditUser(params.row);
              setOpenForm(true);
            }}
          >
            <MdEdit color="blue" />
          </Button>
          <Button
            onClick={() => {
              setDeleteId(params.row.id);
              setOpenDialog(true);
            }}
          >
            <MdDelete color="red" />
          </Button>
        </Box>
      ),
    },
  ];
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(filterName.toLowerCase())
  );

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
                label="Filtrar por Nome"
                variant="outlined"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between", // Distribui os botões entre o início e o final
                gap: 1,
                padding: 0,
                marginTop: "15px",
              }}
            >
              <Button variant="contained" onClick={() => setOpenForm(true)}>
                <IoAddCircleOutline style={{ marginRight: 8 }} /> Criar Usuário
              </Button>
              <Button variant="contained" onClick={generatePDF}>
                Gerar PDF <PiFilePdf style={{ marginLeft: 8 }} />
              </Button>
            </Box>

            {/* DataGrid */}
            <Box
              sx={{
                marginTop: "15px",
                marginRight: 0,
                flex: 1, // Faz o Box ocupar o restante do espaço disponível
                padding: 0, // Remove o padding do Box
              }}
            >
              <DataGrid
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ padding: 2, textAlign: "center" }}>
                      Nenhum usuário encontrado.
                    </Box>
                  ),
                }}
                rows={filteredUsers}
                columns={columns}
                getRowId={(row) => row.id}
                disableRowSelectionOnClick
                autoHeight={false}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                sx={{
                  height: users.length > 0 ? "400px" : "300px",
                  width: "100%",
                  border: "1.5px solid #BDBDBD", // Cinza médio para borda
                  borderRadius: "4px", // Bordas arredondadas
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#000000", // Fundo preto no cabeçalho
                    color: "#FFFFFF", // Texto branco
                  },
                  "& .MuiDataGrid-row:nth-of-type(odd)": {
                    backgroundColor: "#F7F7F7", // Cinza muito claro para linhas ímpares
                  },
                  "& .MuiDataGrid-row:nth-of-type(even)": {
                    backgroundColor: "#FFFFFF", // Branco para linhas pares
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#FFEB3B !important", // Amarelo suave para seleção de linha
                    color: "#000000", // Texto preto para contraste
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #BDBDBD", // Bordas cinza médio entre células
                  },
                  "& .MuiDataGrid-footerContainer": {
                    backgroundColor: "#BDBDBD", // Cinza médio
                    color: "#000000", // Texto preto
                  },
                }}
              />
            </Box>
          </Box>

          {/* Dialog de Exclusão */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogContent>
              Tem certeza que deseja excluir este usuário?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleDelete} color="secondary">
                Excluir
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog de Formulário */}
          <Dialog
            open={openForm}
            onClose={() => {
              setOpenForm(false);
              setEditUser(null);
              form.reset();
            }}
          >
            <DialogTitle>
              {editUser ? "Editar Usuário" : "Criar Usuário"}
            </DialogTitle>
            <DialogContent>
              <form
                autoComplete="off"
                onSubmit={form.handleSubmit(handleCreateOrUpdate)}
                style={{ marginTop: "8px" }}
              >
                {/* Campo Nome */}
                <TextField
                  {...form.register("name")}
                  label="Nome"
                  fullWidth
                  margin="normal"
                  autoComplete="new-password"
                  error={!!form.formState.errors.name}
                  helperText={form.formState.errors.name?.message}
                  inputProps={{
                    autoComplete: "new-password",
                  }}
                />

                {/* Campo Usuário */}
                <TextField
                  {...form.register("user")}
                  label="Usuário"
                  fullWidth
                  margin="normal"
                  autoComplete="new-password"
                  error={!!form.formState.errors.user}
                  helperText={form.formState.errors.user?.message}
                  inputProps={{
                    autoComplete: "new-password",
                  }}
                />

                {/* Campo Email */}
                <TextField
                  {...form.register("email")}
                  label="Email"
                  fullWidth
                  margin="normal"
                  type="email"
                  autoComplete="new-password"
                  error={!!form.formState.errors.email}
                  helperText={form.formState.errors.email?.message}
                  inputProps={{
                    autoComplete: "new-password",
                  }}
                />

                {/* Campo CPF */}
                <TextField
                  {...form.register("document")}
                  label="CPF"
                  fullWidth
                  margin="normal"
                  autoComplete="new-password"
                  error={!!form.formState.errors.document}
                  helperText={form.formState.errors.document?.message}
                  inputProps={{
                    autoComplete: "new-password",
                  }}
                />

                {/* Campo Senha (apenas para novo usuário) */}
                {!editUser && (
                  <TextField
                    {...form.register("password")}
                    label="Senha"
                    fullWidth
                    margin="normal"
                    type="password"
                    autoComplete="new-password"
                    error={!!form.formState.errors.password}
                    helperText={form.formState.errors.password?.message}
                    inputProps={{
                      autoComplete: "new-password",
                    }}
                  />
                )}

                <DialogActions sx={{ mt: 2 }}>
                  <Button
                    onClick={() => {
                      setOpenForm(false);
                      setEditUser(null);
                      form.reset();
                    }}
                    color="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      !form.formState.isValid || form.formState.isSubmitting
                    }
                  >
                    {editUser ? "Salvar" : "Criar"}
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
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
        </Container>
      </Layout>
    </Box>
  );
}
