export type PaymentMethod = "CASH" | "DEBIT";

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: { id: string; name: string };
}

export interface Transaction {
  id: string;
  shiftId: string;
  paymentMethod: PaymentMethod;
  cashAmount?: number | null;
  changeAmount?: number | null;
  debitCardNumber?: string | null;
  totalAmount: number;
  createdAt: string;
  transactionItems: TransactionItem[];
  shift?: { id: string; cashier?: { id: string; name: string; email: string } };
}
