export interface StockProps {
  id: number;
  id_produto: number;
  numero_patrimonio?: string;
  nota_fiscal?: string;
  valor_pago?: number | null;
  status: string;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}
