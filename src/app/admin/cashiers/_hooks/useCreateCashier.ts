"use client";

import { axiosInstance } from "@/lib/axios";
import { Cashier } from "@/types/cashier";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface Payload {
  name: string;
  email: string;
  password: string;
}

export const useCreateCashier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.post<{
        message: string;
        cashier: Cashier;
      }>("/cashiers", payload);
      return data.cashier;
    },
    onSuccess: async () => {
      toast.success("Kasir ditambahkan");
      await qc.invalidateQueries({ queryKey: ["cashiers"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Gagal menambahkan kasir");
    },
  });
};
