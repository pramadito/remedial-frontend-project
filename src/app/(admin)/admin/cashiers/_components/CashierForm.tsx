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
import { Cashier } from "@/types/cashier";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Link from "next/link";
import * as Yup from "yup";

export type CashierUpsertValues = {
  name: string;
  email: string;
  password?: string;
};

export default function CashierForm({
  mode,
  initial,
  pending,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Cashier;
  pending?: boolean;
  onSubmit: (values: CashierUpsertValues) => Promise<void> | void;
}) {
  const schema = Yup.object({
    name: Yup.string().required("Nama wajib diisi"),
    email: Yup.string().email("Email tidak valid").required("Email wajib diisi"),
    password:
      mode === "create"
        ? Yup.string().min(6, "Min 6 karakter").required("Password wajib diisi")
        : Yup.string().min(6, "Min 6 karakter").optional(),
  });

  const initialValues: CashierUpsertValues = initial
    ? { name: initial.name, email: initial.email, password: "" }
    : { name: "", email: "", password: "" };

  return (
    <Card className="max-w-lg">
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        enableReinitialize
        onSubmit={async (vals) => {
          const payload: CashierUpsertValues = {
            name: vals.name,
            email: vals.email,
            password: vals.password || undefined,
          };
          await onSubmit(payload);
        }}
      >
        <Form className="space-y-4">
          <CardHeader>
            <CardTitle>{mode === "create" ? "Tambah Kasir" : "Edit Kasir"}</CardTitle>
            <CardDescription>Kelola data akun kasir.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama</Label>
              <Field name="name" as={Input} placeholder="Nama kasir" />
              <ErrorMessage name="name" component="p" className="text-sm text-red-500" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Field name="email" as={Input} placeholder="kasir@mail.com" type="email" />
              <ErrorMessage name="email" component="p" className="text-sm text-red-500" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password {mode === "edit" ? "(opsional)" : ""}</Label>
              <Field name="password" as={Input} placeholder="******" type="password" />
              <ErrorMessage name="password" component="p" className="text-sm text-red-500" />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-end gap-2">
            <Button asChild variant="outline" type="button">
              <Link href="/admin/cashiers">Batal</Link>
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
