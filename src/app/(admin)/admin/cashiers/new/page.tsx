"use client";

import { useRouter } from "next/navigation";
import AdminBreadcrumbs from "../../_components/AdminBreadcrumbs";
import CashierForm from "../_components/CashierForm";
import { useCreateCashier } from "../_hooks/useCreateCashier";

export default function AdminCashierNewPage() {
  const router = useRouter();
  const { mutateAsync: createCashier, isPending } = useCreateCashier();

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Cashiers", href: "/admin/cashiers" },
          { label: "Tambah" },
        ]}
      />
      <section className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-6 text-white shadow-sm">
        <h1 className="text-2xl font-semibold tracking-wide">Tambah Kasir</h1>
        <p className="text-indigo-100 text-sm">Isi formulir untuk menambahkan akun kasir</p>
      </section>
      <CashierForm
        mode="create"
        pending={isPending}
        onSubmit={async (vals) => {
          await createCashier({
            name: vals.name,
            email: vals.email,
            password: vals.password!,
          });
          router.replace("/admin/cashiers");
        }}
      />
    </div>
  );
}
