"use client";

import { axiosInstance } from "@/lib/axios";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ products: Product[] }>(
        "/products"
      );
      return data.products;
    },
  });
};
