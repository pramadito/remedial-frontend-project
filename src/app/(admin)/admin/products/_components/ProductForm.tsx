"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/product";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Link from "next/link";

const schema = Yup.object({
  name: Yup.string().required("Nama wajib diisi"),
  price: Yup.number()
    .typeError("Harga harus berupa angka")
    .min(0, "Harga minimal 0")
    .required("Harga wajib diisi"),
  stock: Yup.number()
    .typeError("Stok harus berupa angka")
    .min(0, "Stok minimal 0")
    .required("Stok wajib diisi"),
  description: Yup.string().optional(),
});

export type ProductUpsertValues = {
  name: string;
  price: number | string;
  stock: number | string;
  description?: string;
};

export default function ProductForm({
  mode,
  initial,
  onSubmit,
  pending,
}: {
  mode: "create" | "edit";
  initial?: Product;
  pending?: boolean;
  onSubmit: (values: ProductUpsertValues) => Promise<void> | void;
}) {
  const initialValues: ProductUpsertValues = initial
    ? {
        name: initial.name,
        price: initial.price,
        stock: initial.stock,
        description: initial.description ?? "",
      }
    : { name: "", price: "", stock: "", description: "" };

  return (
    <Card className="max-w-lg">
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        enableReinitialize
        onSubmit={async (vals) => {
          const payload = {
            ...vals,
            price: Number(vals.price),
            stock: Number(vals.stock),
          };
          await onSubmit(payload);
        }}
      >
        <Form className="space-y-4">
          <CardHeader>
            <CardTitle>
              {mode === "create" ? "Tambah Produk" : "Edit Produk"}
            </CardTitle>
            <CardDescription>
              Isi informasi produk dengan benar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama</Label>
              <Field name="name" as={Input} placeholder="Nama produk" />
              <ErrorMessage
                name="name"
                component="p"
                className="text-sm text-red-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Harga</Label>
              <Field name="price" as={Input} placeholder="0" type="number" />
              <ErrorMessage
                name="price"
                component="p"
                className="text-sm text-red-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock">Stok</Label>
              <Field name="stock" as={Input} placeholder="0" type="number" />
              <ErrorMessage
                name="stock"
                component="p"
                className="text-sm text-red-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Field
                name="description"
                as={Input}
                placeholder="Deskripsi produk (opsional)"
              />
              <ErrorMessage
                name="description"
                component="p"
                className="text-sm text-red-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-end gap-2">
            <Button asChild variant="outline" type="button">
              <Link href="/admin/products">Batal</Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {mode === "create" ? "Simpan" : "Update"}
            </Button>
          </CardFooter>
        </Form>
      </Formik>
    </Card>
  );
}
