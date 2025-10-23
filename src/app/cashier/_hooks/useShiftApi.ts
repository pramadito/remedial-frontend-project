"use client";

import { axiosInstance } from "@/lib/axios";
import { Shift } from "@/types/shift";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useActiveShift = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["activeShift"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ shift: Shift | null }>("/shifts/active");
      return data.shift;
    },
    enabled,
  });
};

export const useStartShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (startMoney: number) => {
      const { data } = await axiosInstance.post<{ message: string; shift: Shift }>("/shifts", { startMoney });
      return data.shift;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["activeShift"] });
    },
  });
};

export const useEndShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (endMoney: number) => {
      const { data } = await axiosInstance.patch<{ message: string; shift: Shift }>("/shifts/end", { endMoney });
      return data.shift;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["activeShift"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Gagal mengakhiri shift";
      toast.error(String(msg));
    },
  });
};
