export type DailyTotals = {
  count: number;
  totalAmount: number;
  cashTotal: number;
  debitTotal: number;
};

export type PerItem = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type ShiftSummary = {
  id: string;
  cashier: { id: string; name: string; email: string } | null;
  startTime: string;
  endTime?: string | null;
  startMoney: number;
  endMoney?: number | null;
  expectedCash: number;
  mismatch: boolean;
  totals: { totalAmount: number; cashTotal: number; debitTotal: number };
};

export type DailyReport = {
  date: string;
  totals: DailyTotals;
  perItem: PerItem[];
  shifts: ShiftSummary[];
};

export type MismatchShift = {
  id: string;
  cashier: { id: string; name: string; email: string } | null;
  startTime: string;
  endTime?: string | null;
  startMoney: number;
  endMoney?: number | null;
  expectedCash: number;
  mismatch: boolean;
};

export type MismatchReport = {
  start: string;
  end: string;
  shifts: MismatchShift[];
};

export type SummaryReport = {
  start: string;
  end: string;
  totals: DailyTotals;
  perItem: PerItem[];
};
