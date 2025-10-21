export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}
