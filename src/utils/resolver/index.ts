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
export const MaterialResolver = yup.object().shape({
  name: yup.string().required("Preenchimento obrigatório"),
  unitMed: yup.string().required("Preenchimento obrigatório"),
});
// // Função para validar um CPF
// function validateCPF(cpf: string) {
//   // Remove caracteres não numéricos
//   cpf = cpf.replace(/[^\d]/g, '')

//   if (cpf.length !== 11) {
//     return false
//   }

//   // Calcula o primeiro dígito verificador
//   let sum = 0
//   for (let i = 0; i < 9; i++) {
//     sum += parseInt(cpf.charAt(i)) * (10 - i)
//   }
//   let remainder = (sum * 10) % 11
//   if (remainder === 10) {
//     remainder = 0
//   }
//   if (remainder !== parseInt(cpf.charAt(9))) {
//     return false
//   }

//   // Calcula o segundo dígito verificador
//   sum = 0
//   for (let i = 0; i < 10; i++) {
//     sum += parseInt(cpf.charAt(i)) * (11 - i)
//   }
//   remainder = (sum * 10) % 11
//   if (remainder === 10) {
//     remainder = 0
//   }
//   if (remainder !== parseInt(cpf.charAt(10))) {
//     return false
//   }

//   return true
// }

// // Função para validar um CNPJ
// function validateCNPJ(cnpj: string) {
//   // Remove caracteres não numéricos
//   cnpj = cnpj.replace(/[^\d]/g, '')

//   if (cnpj.length !== 14) {
//     return false
//   }

//   // Calcula o primeiro dígito verificador
//   let sum = 0
//   let multiplier = 5
//   for (let i = 0; i < 12; i++) {
//     sum += parseInt(cnpj.charAt(i)) * multiplier
//     multiplier = multiplier === 2 ? 9 : multiplier - 1
//   }
//   let remainder = sum % 11
//   if (remainder < 2) {
//     remainder = 0
//   } else {
//     remainder = 11 - remainder
//   }
//   if (remainder !== parseInt(cnpj.charAt(12))) {
//     return false
//   }

//   // Calcula o segundo dígito verificador
//   sum = 0
//   multiplier = 6
//   for (let i = 0; i < 13; i++) {
//     sum += parseInt(cnpj.charAt(i)) * multiplier
//     multiplier = multiplier === 2 ? 9 : multiplier - 1
//   }
//   remainder = sum % 11
//   if (remainder < 2) {
//     remainder = 0
//   } else {
//     remainder = 11 - remainder
//   }
//   if (remainder !== parseInt(cnpj.charAt(13))) {
//     return false
//   }

//   return true
// }

// export const PessoaResolver = yup.object().shape({
//   name: yup.string().required('Preenchimento obrigatório'),
//   razao: yup.string().required('Preenchimento obrigatório'),
//   fantasy: yup.string().required('Preenchimento obrigatório'),
//   document: yup.string().test('cpfOrCnpj', 'CPF ou CNPJ inválido', value => {
//     if (!value) return true // O campo é opcional, não é necessário validar se estiver vazio
//     return validateCPF(value) || validateCNPJ(value)
//   }),
//   address: yup.string().required('Preenchimento obrigatório'),
//   city: yup.string().required('Preenchimento obrigatório'),
//   state: yup.string().required('Preenchimento obrigatório'),
//   district: yup.string().required('Preenchimento obrigatório'),
//   zip: yup.string().test('cep', 'CEP inválido', value => {
//     if (!value) return true // O campo é opcional, não é necessário validar se estiver vazio
//     const unformattedValue = value.replace(/-/g, '') // Remove traços
//     return /^\d{8}$/.test(unformattedValue) // Agora valida apenas números
//   }),

//   office: yup.string().required('Preenchimento obrigatório')
// })
// export const ProductResolver = yup.object().shape({
//   name: yup.string().required('O nome é obrigatório'),
//   description: yup.string().required('A descrição é obrigatória'),
//   image: yup.string().notRequired(), // Permitir que o campo seja uma string ou undefined
//   skus: yup.array().of(
//     yup.object().shape({
//       name: yup.string().required('O nome do SKU é obrigatório'),
//       materials: yup.array().of(
//         yup.object().shape({
//           materialId: yup.number().required('O ID do material é obrigatório'),
//           consumption: yup
//             .number()
//             .required('O consumo do material é obrigatório')
//         })
//       )
//     })
//   )
// })

export const PedEntResolver = yup.object().shape({
  pessoaId: yup.number().required("Preenchimento obrigatório"),
});
export const UserResolver = yup.object().shape({
  name: yup.string().required("Preenchimento obrigatório"),
  user: yup.string().required("Preenchimento obrigatório"),
  email: yup.string().required("Preenchimento obrigatório"),
  document: yup.string().required("Preenchimento obrigatório"),
});
