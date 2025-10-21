"use client";

import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useDeleteCashier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/cashiers/${id}`);
    },
    onSuccess: async () => {
      toast.success("Kasir dihapus");
      await qc.invalidateQueries({ queryKey: ["cashiers"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Gagal menghapus kasir");
    },
  });
};
