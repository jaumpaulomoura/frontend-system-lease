import { StockProps } from "@interfaces/Stock";

export interface LeaseItemProps {
  id?: number;
  id_item_locacao?: number;
  id_locacao?: number;
  id_patrimonio?: number;
  valor_unit_diario: number;
  valor_unit_semanal: number;
  valor_unit_quinzenal: number;
  valor_unit_mensal: number;
  valor_unit_anual: number;
  valor_negociado_diario: number;
  valor_negociado_semanal: number;
  valor_negociado_quinzenal: number;
  valor_negociado_mensal: number;
  valor_negociado_anual: number;
  valor_total?: number | null; // NOVO: Valor total editável/opcional - sobrescreve o cálculo automático
  createdAt?: Date | string; // Melhor como Date, mas pode aceitar string
  updatedAt?: Date | string;
  patrimonio: StockProps; // "stocks" foi alterado para "patrimonio" para consistência
  periodo?: "diario" | "semanal" | "quinzenal" | "mensal" | "anual";
  quantidade_dias?: number;
  periodo_cobranca?: "diario" | "semanal" | "quinzenal" | "mensal" | "anual";
}
