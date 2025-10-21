"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export const useRoleGuard = (allowed: string[], options?: { redirectTo?: string; message?: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const r = localStorage.getItem("role");
    setRole(r);
    if (!r) {
      setChecked(true);
      return;
    }
    if (!allowed.includes(r)) {
      const dest = options?.redirectTo ?? (r === "ADMIN" ? "/admin" : "/");
      if (options?.message) toast.error(options.message);
      router.replace(dest);
      return;
    }
    setIsAllowed(true);
    setChecked(true);
  }, [router, pathname, allowed, options?.redirectTo, options?.message]);

  return { checked, role, allowed: isAllowed };
};
