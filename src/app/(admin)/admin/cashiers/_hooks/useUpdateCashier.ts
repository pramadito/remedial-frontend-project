"use client";

import { axiosInstance } from "@/lib/axios";
import { Cashier } from "@/types/cashier";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface Payload {
  id: string;
  name?: string;
  email?: string;
  password?: string;
}

export const useUpdateCashier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Payload) => {
      const { data } = await axiosInstance.put<{
        message: string;
        cashier: Cashier;
      }>(`/cashiers/${id}`, payload);
      return data.cashier;
    },
    onSuccess: async () => {
      toast.success("Kasir diperbarui");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["cashiers"] }),
        qc.invalidateQueries({ queryKey: ["cashier"] }),
      ]);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Gagal memperbarui kasir");
    },
  });
};
