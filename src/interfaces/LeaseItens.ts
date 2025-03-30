export interface LeaseItensProps {
  id_item_locacao: number;
  id_locacao: number;
  valor_unit_diario: number;
  valor_unit_semanal: number;
  valor_unit_mensal: number;
  valor_unit_anual: number;
  valor_negociado_diario: number;
  valor_negociado_semanal: number;
  valor_negociado_mensal: number;
  valor_negociado_anual: number;
  createdAt: string; // Pode ser um formato ISO string
  updatedAt: string; // Pode ser um formato ISO string
}
