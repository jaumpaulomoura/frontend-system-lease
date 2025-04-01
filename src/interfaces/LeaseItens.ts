import { StockProps } from "@interfaces/Stock";

export interface LeaseItemProps {
  id_item_locacao: number;
  id_locacao: number;
  id_patrimonio: number;
  valor_unit_diario: number;
  valor_unit_semanal: number;
  valor_unit_mensal: number;
  valor_unit_anual: number;
  valor_negociado_diario: number;
  valor_negociado_semanal: number;
  valor_negociado_mensal: number;
  valor_negociado_anual: number;
  createdAt: Date | string; // Melhor como Date, mas pode aceitar string
  updatedAt: Date | string;
  patrimonio: StockProps; // "stocks" foi alterado para "patrimonio" para consistência
}
