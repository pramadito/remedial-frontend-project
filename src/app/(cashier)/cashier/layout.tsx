"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveShift } from "./_hooks/useShiftApi";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { signOut } from "next-auth/react";
import { LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const { checked, allowed } = useRoleGuard(["CASHIER"], { message: "Halaman kasir hanya untuk role CASHIER", redirectTo: "/admin" });
  const pathname = usePathname();
  const { data: activeShift } = useActiveShift(allowed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const tabs = [
    { href: "/cashier", label: "POS" },
    { href: "/cashier/transactions", label: "Transaksi" },
    { href: "/cashier/shift", label: "Shift" },
  ];

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!checked) return null;
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="font-semibold">Kasir</div>
          
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`px-3 py-1.5 rounded-md hover:bg-slate-100 ${
                  pathname === t.href ? "bg-slate-100 font-medium" : "text-slate-700"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-1 rounded-md hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
          
          {/* Desktop Shift Status & Logout */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {activeShift ? (
              <>
                <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-1">
                  Shift aktif · {new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Link href="/cashier/shift" className="px-2 py-1 rounded-md border hover:bg-slate-50">Kelola</Link>
              </>
            ) : (
              <>
                <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-1">Belum mulai shift</span>
                <Link href="/cashier/shift" className="px-2 py-1 rounded-md border hover:bg-slate-50">Mulai</Link>
              </>
            )}
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("role");
                }
                signOut({ callbackUrl: "/login" });
              }}
              className="px-2 py-1 rounded-md border hover:bg-slate-50 flex items-center gap-1 text-slate-700"
            >
              <LogOutIcon className="size-4" /> Keluar
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-3">
              <nav className="flex flex-col space-y-1">
                {tabs.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`px-3 py-2 rounded-md hover:bg-slate-100 ${
                      pathname === t.href ? "bg-slate-100 font-medium" : "text-slate-700"
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </nav>
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-3">
                  {activeShift ? (
                    <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs">
                      Shift aktif · {new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-1 text-xs">Belum mulai shift</span>
                  )}
                  <Link href="/cashier/shift" className="px-2 py-1 rounded-md border hover:bg-slate-50 text-xs">
                    {activeShift ? "Kelola" : "Mulai"}
                  </Link>
                </div>
                
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("accessToken");
                      localStorage.removeItem("role");
                    }
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full px-3 py-2 rounded-md border hover:bg-slate-50 flex items-center justify-center gap-2 text-slate-700 text-sm"
                >
                  <LogOutIcon className="size-4" /> Keluar
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}