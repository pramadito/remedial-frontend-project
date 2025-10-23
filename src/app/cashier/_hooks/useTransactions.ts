"use client";

import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/types/transaction";

export const useTransactionsByShift = (shiftId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["transactions", { shiftId: shiftId ?? null }],
    enabled,
    queryFn: async () => {
      const params = shiftId ? { shiftId } : undefined;
      const { data } = await axiosInstance.get<{ transactions: Transaction[] }>(
        "/transactions",
        { params }
      );
      return data.transactions;
    },
  });
};
