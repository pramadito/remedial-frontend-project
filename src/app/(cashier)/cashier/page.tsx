"use client";

import { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/app/(admin)/admin/products/_hooks/useProducts";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useActiveShift } from "./_hooks/useShiftApi";
import { usePosCheckout } from "./_hooks/usePosCheckout";
import { useRouter } from "next/navigation";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type PaymentMethod = "CASH" | "DEBIT";

export default function CashierPOSPage() {
  const router = useRouter();
  const { checked, allowed } = useRoleGuard(["CASHIER"], { message: "Halaman kasir hanya untuk role CASHIER", redirectTo: "/admin" });
  const { data: products, isLoading } = useProducts();
  const { data: activeShift, isLoading: loadingShift } = useActiveShift(allowed);
  const { mutateAsync: posCheckout, isPending: submitting } = usePosCheckout();

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>("CASH");
  const [cashGiven, setCashGiven] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const filtered: Product[] = useMemo(() => {
    if (!products) return [];
    if (!search) return products;
    const term = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, search]);

  useEffect(() => {
    if (!allowed) return; // layout will redirect for non-cashier
    // No redirect; allow viewing POS without active shift
  }, [allowed]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, it) => acc + it.price * it.qty, 0);
    return { subtotal };
  }, [cart]);

  const change = useMemo(() => {
    if (payment !== "CASH") return 0;
    const c = Number(cashGiven || 0);
    if (Number.isNaN(c)) return 0;
    return Math.max(0, c - totals.subtotal);
  }, [payment, cashGiven, totals.subtotal]);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const found = prev.find((it) => it.id === p.id);
      if (found) {
        return prev.map((it) =>
          it.id === p.id ? { ...it, qty: it.qty + 1 } : it
        );
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const inc = (id: string) => {
    setCart((prev) => prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it)));
  };

  const dec = (id: string) => {
    setCart((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it))
        .filter((it) => it.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  };

  const resetCart = () => {
    setCart([]);
    setCashGiven("");
    setCardNumber("");
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }
    if (!activeShift) {
      toast.error("Mulai shift terlebih dahulu untuk melakukan transaksi");
      return;
    }
    if (payment === "CASH") {
      const c = Number(cashGiven);
      if (Number.isNaN(c) || c < totals.subtotal) {
        toast.error("Uang tunai kurang");
        return;
      }
    }
    if (payment === "DEBIT" && !cardNumber) {
      toast.error("Nomor kartu debit wajib diisi");
      return;
    }
    // Show confirmation dialog instead of directly processing checkout
    setShowConfirmDialog(true);
  };

  const checkout = async () => {
    // Add null check for activeShift
    if (!activeShift) {
      toast.error("Shift tidak valid. Silakan mulai shift kembali.");
      setShowConfirmDialog(false);
      return;
    }
    
    const payload = {
      shiftId: activeShift.id,
      paymentMethod: payment,
      cashAmount: payment === "CASH" ? Number(cashGiven || 0) : undefined,
      debitCardNumber: payment === "DEBIT" ? cardNumber : undefined,
      items: cart.map((it) => ({ productId: it.id, quantity: it.qty })),
    };
    try {
      await posCheckout(payload);
      toast.success("Transaksi berhasil");
      resetCart();
      setShowConfirmDialog(false);
    } catch {
      // handled by hook onError
    }
  };

  if (!checked) return null;
  return (
    <div className="space-y-6 px-2 sm:px-0">
      <section className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-6 text-white shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">Kasir</h1>
            <p className="text-indigo-100 text-sm">Point of Sale</p>
          </div>
        </div>
      </section>

      {!activeShift && !loadingShift && (
        <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
          Belum ada shift aktif. Silakan mulai shift pada halaman <a href="/cashier/shift" className="underline">Shift</a> untuk bertransaksi.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Products */}
        <Card className="lg:col-span-2">
          <CardHeader className="gap-2 pb-3">
            <CardTitle className="text-lg">Produk</CardTitle>
            <CardDescription className="text-sm">Cari dan tambahkan ke keranjang</CardDescription>
            <div className="flex gap-3">
              <Input
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm">Loading...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border p-3 text-left hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors"
                  >
                    <div className="font-medium text-sm line-clamp-2">{p.name}</div>
                    <div className="text-xs text-muted-foreground">Rp {p.price.toLocaleString()}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">Stok: {p.stock}</div>
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-full bg-indigo-600 text-white hover:bg-indigo-500 text-xs sm:text-sm h-8 sm:h-9"
                        onClick={() => addToCart(p)}
                      >
                        Tambah
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cart & Payment */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Keranjang</CardTitle>
              <CardDescription className="text-sm">Produk yang dipilih</CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada item.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((it) => (
                    <div key={it.id} className="flex items-center justify-between gap-2 rounded-lg border p-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{it.name}</div>
                        <div className="text-xs text-muted-foreground">Rp {it.price.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button size="icon" variant="outline" onClick={() => dec(it.id)} className="h-7 w-7 sm:h-8 sm:w-8">-</Button>
                        <div className="w-6 sm:w-8 text-center text-sm">{it.qty}</div>
                        <Button size="icon" variant="outline" onClick={() => inc(it.id)} className="h-7 w-7 sm:h-8 sm:w-8">+</Button>
                        <Button size="sm" variant="ghost" onClick={() => removeItem(it.id)} className="text-red-600 h-7 w-7 sm:h-8 sm:w-8 p-0">
                          <span className="sr-only">Hapus</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-3">
              <div className="text-sm">Subtotal</div>
              <div className="font-semibold">Rp {totals.subtotal.toLocaleString()}</div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pembayaran</CardTitle>
              <CardDescription className="text-sm">Pilih metode pembayaran</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={payment === "CASH" ? "default" : "outline"}
                  onClick={() => setPayment("CASH")}
                  disabled={!activeShift}
                  className="flex-1 text-sm"
                >
                  Tunai
                </Button>
                <Button
                  type="button"
                  variant={payment === "DEBIT" ? "default" : "outline"}
                  onClick={() => setPayment("DEBIT")}
                  disabled={!activeShift}
                  className="flex-1 text-sm"
                >
                  Debit
                </Button>
              </div>

              {payment === "CASH" ? (
                <div className="grid gap-2">
                  <label className="text-sm" htmlFor="cash">Uang diterima</label>
                  <Input id="cash" value={cashGiven} onChange={(e) => setCashGiven(e.target.value)} placeholder="0" disabled={!activeShift} className="text-sm" />
                  <div className="text-sm text-muted-foreground">Kembalian: <span className="font-medium text-emerald-600">Rp {change.toLocaleString()}</span></div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <label className="text-sm" htmlFor="card">Nomor Kartu</label>
                  <Input id="card" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" disabled={!activeShift} className="text-sm" />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-3">
              <Button variant="outline" onClick={resetCart} className="text-sm">Bersihkan</Button>
              <Button onClick={handleCheckout} disabled={!activeShift || cart.length === 0 || submitting} className="text-sm">
                Bayar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription>
              Periksa kembali detail pesanan Anda sebelum melanjutkan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Detail Pesanan:</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.qty}</span>
                    <span>Rp {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>Rp {totals.subtotal.toLocaleString()}</span>
                </div>
                {payment === "CASH" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Uang Diberikan:</span>
                      <span>Rp {Number(cashGiven).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Kembalian:</span>
                      <span>Rp {change.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm mt-1">
                  <span>Metode Pembayaran:</span>
                  <span>{payment === "CASH" ? "Tunai" : "Debit"}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Batal
            </Button>
            <Button onClick={checkout} disabled={submitting}>
              {submitting ? "Memproses..." : "Konfirmasi Pembayaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}