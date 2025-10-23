"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type ActiveShift = {
  id: string;
  startMoney: number;
  startedAt: string; // ISO
};

const LS_KEY = "cashier_shift";

export function useShift() {
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setActiveShift(JSON.parse(raw));
    } catch {}
    setInitialized(true);
  }, []);

  const startShift = useCallback(async (startMoney: number) => {
    const shift: ActiveShift = {
      id: (globalThis.crypto?.randomUUID?.() ?? `s-${Date.now()}`),
      startMoney,
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(shift));
    setActiveShift(shift);
    return shift;
  }, []);

  const endShift = useCallback(async (endMoney: number) => {
    const finished = activeShift;
    localStorage.removeItem(LS_KEY);
    setActiveShift(null);
    return { shift: finished, endMoney };
  }, [activeShift]);

  return { activeShift, initialized, startShift, endShift };
}
