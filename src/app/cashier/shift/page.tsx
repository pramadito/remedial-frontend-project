"use client";

import { useState } from "react";
import { useActiveShift, useEndShift, useStartShift } from "../_hooks/useShiftApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CashierShiftPage() {
  const { data: activeShift, isLoading } = useActiveShift();
  const { mutateAsync: startShift, isPending: starting } = useStartShift();
  const { mutateAsync: endShift, isPending: ending } = useEndShift();
  const [startMoney, setStartMoney] = useState("");
  const [endMoney, setEndMoney] = useState("");

  const handleStart = async () => {
    const n = Number(startMoney || 0);
    if (Number.isNaN(n) || n < 0) {
      toast.error("Modal awal tidak valid");
      return;
    }
    try {
      await startShift(n);
      toast.success("Shift dimulai");
      setStartMoney("");
    } catch {
      // error toast handled in hook/interceptor
    }
  };

  const handleEnd = async () => {
    const n = Number(endMoney || 0);
    if (Number.isNaN(n) || n < 0) {
      toast.error("Kas akhir tidak valid");
      return;
    }
    try {
      await endShift(n);
      toast.success("Shift diakhiri");
      setEndMoney("");
    } catch {
      // error toast handled in hook/interceptor
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Shift</h1>
      {isLoading ? (
        <p className="text-sm">Loading...</p>
      ) : !activeShift ? (
        <section className="rounded-xl bg-white border shadow-sm p-5 max-w-lg">
          <h2 className="font-medium mb-2">Mulai Shift</h2>
          <p className="text-sm text-muted-foreground mb-4">Masukkan modal awal (opsional). Anda harus memulai shift untuk menggunakan POS.</p>
          <div className="grid gap-2 mb-4">
            <label className="text-sm" htmlFor="startMoney">Modal awal (Rp)</label>
            <Input id="startMoney" type="number" min={0} value={startMoney} onChange={(e) => setStartMoney(e.target.value)} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button onClick={handleStart} disabled={starting}>Mulai Shift</Button>
          </div>
        </section>
      ) : (
        <section className="rounded-xl bg-white border shadow-sm p-5 max-w-lg">
          <h2 className="font-medium mb-2">Shift Aktif</h2>
          <div className="text-sm text-muted-foreground mb-4">
            <div>ID: <span className="font-mono">{activeShift.id}</span></div>
            <div>Mulai: {new Date(activeShift.startTime).toLocaleString()}</div>
            <div>Modal awal: Rp {activeShift.startMoney.toLocaleString()}</div>
          </div>
          <div className="grid gap-2 mb-4">
            <label className="text-sm" htmlFor="endMoney">Kas akhir (Rp)</label>
            <Input id="endMoney" type="number" min={0} value={endMoney} onChange={(e) => setEndMoney(e.target.value)} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="destructive" onClick={handleEnd} disabled={ending}>Akhiri Shift</Button>
          </div>
        </section>
      )}
    </div>
  );
}
//
