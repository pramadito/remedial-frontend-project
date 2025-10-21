export interface Shift {
  id: string;
  cashierId: string;
  startMoney: number;
  endMoney?: number | null;
  startTime: string;
  endTime?: string | null;
  createdAt: string;
  updatedAt: string;
}
