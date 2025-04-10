import { ClientProps } from "./Client";
import { LeaseItemProps } from "./LeaseItens";

export interface LeaseProps {
  id_locacao: number;
  cliente_id: number;
  rua_locacao: string;
  numero_locacao: string;
  complemento_locacao?: string;
  bairro_locacao: string;
  cidade_locacao: string;
  estado_locacao: string;
  cep_locacao: string;
  data_inicio: string; // Pode ser um formato ISO string
  data_prevista_devolucao: string; // Pode ser um formato ISO string
  data_real_devolucao?: string; // Pode ser um formato ISO string
  valor_total: number; // Em formato decimal
  valor_multa: number;
  status: string;
  observacoes?: string;
  createdAt: string; // Pode ser um formato ISO string
  updatedAt: string; // Pode ser um formato ISO string
  cliente: ClientProps;
  leaseItems: LeaseItemProps[];
}
