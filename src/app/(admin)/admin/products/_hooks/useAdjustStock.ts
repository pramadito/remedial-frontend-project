"use client";

import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await axiosInstance.patch(`/products/${id}/stock`, { quantity });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Gagal memperbarui stok");
    },
  });
};
