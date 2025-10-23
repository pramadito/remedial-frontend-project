"use client";

import { useRouter } from "next/navigation";
import ProductForm from "../_components/ProductForm";
import { useCreateProduct } from "../_hooks/useCreateProduct";
import AdminBreadcrumbs from "../../_components/AdminBreadcrumbs";

export default function AdminProductNewPage() {
  const router = useRouter();
  const { mutateAsync: createProduct, isPending } = useCreateProduct();

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Tambah" },
        ]}
      />
      <section className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-6 text-white shadow-sm">
        <h1 className="text-2xl font-semibold tracking-wide">Tambah Produk</h1>
        <p className="text-indigo-100 text-sm">Isi formulir untuk menambahkan produk baru</p>
      </section>
      <ProductForm
        mode="create"
        pending={isPending}
        onSubmit={async (vals) => {
          await createProduct({
            name: vals.name,
            price: Number(vals.price),
            stock: Number(vals.stock),
            description: vals.description,
          });
          router.replace("/admin/products");
        }}
      />
    </div>
  );
}
