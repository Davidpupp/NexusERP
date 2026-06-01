import { cookies } from "next/headers";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ConsentBanner } from "@/components/site/ConsentBanner";
import { cn } from "@/lib/utils";

export default async function PublicLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  // Tema escolhido pelo visitante (cookie). Aplicado no SSR → sem flash.
  const theme = (await cookies()).get("nexus-pub-theme")?.value === "dark" ? "public-dark" : "";

  return (
    <div id="public-root" className={cn("min-h-screen bg-pub-bg text-pub-text transition-colors", theme)}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ConsentBanner />
    </div>
  );
}
