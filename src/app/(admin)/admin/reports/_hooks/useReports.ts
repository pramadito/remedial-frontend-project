"use client";

import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { DailyReport, MismatchReport } from "@/types/report";
import type { SummaryReport } from "@/types/report";

export const useDailyReport = (date: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["reports", "daily", date],
    enabled: Boolean(date) && enabled,
    queryFn: async () => {
      const { data } = await axiosInstance.get<DailyReport>("/reports/daily", { params: { date } });
      return data;
    },
  });
};

export const useMismatches = (start: string, end: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["reports", "mismatches", { start, end }],
    enabled: Boolean(start) && Boolean(end) && enabled,
    queryFn: async () => {
      const { data } = await axiosInstance.get<MismatchReport>("/reports/mismatches", { params: { start, end } });
      return data;
    },
  });
};

export const useSummaryReport = (start: string, end: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["reports", "summary", { start, end }],
    enabled: Boolean(start) && Boolean(end) && enabled,
    queryFn: async () => {
      const { data } = await axiosInstance.get<SummaryReport>("/reports/summary", { params: { start, end } });
      return data;
    },
  });
};
