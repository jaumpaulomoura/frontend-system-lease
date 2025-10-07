export interface RuleProps {
  id: number;
  dayIni: number;
  dayFin: number;
  campo: string;
  operador?: string;
  valor?: number;
  active: boolean;
}
