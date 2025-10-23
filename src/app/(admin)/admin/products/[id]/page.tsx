"use client";

import { useParams, useRouter } from "next/navigation";
import ProductForm from "../_components/ProductForm";
import { useProduct } from "../_hooks/useProduct";
import { useUpdateProduct } from "../_hooks/useUpdateProduct";
import AdminBreadcrumbs from "../../_components/AdminBreadcrumbs";

export default function AdminProductEditPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { data: product, isLoading } = useProduct(id);
  const { mutateAsync: updateProduct, isPending } = useUpdateProduct();

  if (isLoading || !product) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Edit" },
        ]}
      />
      <section className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-6 text-white shadow-sm">
        <h1 className="text-2xl font-semibold tracking-wide">Edit Produk</h1>
        <p className="text-indigo-100 text-sm">Perbarui informasi produk</p>
      </section>
      <ProductForm
        mode="edit"
        initial={product}
        pending={isPending}
        onSubmit={async (vals) => {
          await updateProduct({
            id,
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
