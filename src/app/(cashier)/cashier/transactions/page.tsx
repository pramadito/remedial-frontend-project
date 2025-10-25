"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useActiveShift } from "../_hooks/useShiftApi";
import { useTransactionsByShift } from "../_hooks/useTransactions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Filter, X, Calendar, DollarSign, CreditCard } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function CashierTransactionsPage() {
  const { checked, allowed } = useRoleGuard(["CASHIER"], { message: "Halaman kasir hanya untuk role CASHIER", redirectTo: "/admin" });
  const { data: activeShift, isLoading: loadingShift } = useActiveShift(allowed);
  const { data: transactions, isLoading } = useTransactionsByShift(undefined, allowed);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

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
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-semibold">Transaksi</h1>
        <p className="text-sm text-muted-foreground">Memeriksa shift aktif...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Transaksi</h1>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {!activeShift && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Belum ada shift aktif</CardTitle>
            <CardDescription className="text-sm">Anda tetap dapat melihat riwayat transaksi. Mulai shift untuk menandai transaksi sebagai bagian dari shift aktif.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/cashier/shift" className="text-primary hover:underline text-sm">Buka halaman Shift</Link>
          </CardContent>
        </Card>
      )}

      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filter</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Metode Pembayaran</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant={paymentFilter === "ALL" ? "default" : "outline"} 
                  onClick={() => setPaymentFilter("ALL")}
                  className="text-xs"
                >
                  Semua
                </Button>
                <Button 
                  size="sm" 
                  variant={paymentFilter === "CASH" ? "default" : "outline"} 
                  onClick={() => setPaymentFilter("CASH")}
                  className="text-xs"
                >
                  Tunai
                </Button>
                <Button 
                  size="sm" 
                  variant={paymentFilter === "DEBIT" ? "default" : "outline"} 
                  onClick={() => setPaymentFilter("DEBIT")}
                  className="text-xs"
                >
                  Debit
                </Button>
              </div>
            </div>
            
            {activeShift && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Shift</p>
                <Button 
                  size="sm" 
                  variant={onlyActive ? "default" : "outline"} 
                  onClick={() => setOnlyActive((x) => !x)}
                  className="text-xs"
                >
                  {onlyActive ? "Shift aktif" : "Semua shift"}
                </Button>
              </div>
            )}
            
            <div>
              <p className="text-xs text-muted-foreground mb-2">Tanggal</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Dari</label>
                  <Input 
                    type="date" 
                    value={dateFrom} 
                    onChange={(e) => setDateFrom(e.target.value)} 
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sampai</label>
                  <Input 
                    type="date" 
                    value={dateTo} 
                    onChange={(e) => setDateTo(e.target.value)} 
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => { 
                setPaymentFilter("ALL"); 
                setOnlyActive(false); 
                setDateFrom(""); 
                setDateTo(""); 
              }}
              className="text-xs w-full"
            >
              Reset Filter
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ringkasan</CardTitle>
          <CardDescription className="text-sm">
            {activeShift ? (
              <>ID Shift aktif: {activeShift.id}</>
            ) : (
              <>Tidak ada shift aktif</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-muted-foreground text-xs">Jumlah transaksi</div>
              <div className="font-semibold text-lg">{summary.count}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-muted-foreground text-xs">Total</div>
              <div className="font-semibold text-lg">{fmt(summary.total)}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-muted-foreground text-xs flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Tunai
              </div>
              <div className="font-semibold text-lg">{fmt(summary.cashTotal)}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-muted-foreground text-xs flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Debit
              </div>
              <div className="font-semibold text-lg">{fmt(summary.debitTotal)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Transaksi</CardTitle>
          <CardDescription className="text-sm">Terbaru ke terlama</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm">Memuat...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold">{new Date(g.key).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className="text-sm text-muted-foreground">Total: <span className="font-semibold">{fmt(g.total)}</span></div>
                  </div>
                  <div className="space-y-2">
                    {g.items.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 border rounded-lg bg-white shadow-sm"
                        onClick={() => setSelected(t)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={t.paymentMethod === "CASH" ? "default" : "secondary"} className="text-xs">
                                {t.paymentMethod === "CASH" ? "Tunai" : "Debit"}
                              </Badge>
                              {activeShift && (
                                <Badge variant={t.shiftId === activeShift.id ? "default" : "outline"} className="text-xs">
                                  {t.shiftId === activeShift.id ? "Aktif" : "Sebelumnya"}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm font-medium">{fmt(t.totalAmount)}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(t.createdAt).toLocaleString()} • #{t.id}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t.transactionItems.length} item
                            </div>
                            {t.paymentMethod === "CASH" && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Uang: {fmt(t.cashAmount ?? 0)} • Kembali: {fmt(t.changeAmount ?? 0)}
                              </div>
                            )}
                          </div>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelected(t); }} className="gap-1 h-8 px-2">
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
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="w-full max-w-lg rounded-t-lg bg-white shadow-lg max-h-[90vh] overflow-auto animate-in slide-in-from-bottom">
              <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                <div className="font-semibold">Detail Transaksi</div>
                <Button size="sm" variant="secondary" onClick={() => setSelected(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={selected.paymentMethod === "CASH" ? "default" : "secondary"}>
                      {selected.paymentMethod === "CASH" ? "Tunai" : "Debit"}
                    </Badge>
                    {activeShift && (
                      <Badge variant={selected.shiftId === activeShift.id ? "default" : "outline"}>
                        {selected.shiftId === activeShift.id ? "Shift aktif" : "Shift sebelumnya"}
                      </Badge>
                    )}
                  </div>
                  <div className="text-lg font-semibold">{fmt(selected.totalAmount)}</div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Nomor:</span>
                    <span className="font-mono text-slate-700">#{selected.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu:</span>
                    <span className="text-slate-700">{new Date(selected.createdAt).toLocaleString()}</span>
                  </div>
                  {selected.paymentMethod === "CASH" ? (
                    <>
                      <div className="flex justify-between">
                        <span>Uang diterima:</span>
                        <span className="text-slate-700">{fmt(selected.cashAmount ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kembalian:</span>
                        <span className="text-slate-700">{fmt(selected.changeAmount ?? 0)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>Nomor kartu:</span>
                      <span className="text-slate-700">{selected.debitCardNumber ?? "-"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-medium mb-2">Item</div>
                  {selected.transactionItems.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Tidak ada item.</div>
                  ) : (
                    <div className="space-y-2">
                      {selected.transactionItems.map((it) => (
                        <div key={it.id} className="p-2 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{it.product?.name ?? it.productId}</div>
                              <div className="text-xs text-muted-foreground">{it.quantity} × {fmt(it.price)}</div>
                            </div>
                            <div className="text-sm font-semibold">{fmt(it.price * it.quantity)}</div>
                          </div>
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