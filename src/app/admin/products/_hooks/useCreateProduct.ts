"use client";

import { axiosInstance } from "@/lib/axios";
import { Product } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface Payload {
  name: string;
  price: number;
  stock: number;
  description?: string;
}

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.post<{
        message: string;
        product: Product;
      }>("/products", payload);
      return data.product;
    },
    onSuccess: async () => {
      toast.success("Produk ditambahkan");
      await qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Gagal menambahkan produk");
    },
  });
};
