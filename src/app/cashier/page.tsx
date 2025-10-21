"use client";

import { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/app/admin/products/_hooks/useProducts";
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

  const checkout = async () => {
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
    } catch {
      // handled by hook onError
    }
  };

  if (!checked) return null;
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-6 text-white shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">Kasir</h1>
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
          <CardHeader className="gap-2">
            <CardTitle>Produk</CardTitle>
            <CardDescription>Cari dan tambahkan ke keranjang</CardDescription>
            <div className="flex gap-3">
              <Input
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm">Loading...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border p-3 text-left hover:border-indigo-300 hover:bg-indigo-50/40"
                  >
                    <div className="font-medium line-clamp-2">{p.name}</div>
                    <div className="text-xs text-muted-foreground">Rp {p.price.toLocaleString()}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">Stok: {p.stock}</div>
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-full bg-indigo-600 text-white hover:bg-indigo-500"
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
            <CardHeader>
              <CardTitle>Keranjang</CardTitle>
              <CardDescription>Produk yang dipilih</CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada item.</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((it) => (
                    <div key={it.id} className="flex items-center justify-between gap-2 rounded-lg border p-2">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-muted-foreground">Rp {it.price.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" onClick={() => dec(it.id)}>-</Button>
                        <div className="w-8 text-center text-sm">{it.qty}</div>
                        <Button size="icon" variant="outline" onClick={() => inc(it.id)}>+</Button>
                        <Button size="sm" variant="ghost" onClick={() => removeItem(it.id)} className="text-red-600">Hapus</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-sm">Subtotal</div>
              <div className="font-semibold">Rp {totals.subtotal.toLocaleString()}</div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pembayaran</CardTitle>
              <CardDescription>Pilih metode pembayaran</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={payment === "CASH" ? "default" : "outline"}
                  onClick={() => setPayment("CASH")}
                  disabled={!activeShift}
                >
                  Tunai
                </Button>
                <Button
                  type="button"
                  variant={payment === "DEBIT" ? "default" : "outline"}
                  onClick={() => setPayment("DEBIT")}
                  disabled={!activeShift}
                >
                  Debit
                </Button>
              </div>

              {payment === "CASH" ? (
                <div className="grid gap-2">
                  <label className="text-sm" htmlFor="cash">Uang diterima</label>
                  <Input id="cash" value={cashGiven} onChange={(e) => setCashGiven(e.target.value)} placeholder="0" disabled={!activeShift} />
                  <div className="text-sm text-muted-foreground">Kembalian: <span className="font-medium text-emerald-600">Rp {change.toLocaleString()}</span></div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <label className="text-sm" htmlFor="card">Nomor Kartu</label>
                  <Input id="card" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" disabled={!activeShift} />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Button variant="outline" onClick={resetCart}>Bersihkan</Button>
              <Button onClick={checkout} disabled={!activeShift || cart.length === 0 || submitting}>Bayar</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
