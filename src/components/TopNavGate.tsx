"use client";

import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

export default function TopNavGate() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/cashier")) return null;
  return <Navbar />;
}
