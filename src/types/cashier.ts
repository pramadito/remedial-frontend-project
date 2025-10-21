export type Role = "ADMIN" | "CASHIER";

export interface Cashier {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
