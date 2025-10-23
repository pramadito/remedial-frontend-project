"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoxesIcon, UsersIcon, BarChart3Icon, LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/products", label: "Products", icon: BoxesIcon },
  { href: "/admin/cashiers", label: "Cashiers", icon: UsersIcon },
  { href: "/admin/reports", label: "Reports", icon: BarChart3Icon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r bg-gradient-to-b from-indigo-700 to-indigo-800 text-indigo-50">
      <div className="px-5 py-4 border-b/10 border-white/10">
        <Link href="/admin" className="block">
          <div className="text-lg font-semibold tracking-wide">Cashier Admin</div>
          <div className="text-xs text-indigo-200">Management Console</div>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
                (active
                  ? "bg-white/15 text-white"
                  : "text-indigo-100 hover:bg-white/10 hover:text-white")
              }
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t/10 border-white/10">
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("role");
            }
            signOut({ callbackUrl: "/sign-in" });
          }}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm py-2"
        >
          <LogOutIcon className="size-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
