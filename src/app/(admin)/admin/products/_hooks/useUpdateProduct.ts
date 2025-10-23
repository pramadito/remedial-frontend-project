"use client";

import { axiosInstance } from "@/lib/axios";
import { Product } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface Payload {
  id: string;
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
}

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Payload) => {
      const { data } = await axiosInstance.put<{
        message: string;
        product: Product;
      }>(`/products/${id}`, payload);
      return data.product;
    },
    onSuccess: async () => {
      toast.success("Produk diperbarui");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["products"] }),
        qc.invalidateQueries({ queryKey: ["product"] }),
      ]);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Gagal memperbarui produk");
    },
  });
};
