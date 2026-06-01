import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "nexusERP — Conectando processos. Impulsionando resultados.",
  description:
    "Plataforma SaaS de gestão empresarial integrada para lojas, negócios e comércios brasileiros. Financeiro, Vendas, Estoque, Produção e muito mais.",
  keywords: ["ERP", "gestão empresarial", "SaaS", "financeiro", "vendas", "estoque"],
  openGraph: {
    title: "nexusERP — Gestão empresarial integrada",
    description: "Conectando processos. Impulsionando resultados.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-warm-white text-graphite antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
