import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const role = (session.user as any)?.role as string | undefined;
  if (role === "ADMIN") {
    redirect("/admin");
  }
  // Default to cashier for authenticated non-admin
  redirect("/cashier");
}
