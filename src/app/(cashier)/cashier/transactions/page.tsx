"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useActiveShift } from "../_hooks/useShiftApi";
import { useTransactionsByShift } from "../_hooks/useTransactions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { Input } from "@/components/ui/input";

export default function CashierTransactionsPage() {
  const { checked, allowed } = useRoleGuard(["CASHIER"], { message: "Halaman kasir hanya untuk role CASHIER", redirectTo: "/admin" });
  const { data: activeShift, isLoading: loadingShift } = useActiveShift(allowed);
  const { data: transactions, isLoading } = useTransactionsByShift(undefined, allowed);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  // Filters
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "CASH" | "DEBIT">("ALL");
  const [onlyActive, setOnlyActive] = useState<boolean>(false);
  const [dateFrom, setDateFrom] = useState<string>(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState<string>(""); // YYYY-MM-DD

  const toKey = (iso: string) => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const filtered = useMemo(() => {
    let txs = (transactions ?? []).slice();
    if (paymentFilter !== "ALL") {
      txs = txs.filter((t) => t.paymentMethod === paymentFilter);
    }
    if (onlyActive && activeShift) {
      txs = txs.filter((t) => t.shiftId === activeShift.id);
    }
    if (dateFrom) {
      txs = txs.filter((t) => toKey(t.createdAt) >= dateFrom);
    }
    if (dateTo) {
      txs = txs.filter((t) => toKey(t.createdAt) <= dateTo);
    }
    return txs;
  }, [transactions, paymentFilter, onlyActive, activeShift, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const txs = filtered;
    const total = txs.reduce((acc, t) => acc + t.totalAmount, 0);
    const cashTotal = txs
      .filter((t) => t.paymentMethod === "CASH")
      .reduce((acc, t) => acc + t.totalAmount, 0);
    const debitTotal = total - cashTotal;
    return { count: txs.length, total, cashTotal, debitTotal };
  }, [filtered]);

  // Group by day (YYYY-MM-DD)
  const groups = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    for (const t of filtered) {
      const key = toKey(t.createdAt);
      (map[key] ||= []).push(t);
    }
    const entries = Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
    return entries.map(([key, items]) => ({ key, items, total: items.reduce((s, x) => s + x.totalAmount, 0) }));
  }, [filtered]);

  if (!checked) return null;
  if (loadingShift) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Transaksi</h1>
        <p className="text-sm text-muted-foreground">Memeriksa shift aktif...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Transaksi</h1>

      {!activeShift && (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada shift aktif</CardTitle>
            <CardDescription>Anda tetap dapat melihat riwayat transaksi. Mulai shift untuk menandai transaksi sebagai bagian dari shift aktif.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cashier/shift" className="text-indigo-600 hover:underline">Buka halaman Shift</Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>Sesuaikan tampilan transaksi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Button size="sm" variant={paymentFilter === "ALL" ? "default" : "outline"} onClick={() => setPaymentFilter("ALL")}>Semua</Button>
              <Button size="sm" variant={paymentFilter === "CASH" ? "default" : "outline"} onClick={() => setPaymentFilter("CASH")}>Tunai</Button>
              <Button size="sm" variant={paymentFilter === "DEBIT" ? "default" : "outline"} onClick={() => setPaymentFilter("DEBIT")}>Debit</Button>
            </div>
            {activeShift && (
              <Button size="sm" variant={onlyActive ? "default" : "outline"} onClick={() => setOnlyActive((x) => !x)}>
                {onlyActive ? "Shift aktif" : "Semua shift"}
              </Button>
            )}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Dari</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Sampai</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <Button size="sm" variant="ghost" onClick={() => { setPaymentFilter("ALL"); setOnlyActive(false); setDateFrom(""); setDateTo(""); }}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
          <CardDescription>
            {activeShift ? (
              <>ID Shift aktif: {activeShift.id}</>
            ) : (
              <>Tidak ada shift aktif</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Jumlah transaksi</div>
              <div className="font-semibold">{summary.count}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total</div>
              <div className="font-semibold">Rp {summary.total.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Tunai</div>
              <div className="font-semibold">Rp {summary.cashTotal.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Debit</div>
              <div className="font-semibold">Rp {summary.debitTotal.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>Terbaru ke terlama</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm">Memuat...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-6">
              {groups.map((g) => (
                <div key={g.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold">{new Date(g.key).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className="text-sm text-muted-foreground">Total hari ini: <span className="font-semibold">{fmt(g.total)}</span></div>
                  </div>
                  <div className="divide-y">
                    {g.items.map((t) => (
                      <div
                        key={t.id}
                        className="py-3 px-2 -mx-2 rounded-md flex items-start justify-between gap-4 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelected(t)}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium flex items-center gap-2">
                            <span>{t.paymentMethod === "CASH" ? "Tunai" : "Debit"} • {fmt(t.totalAmount)}</span>
                            <span className="text-xs text-muted-foreground">• {t.transactionItems.length} item</span>
                            {activeShift ? (
                              t.shiftId === activeShift.id ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[10px]">Aktif</span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px]">Sebelumnya</span>
                              )
                            ) : null}
                          </div>
                          <div className="text-xs text-muted-foreground break-all">{new Date(t.createdAt).toLocaleString()} • #{t.id}</div>
                          {t.paymentMethod === "CASH" && (
                            <div className="text-xs text-muted-foreground">Uang: {fmt(t.cashAmount ?? 0)} • Kembali: {fmt(t.changeAmount ?? 0)}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold">{fmt(t.totalAmount)}</div>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelected(t); }} className="gap-1">
                            <Eye className="size-4" /> Detail
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <div className="font-semibold">Detail Transaksi</div>
                <Button size="sm" variant="secondary" onClick={() => setSelected(null)}>Tutup</Button>
              </div>
              <div className="p-4 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px]">
                      {selected.paymentMethod === "CASH" ? "Tunai" : "Debit"}
                    </span>
                    {activeShift && (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${selected.shiftId === activeShift.id ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                        {selected.shiftId === activeShift.id ? "Shift aktif" : "Shift sebelumnya"}
                      </span>
                    )}
                  </div>
                  <div className="text-base font-semibold">{fmt(selected.totalAmount)}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Nomor: <span className="font-mono text-slate-700">#{selected.id}</span></div>
                  <div>Waktu: {new Date(selected.createdAt).toLocaleString()}</div>
                  {selected.paymentMethod === "CASH" ? (
                    <>
                      <div>Uang diterima: <span className="text-slate-700">{fmt(selected.cashAmount ?? 0)}</span></div>
                      <div>Kembalian: <span className="text-slate-700">{fmt(selected.changeAmount ?? 0)}</span></div>
                    </>
                  ) : (
                    <div className="md:col-span-2">Nomor kartu: <span className="text-slate-700">{selected.debitCardNumber ?? "-"}</span></div>
                  )}
                </div>

                <div className="mt-1">
                  <div className="font-medium mb-1">Item</div>
                  {selected.transactionItems.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Tidak ada item.</div>
                  ) : (
                    <div className="border rounded-md divide-y">
                      {selected.transactionItems.map((it) => (
                        <div key={it.id} className="px-3 py-2 flex items-center justify-between gap-4">
                          <div>
                            <div className="font-medium text-[13px]">{it.product?.name ?? it.productId}</div>
                            <div className="text-[11px] text-muted-foreground">{it.quantity} × {fmt(it.price)}</div>
                          </div>
                          <div className="text-sm font-semibold">{fmt(it.price * it.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
