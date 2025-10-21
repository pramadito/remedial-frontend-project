"use client";

import { useParams, useRouter } from "next/navigation";
import AdminBreadcrumbs from "../../_components/AdminBreadcrumbs";
import CashierForm from "../_components/CashierForm";
import { useCashier } from "../_hooks/useCashier";
import { useUpdateCashier } from "../_hooks/useUpdateCashier";

export default function AdminCashierEditPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { data: cashier, isLoading } = useCashier(id);
  const { mutateAsync: updateCashier, isPending } = useUpdateCashier();

  if (isLoading || !cashier) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Cashiers", href: "/admin/cashiers" },
          { label: "Edit" },
        ]}
      />
      <section className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-6 text-white shadow-sm">
        <h1 className="text-2xl font-semibold tracking-wide">Edit Kasir</h1>
        <p className="text-indigo-100 text-sm">Perbarui informasi akun kasir</p>
      </section>
      <CashierForm
        mode="edit"
        initial={cashier}
        pending={isPending}
        onSubmit={async (vals) => {
          await updateCashier({ id, name: vals.name, email: vals.email, password: vals.password });
          router.replace("/admin/cashiers");
        }}
      />
    </div>
  );
}
