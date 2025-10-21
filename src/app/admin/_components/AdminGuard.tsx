"use client";

import { useRoleGuard } from "@/hooks/useRoleGuard";

export default function AdminGuard() {
  useRoleGuard(["ADMIN"], {
    message: "Halaman admin hanya untuk role ADMIN",
    redirectTo: "/cashier",
  });
  return null;
}
