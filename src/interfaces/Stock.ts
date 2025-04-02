import { ProductProps } from "./Product";

// Agora o status pode ter mais valores
export interface StockProps {
  id: number;
  id_produto: number;
  numero_patrimonio?: string;
  nota_fiscal?: string;
  valor_pago?: number | null;
  status: "Disponível" | "Alugado" | "Em manutenção" | "Reservado" | string; // Adiciona mais valores possíveis
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
  produto: ProductProps;
}
