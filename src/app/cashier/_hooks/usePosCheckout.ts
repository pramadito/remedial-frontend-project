"use client";

import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Item = { productId: string; quantity: number };

export type PosCheckoutPayload = {
  shiftId: string;
  paymentMethod: "CASH" | "DEBIT";
  cashAmount?: number;
  debitCardNumber?: string;
  items: Item[];
};

export const usePosCheckout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PosCheckoutPayload) => {
      const { data } = await axiosInstance.post<{ message: string; transaction: any }>(
        "/transactions/pos",
        payload
      );
      return data.transaction;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
  });
};
