"use client";

import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@/types/transaction";

export const useAdminTransactions = (from: string, to: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-transactions", { from, to }],
    enabled: Boolean(from) && Boolean(to) && enabled,
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ transactions: Transaction[] }>("/transactions", { params: { from, to } });
      return data.transactions;
    },
  });
};
