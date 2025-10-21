"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Cashier } from "@/types/cashier";
import AdminBreadcrumbs from "../_components/AdminBreadcrumbs";
import { useCashiers } from "./_hooks/useCashiers";
import { useDeleteCashier } from "./_hooks/useDeleteCashier";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

export default function AdminCashiersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const initialPage = Number(searchParams.get("page") ?? "1") || 1;
  const [q, setQ] = useState(initialQ);
  const [page, setPage] = useState(initialPage);
  const pageSize = 10;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: cashiers, isLoading } = useCashiers(q || undefined);
  const { mutateAsync: deleteCashier, isPending: isDeleting } = useDeleteCashier();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (q) params.set("q", q); else params.delete("q");
    params.set("page", String(page));
    router.replace(`/admin/cashiers?${params.toString()}`);
  }, [q, page, router]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const filtered: Cashier[] = useMemo(() => {
    if (!cashiers) return [];
    return cashiers;
  }, [cashiers]);

  const onDelete = async (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Cashiers" }]} />
      <section className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-6 text-white shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">Cashiers</h1>
            <p className="text-indigo-100 text-sm">Kelola akun kasir</p>
          </div>
          <Button asChild className="bg-white text-indigo-700 hover:bg-white/90">
            <Link href="/admin/cashiers/new">Tambah Kasir</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-xl bg-white border shadow-sm p-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Cari kasir (nama/email)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10"
          />
          {q ? (
            <Button variant="secondary" onClick={() => setQ("")}>Reset</Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl bg-white border shadow-sm p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-indigo-50/60 text-indigo-900">
                <tr className="text-left">
                  <th className="py-3 pl-4 pr-4 w-full max-w-xs">Nama</th>
                  <th className="py-3 pr-4 whitespace-nowrap w-1/12">Email</th>
                  <th className="py-3 pr-4 whitespace-nowrap w-px">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-indigo-50/40">
                    <td className="py-3 pl-4 pr-4 font-medium align-middle">{c.name}</td>
                    <td className="py-3 pr-4 align-middle whitespace-nowrap">{c.email}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-right align-middle">
                      <div className="grid grid-flow-col auto-cols-max items-center gap-2 justify-end whitespace-nowrap">
                        <Button variant="secondary" size="sm" asChild className="bg-indigo-600 text-white hover:bg-indigo-500">
                          <Link href={`/admin/cashiers/${c.id}`}>Edit</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => onDelete(c.id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Pagination className="py-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.max(1, p - 1));
              }}/>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              {page}/{totalPages}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.min(totalPages, p + 1));
              }}/>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus kasir?"
        description="Tindakan ini akan melakukan soft-delete jika tidak ada shift aktif."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={async () => {
          if (deleteId) {
            await deleteCashier(deleteId);
            toast.success("Kasir dihapus");
          }
        }}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
