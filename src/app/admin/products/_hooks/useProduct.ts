"use client";

import { axiosInstance } from "@/lib/axios";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ product: Product }>(
        `/products/${id}`
      );
      return data.product;
    },
    enabled: !!id,
  });
};
