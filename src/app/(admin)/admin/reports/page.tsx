"use client";

import { useEffect, useMemo, useState } from "react";
import AdminBreadcrumbs from "../_components/AdminBreadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDailyReport, useMismatches, useSummaryReport } from "./_hooks/useReports";
import { DailyReport, ShiftSummary, SummaryReport } from "@/types/report";
import { useAdminTransactions } from "./_hooks/useAdminTransactions";
import type { Transaction } from "@/types/transaction";
import { Eye } from "lucide-react";

const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const rangePreset = (type: "today" | "7" | "30" | "month"): [string, string] => {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);
  if (type === "today") {
    // start = end
  } else if (type === "7") {
    start.setDate(start.getDate() - 6);
  } else if (type === "30") {
    start.setDate(start.getDate() - 29);
  } else if (type === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const toStr = (d: Date) => d.toISOString().slice(0, 10);
  return [toStr(start), toStr(end)];
};

export default function AdminReportsPage() {
  // Daily report date
  const [date, setDate] = useState<string>(() => todayStr());
  const { data: daily, isLoading: loadingDaily, refetch: refetchDaily } = useDailyReport(date, true);

  // Mismatch range
  const [start, setStart] = useState<string>(() => todayStr());
  const [end, setEnd] = useState<string>(() => todayStr());
  const { data: mismatches, isLoading: loadingMismatch, refetch: refetchMismatch } = useMismatches(start, end, true);

  // Period summary (Periode tab)
  const [sumStart, setSumStart] = useState<string>(() => todayStr());
  const [sumEnd, setSumEnd] = useState<string>(() => todayStr());
  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useSummaryReport(sumStart, sumEnd, true);

  // Tabs
  const [activeTab, setActiveTab] = useState<"daily" | "period" | "tx" | "mismatch">("daily");

  // Transactions tab
  const [txFrom, setTxFrom] = useState<string>(() => todayStr());
  const [txTo, setTxTo] = useState<string>(() => todayStr());
  const { data: txs, isLoading: loadingTx, refetch: refetchTx } = useAdminTransactions(txFrom, txTo, true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => { refetchDaily(); }, [date, refetchDaily]);
  useEffect(() => { refetchMismatch(); }, [start, end, refetchMismatch]);

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]} />

      {/* Header */}
      <section className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-6 text-white shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">Reports</h1>
            <p className="text-indigo-100 text-sm">Laporan penjualan dan validasi shift</p>
          </div>
          <div className="hidden sm:block text-indigo-100 text-sm"></div>
        </div>
      </section>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2">
        <Button size="sm" variant={activeTab === "daily" ? "default" : "outline"} onClick={() => setActiveTab("daily")}>Harian</Button>
        <Button size="sm" variant={activeTab === "period" ? "default" : "outline"} onClick={() => setActiveTab("period")}>Periode</Button>
        <Button size="sm" variant={activeTab === "tx" ? "default" : "outline"} onClick={() => setActiveTab("tx")}>Transaksi</Button>
        <Button size="sm" variant={activeTab === "mismatch" ? "default" : "outline"} onClick={() => setActiveTab("mismatch")}>Mismatch</Button>
      </div>

      {/* Harian */}
      {activeTab === "daily" && (
      <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Ringkasan Harian</CardTitle>
              <CardDescription>{new Date(date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingDaily || !daily ? (
            <p className="text-sm">Memuat...</p>
          ) : (
            <DailySummary daily={daily} />
          )}
        </CardContent>
      </Card>

      {/* Per item */}
      <Card>
        <CardHeader>
          <CardTitle>Penjualan Per Item (Harian)</CardTitle>
          <CardDescription>Akumulasi jumlah dan omzet per produk</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDaily || !daily ? (
            <p className="text-sm">Memuat...</p>
          ) : daily.perItem.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-indigo-50/60 text-indigo-900">
                  <tr className="text-left">
                    <th className="py-2 pl-3 pr-4">Produk</th>
                    <th className="py-2 pr-4">Qty</th>
                    <th className="py-2 pr-3 text-right">Omzet</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.perItem.map((it) => (
                    <tr key={it.productId} className="border-t">
                      <td className="py-2 pl-3 pr-4">{it.name}</td>
                      <td className="py-2 pr-4">{it.quantity}</td>
                      <td className="py-2 pr-3 text-right">{fmt(it.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shifts of the day */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Pada Hari Ini</CardTitle>
          <CardDescription>Rincian per shift: kasir, total transaksi, uang awal/akhir, dan mismatch</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDaily || !daily ? (
            <p className="text-sm">Memuat...</p>
          ) : daily.shifts.length === 0 ? (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tidak ada shift pada hari ini.</p>
              {daily.totals.count > 0 && (
                <p className="text-xs text-muted-foreground">Terdapat transaksi pada tanggal ini namun tidak tercatat dalam shift aktif.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-indigo-50/60 text-indigo-900">
                  <tr className="text-left">
                    <th className="py-2 pl-3 pr-4">Kasir</th>
                    <th className="py-2 pr-4">Waktu</th>
                    <th className="py-2 pr-4 text-right">Total</th>
                    <th className="py-2 pr-4 text-right">Tunai</th>
                    <th className="py-2 pr-4 text-right">Debit</th>
                    <th className="py-2 pr-4 text-right">Uang Awal</th>
                    <th className="py-2 pr-4 text-right">Uang Akhir</th>
                    <th className="py-2 pr-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.shifts.map((s) => (
                    <ShiftRow key={s.id} s={s} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      )}

      {/* Periode */}
      {activeTab === "period" && (
      <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Periode</CardTitle>
          <CardDescription>Akumulasi transaksi dan penjualan per item dalam rentang tanggal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Dari</label>
              <Input type="date" value={sumStart} onChange={(e) => setSumStart(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Sampai</label>
              <Input type="date" value={sumEnd} onChange={(e) => setSumEnd(e.target.value)} />
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("today"); setSumStart(s); setSumEnd(e); refetchSummary(); }}>Hari ini</Button>
              <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("7"); setSumStart(s); setSumEnd(e); refetchSummary(); }}>7 hari</Button>
              <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("30"); setSumStart(s); setSumEnd(e); refetchSummary(); }}>30 hari</Button>
              <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("month"); setSumStart(s); setSumEnd(e); refetchSummary(); }}>Bulan ini</Button>
            </div>
            <Button size="sm" variant="secondary" onClick={() => refetchSummary()}>Terapkan</Button>
          </div>

          {loadingSummary || !summary ? (
            <p className="text-sm">Memuat...</p>
          ) : (
            <>
              <PeriodSummary summary={summary} />
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-indigo-50/60 text-indigo-900">
                    <tr className="text-left">
                      <th className="py-2 pl-3 pr-4">Produk</th>
                      <th className="py-2 pr-4 text-right">Qty</th>
                      <th className="py-2 pr-3 text-right">Omzet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.perItem.map((it) => (
                      <tr key={it.productId} className="border-t">
                        <td className="py-2 pl-3 pr-4">{it.name}</td>
                        <td className="py-2 pr-4 text-right">{it.quantity}</td>
                        <td className="py-2 pr-3 text-right">{fmt(it.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
      )}

      {/* Transaksi (per transaksi) */}
      {activeTab === "tx" && (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Transaksi</CardTitle>
            <CardDescription>Filter berdasarkan rentang tanggal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Dari</label>
                <Input type="date" value={txFrom} onChange={(e) => setTxFrom(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Sampai</label>
                <Input type="date" value={txTo} onChange={(e) => setTxTo(e.target.value)} />
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("today"); setTxFrom(s); setTxTo(e); refetchTx(); }}>Hari ini</Button>
                <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("7"); setTxFrom(s); setTxTo(e); refetchTx(); }}>7 hari</Button>
                <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("30"); setTxFrom(s); setTxTo(e); refetchTx(); }}>30 hari</Button>
                <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("month"); setTxFrom(s); setTxTo(e); refetchTx(); }}>Bulan ini</Button>
              </div>
              <Button size="sm" variant="secondary" onClick={() => refetchTx()}>Terapkan</Button>
            </div>

            {loadingTx ? (
              <p className="text-sm">Memuat...</p>
            ) : !txs || txs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada transaksi pada periode ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-indigo-50/60 text-indigo-900">
                    <tr className="text-left">
                      <th className="py-2 pl-3 pr-4">Waktu</th>
                      <th className="py-2 pr-4">ID</th>
                      <th className="py-2 pr-4">Metode</th>
                      <th className="py-2 pr-4">Kasir</th>
                      <th className="py-2 pr-4 text-right">Total</th>
                      <th className="py-2 pr-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map((t) => (
                      <tr key={t.id} className="border-t hover:bg-indigo-50/30">
                        <td className="py-2 pl-3 pr-4">{new Date(t.createdAt).toLocaleString()}</td>
                        <td className="py-2 pr-4 font-mono text-xs">#{t.id}</td>
                        <td className="py-2 pr-4">{t.paymentMethod === "CASH" ? "Tunai" : "Debit"}</td>
                        <td className="py-2 pr-4">{t.shift?.cashier?.name ?? "-"}</td>
                        <td className="py-2 pr-4 text-right">{fmt(t.totalAmount)}</td>
                        <td className="py-2 pr-3 text-right">
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => setSelectedTx(t)}>
                            <Eye className="size-4" /> Detail
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        {selectedTx && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedTx(null)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
                <div className="border-b px-4 py-3 flex items-center justify-between">
                  <div className="font-semibold">Detail Transaksi</div>
                  <Button size="sm" variant="secondary" onClick={() => setSelectedTx(null)}>Tutup</Button>
                </div>
                <div className="p-4 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px]">
                        {selectedTx.paymentMethod === "CASH" ? "Tunai" : "Debit"}
                      </span>
                      {selectedTx.shift?.cashier?.name && (
                        <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px]">
                          {selectedTx.shift.cashier.name}
                        </span>
                      )}
                    </div>
                    <div className="text-base font-semibold">{fmt(selectedTx.totalAmount)}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Nomor: <span className="font-mono text-slate-700">#{selectedTx.id}</span></div>
                    <div>Waktu: {new Date(selectedTx.createdAt).toLocaleString()}</div>
                    {selectedTx.paymentMethod === "CASH" ? (
                      <>
                        <div>Uang diterima: <span className="text-slate-700">{fmt(selectedTx.cashAmount ?? 0)}</span></div>
                        <div>Kembalian: <span className="text-slate-700">{fmt(selectedTx.changeAmount ?? 0)}</span></div>
                      </>
                    ) : (
                      <div className="md:col-span-2">Nomor kartu: <span className="text-slate-700">{selectedTx.debitCardNumber ?? "-"}</span></div>
                    )}
                  </div>

                  <div className="mt-1">
                    <div className="font-medium mb-1">Item</div>
                    {selectedTx.transactionItems.length === 0 ? (
                      <div className="text-xs text-muted-foreground">Tidak ada item.</div>
                    ) : (
                      <div className="border rounded-md divide-y">
                        {selectedTx.transactionItems.map((it) => (
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
      )}

      {/* Mismatches */}
      {activeTab === "mismatch" && (
      <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Tidak Sesuai (Mismatch)</CardTitle>
          <CardDescription>Daftar shift dengan kas akhir tidak sesuai dalam rentang tanggal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Dari</label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Sampai</label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("today"); setStart(s); setEnd(e); refetchMismatch(); }}>Hari ini</Button>
              <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("7"); setStart(s); setEnd(e); refetchMismatch(); }}>7 hari</Button>
              <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("30"); setStart(s); setEnd(e); refetchMismatch(); }}>30 hari</Button>
              <Button size="sm" variant="ghost" onClick={() => { const [s,e]=rangePreset("month"); setStart(s); setEnd(e); refetchMismatch(); }}>Bulan ini</Button>
            </div>
            <Button size="sm" variant="secondary" onClick={() => refetchMismatch()}>Terapkan</Button>
          </div>

          {loadingMismatch || !mismatches ? (
            <p className="text-sm">Memuat...</p>
          ) : mismatches.shifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada mismatch pada periode ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-rose-50/80 text-rose-900">
                  <tr className="text-left">
                    <th className="py-2 pl-3 pr-4">Kasir</th>
                    <th className="py-2 pr-4">Mulai</th>
                    <th className="py-2 pr-4">Selesai</th>
                    <th className="py-2 pr-4 text-right">Uang Awal</th>
                    <th className="py-2 pr-4 text-right">Uang Akhir</th>
                    <th className="py-2 pr-4 text-right">Seharusnya</th>
                    <th className="py-2 pr-4 text-right">Selisih</th>
                    <th className="py-2 pr-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mismatches.shifts.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="py-2 pl-3 pr-4">{s.cashier?.name ?? "-"}</td>
                      <td className="py-2 pr-4">{new Date(s.startTime).toLocaleString()}</td>
                      <td className="py-2 pr-4">{s.endTime ? new Date(s.endTime).toLocaleString() : "-"}</td>
                      <td className="py-2 pr-4 text-right">{fmt(s.startMoney)}</td>
                      <td className="py-2 pr-4 text-right">{typeof s.endMoney === "number" ? fmt(s.endMoney) : "-"}</td>
                      <td className="py-2 pr-4 text-right">{fmt(s.expectedCash)}</td>
                      <td className="py-2 pr-4 text-right">
                        {(() => { const diff = (s.endMoney ?? 0) - s.expectedCash; const sign = diff >= 0 ? "+" : "-"; return (
                          <span className={diff === 0 ? "text-slate-700" : diff > 0 ? "text-emerald-700" : "text-rose-700"}>
                            {sign}{fmt(Math.abs(diff))}
                          </span>
                        ); })()}
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[11px]">Tidak sesuai</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      )}
    </div>
  );
}

function DailySummary({ daily }: { daily: DailyReport }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <div className="text-muted-foreground">Jumlah transaksi</div>
        <div className="font-semibold">{daily.totals.count}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Total</div>
        <div className="font-semibold">{fmt(daily.totals.totalAmount)}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Tunai</div>
        <div className="font-semibold">{fmt(daily.totals.cashTotal)}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Debit</div>
        <div className="font-semibold">{fmt(daily.totals.debitTotal)}</div>
      </div>
    </div>
  );
}

function PeriodSummary({ summary }: { summary: SummaryReport }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <div className="text-muted-foreground">Periode</div>
        <div className="font-semibold">{summary.start} → {summary.end}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Jumlah transaksi</div>
        <div className="font-semibold">{summary.totals.count}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Total</div>
        <div className="font-semibold">{fmt(summary.totals.totalAmount)}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Tunai / Debit</div>
        <div className="font-semibold">{fmt(summary.totals.cashTotal)} / {fmt(summary.totals.debitTotal)}</div>
      </div>
    </div>
  );
}

function ShiftRow({ s }: { s: ShiftSummary }) {
  return (
    <tr className="border-t">
      <td className="py-2 pl-3 pr-4">{s.cashier?.name ?? "-"}</td>
      <td className="py-2 pr-4">
        <div>{new Date(s.startTime).toLocaleString()} - {s.endTime ? new Date(s.endTime).toLocaleString() : "(aktif)"}</div>
      </td>
      <td className="py-2 pr-4">{fmt(s.totals.totalAmount)}</td>
      <td className="py-2 pr-4">{fmt(s.totals.cashTotal)}</td>
      <td className="py-2 pr-4">{fmt(s.totals.debitTotal)}</td>
      <td className="py-2 pr-4">{fmt(s.startMoney)}</td>
      <td className="py-2 pr-4">{typeof s.endMoney === "number" ? fmt(s.endMoney) : "-"}</td>
      <td className="py-2 pr-3 text-right">
        {s.mismatch ? (
          <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[11px]">Tidak sesuai</span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px]">Sesuai</span>
        )}
      </td>
    </tr>
  );
}
