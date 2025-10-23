"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoxesIcon, UsersIcon, BarChart3Icon, LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/admin/products", label: "Products", icon: BoxesIcon },
  { href: "/admin/cashiers", label: "Cashiers", icon: UsersIcon },
  { href: "/admin/reports", label: "Reports", icon: BarChart3Icon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && window.innerWidth < 768) {
        const target = e.target as HTMLElement;
        if (!target.closest(".sidebar-container")) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-indigo-700 text-white"
        aria-label="Toggle menu"
      >
        {isOpen ? <XIcon className="size-6" /> : <MenuIcon className="size-6" />}
      </button>

      {/* Top Navigation Bar - Fixed on all screen sizes */}
      <header
        className={`sidebar-container fixed inset-x-0 top-0 z-40 w-full border-b bg-gradient-to-r from-indigo-700 to-indigo-800 text-indigo-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "-translate-y-full md:translate-y-0"
        } ${!isOpen ? "md:flex" : "flex"}`}
      >
        <div className="flex items-center justify-between w-full px-5 py-4">
          <Link href="/admin" className="block">
            <div className="text-lg font-semibold tracking-wide">Cashier Admin</div>
            <div className="text-xs text-indigo-200">Management Console</div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
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
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("role");
                }
                signOut({ callbackUrl: "/login" });
              }}
              className="flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-2 ml-2"
            >
              <LogOutIcon className="size-4" /> Sign out
            </button>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex flex-col px-2 pb-4 space-y-1">
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
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("role");
              }
              signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm py-2"
          >
            <LogOutIcon className="size-4" /> Sign out
          </button>
        </nav>
      </header>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}