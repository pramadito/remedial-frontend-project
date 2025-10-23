"use client";

import { axiosInstance } from "@/lib/axios";
import { Cashier } from "@/types/cashier";
import { useQuery } from "@tanstack/react-query";

export const useCashiers = (search?: string) => {
  return useQuery({
    queryKey: ["cashiers", { search: search ?? "" }],
    queryFn: async () => {
      const url = search ? `/cashiers?search=${encodeURIComponent(search)}` : "/cashiers";
      const { data } = await axiosInstance.get<{ cashiers: Cashier[] }>(url);
      return data.cashiers;
    },
  });
};
