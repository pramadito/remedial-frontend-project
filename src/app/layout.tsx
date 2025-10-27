import TopNavGate from "@/components/TopNavGate";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { lato } from "@/lib/fonts";
import NextAuth from "next-auth";
import NextAuthProvider from "@/providers/NextAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cashier App",
  description: "Aplikasi yang digunakan untuk melakukan transaksi pembelian produk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <NextAuthProvider>
            <TopNavGate />
            {children}
          </NextAuthProvider>
        </ReactQueryProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
