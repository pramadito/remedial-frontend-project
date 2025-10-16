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
import { Loader } from "lucide-react";
import useForgotPassword from "./_hooks/useForgotPassword";

const ForgotPassword = () => {
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();

  return (
    <main className="container mx-auto">
      <Card className="w-full max-w-sm mx-auto mt-24">
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async (values) => {
            await forgotPassword({ email: values.email });
          }}
        >
          <Form className="space-y-4">
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your email below to reset your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {/* EMAIL */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Field
                    name="email"
                    as={Input}
                    type="email"
                    placeholder="Your email"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-sm text-red-500"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader className="animate-spin" /> : "Submit"}
              </Button>
            </CardFooter>
          </Form>
        </Formik>
      </Card>
    </main>
  );
};

export default ForgotPassword;
