"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdjustStockModal({
  open,
  sign,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  sign: 1 | -1;
  pending?: boolean;
  onOpenChange: (next: boolean) => void;
  onSubmit: (qty: number) => Promise<void> | void;
}) {
  const [qty, setQty] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setQty("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const title = sign === 1 ? "Tambah Stok" : "Kurangi Stok";
  const confirmText = sign === 1 ? "+ Tambah" : "- Kurangi";

  const handleConfirm = async () => {
    const n = Number(qty);
    if (!qty || Number.isNaN(n) || n <= 0) {
      setError("Jumlah tidak valid");
      return;
    }
    await onSubmit(n);
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-lg border">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">Masukkan jumlah yang akan {sign === 1 ? "ditambahkan" : "dikurangkan"}.</p>
        </div>
        <div className="mt-4 grid gap-2">
          <Label htmlFor="qty">Jumlah</Label>
          <Input
            id="qty"
            type="number"
            inputMode="numeric"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirm();
              }
            }}
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" disabled={pending} onClick={handleConfirm} className={sign === 1 ? "bg-indigo-600 text-white hover:bg-indigo-500" : undefined}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
