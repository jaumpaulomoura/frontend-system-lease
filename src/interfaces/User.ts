export interface UserProps {
  id: number;
  name: string;
  user: string;
  password: string;
  email: string;
  document: string;
  createdAt?: string;
  updatedAt?: string;
  role?: number;
  token?: string;
}
