import * as yup from "yup";

export const SectionResolver = yup.object().shape({
  name: yup.string().required("Preenchimento obrigatório"),
  order: yup
    .number()
    .typeError("Deve ser um número")
    .required("Preenchimento obrigatório")
    .integer("Deve ser um número inteiro")
    .positive("Deve ser um número positivo")
    .min(1, "Deve ser maior que zero"),
});

export const UserResolver = yup.object().shape({
  name: yup.string().required("Preenchimento obrigatório"),
  user: yup.string().required("Preenchimento obrigatório"),
  email: yup.string().required("Preenchimento obrigatório"),
  document: yup.string().required("Preenchimento obrigatório"),
});

export const ProductResolver = yup.object({
  name: yup.string().required("Nome é obrigatório"),
  marca: yup.string().required("Nome é obrigatório"),
  description: yup.string(),
  daily_value: yup
    .number()
    .nullable()
    .positive("Valor deve ser positivo")
    .transform((value) => (isNaN(value) ? null : value)),
  weekly_value: yup
    .number()
    .nullable()
    .positive("Valor deve ser positivo")
    .transform((value) => (isNaN(value) ? null : value)),
  monthly_value: yup
    .number()
    .nullable()
    .positive("Valor deve ser positivo")
    .transform((value) => (isNaN(value) ? null : value)),
  annual_value: yup
    .number()
    .nullable()
    .positive("Valor deve ser positivo")
    .transform((value) => (isNaN(value) ? null : value)),
  active: yup.boolean().required("O campo ativo é obrigatório"),
});

export const patrimonySchema = yup.object({
  nfNumber: yup.string().required("Número da NF é obrigatório"),
  value: yup
    .number()
    .required("Valor é obrigatório")
    .min(0, "O valor não pode ser negativo"),
  quantity: yup
    .number()
    .required("Quantidade é obrigatória")
    .min(1, "A quantidade deve ser pelo menos 1"),
  numero_patrimonio: yup.string().optional(),
});
export const ClientResolver = yup.object({
  id: yup
    .number()
    .optional() // Permite undefined no id
    .positive("ID deve ser um número positivo"),
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf_cnpj: yup.string().required("CPF/CNPJ é obrigatório"),
  telefone: yup.string().required("Telefone é obrigatório"),
  email: yup.string().required("Email é obrigatório").email("Email inválido"),
  rua: yup.string().required("Rua é obrigatória"),
  numero: yup.string().required("Número é obrigatório"),
  complemento: yup.string().optional(),
  bairro: yup.string().required("Bairro é obrigatório"),
  cidade: yup.string().required("Cidade é obrigatória"),
  estado: yup.string().required("Estado é obrigatório"),
  cep: yup.string().required("CEP é obrigatório"),
  rua_cobranca: yup.string().optional(),
  numero_cobranca: yup.string().optional(),
  complemento_cobranca: yup.string().optional(),
  bairro_cobranca: yup.string().optional(),
  cidade_cobranca: yup.string().optional(),
  estado_cobranca: yup.string().optional(),
  cep_cobranca: yup.string().optional(),
});
