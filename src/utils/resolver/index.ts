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
  fortnightly_value: yup
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
  name: yup.string().required("Nome é obrigatório"),
  cpf_cnpj: yup
    .string()
    .required("CPF/CNPJ é obrigatório")
    .matches(
      /(^\d{3}\.\d{3}\.\d{3}-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$)|(^\d{11}$)|(^\d{14}$)/,
      "CPF ou CNPJ inválido"
    ),
  telefone: yup
    .string()
    .required("Telefone é obrigatório")
    .matches(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Telefone inválido"),
  email: yup.string().email("Email inválido").required("Email é obrigatório"),

  rua: yup.string().required("Rua é obrigatória"),
  numero: yup.string().required("Número é obrigatório"),
  complemento: yup.string().nullable(),
  bairro: yup.string().required("Bairro é obrigatório"),
  cidade: yup.string().required("Cidade é obrigatória"),
  estado: yup.string().required("Estado é obrigatório"),
  cep: yup
    .string()
    .required("CEP é obrigatório")
    .matches(/^\d{5}-?\d{3}$/, "CEP inválido"),

  rua_cobranca: yup.string().required("Rua de cobrança é obrigatória"),
  numero_cobranca: yup.string().required("Número de cobrança é obrigatório"),
  complemento_cobranca: yup.string().nullable(),
  bairro_cobranca: yup.string().required("Bairro de cobrança é obrigatório"),
  cidade_cobranca: yup.string().required("Cidade de cobrança é obrigatória"),
  estado_cobranca: yup.string().required("Estado de cobrança é obrigatório"),
  cep_cobranca: yup
    .string()
    .required("CEP de cobrança é obrigatório")
    .matches(/^\d{5}-?\d{3}$/, "CEP de cobrança inválido"),
});

export const RuleResolver = yup.object({
  dayIni: yup.number().required("Dia inicial é obrigatório"),
  dayFin: yup.number().required("Dia final é obrigatório"),
  campo: yup.string().required("Campo é obrigatório"),
  operador: yup.string().required("Operador é obrigatório"),
  valor: yup.number().required("Valor é obrigatório"),
  active: yup.boolean().required("O campo ativo é obrigatório"),
});
