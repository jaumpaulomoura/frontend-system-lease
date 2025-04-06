import { StockProps } from "./Stock";

export interface ProductProps {
  id: number;
  name: string;
  marca: string;
  description?: string;
  daily_value?: number | null;
  weekly_value?: number | null;
  monthly_value?: number | null;
  annual_value?: number | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: number;
  stock?: StockProps[];
}
