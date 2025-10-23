"use client";

import { axiosInstance } from "@/lib/axios";
import { Cashier } from "@/types/cashier";
import { useQuery } from "@tanstack/react-query";

export const useCashier = (id: string) => {
  return useQuery({
    queryKey: ["cashier", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ cashier: Cashier }>(
        `/cashiers/${id}`
      );
      return data.cashier;
    },
    enabled: !!id,
  });
};
