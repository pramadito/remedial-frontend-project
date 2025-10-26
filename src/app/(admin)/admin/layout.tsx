import { auth } from "@/auth";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminSidebar from "./_components/AdminSidebar";
import AdminGuard from "./_components/AdminGuard";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const role = (session as any)?.user?.role as string | undefined;

  if (!session) {
    redirect("/login");
  }
  if (role !== "ADMIN") {
    redirect("/cashier");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="mx-auto max-w-[1400px]">
        <AdminSidebar />
        <main className="p-4 md:p-8 space-y-6 pt-27 md:pt-27">
          {/* Client-side guard to show toast and ensure redirect for non-admins */}
          <AdminGuard />
          {children}
        </main>
      </div>
    </div>
  );
}