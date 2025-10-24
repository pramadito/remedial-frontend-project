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
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Loader, Lock } from "lucide-react";
import useLogin from "./_hooks/useLogin";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const SignIn = () => {
  const { mutateAsync: login, isPending } = useLogin();
  const router = useRouter();
  const { status, data } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status === "authenticated") {
      // If session exists but local tokens are missing, clean session and stay on sign-in
      const token = localStorage.getItem("accessToken");
      const storedRole = localStorage.getItem("role");
      if (!token || !storedRole) {
        // silently clear session so user can sign in again
        import("next-auth/react").then(({ signOut }) => signOut({ redirect: false }));
        return;
      }
      const role = (data?.user as any)?.role as string | undefined;
      const finalRole = storedRole || role;
      if (finalRole) router.replace(finalRole === "ADMIN" ? "/admin" : "/");
    } else if (status === "unauthenticated") {
      // ensure stale tokens do not block access to sign-in
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
    }
  }, [status, data, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 md:p-6">
      <div className="w-full max-w-sm">
        <Card className="w-full">
          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={async (values) => {
              await login({ email: values.email, password: values.password });
            }}
          >
            <Form className="space-y-4">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                  Securely access the cashier system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  {/* Email */}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Field
                      name="email"
                      as={Input}
                      type="text"
                      placeholder="Email"
                      autoComplete="email"
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-sm text-red-500"
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      {/* <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot Password?
                      </Link> */}
                    </div>

                    <Field
                      name="password"
                      as={Input}
                      type="password"
                      placeholder="Password"
                      autoComplete="current-password"
                    />
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-sm text-red-500"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Login
                </Button>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  © 2025 Cashier App. All rights reserved.
                </p>
              </CardFooter>
            </Form>
          </Formik>
        </Card>
      </div>
    </main>
  );
};

export default SignIn;