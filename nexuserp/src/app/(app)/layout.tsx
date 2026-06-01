import { cookies } from "next/headers";

export default async function AppGroupLayout({ children }: { readonly children: React.ReactNode }) {
  // Tema do app (claro/escuro). Cookie lido no SSR → sem flash. Default = escuro
  // (identidade Cyber-Enterprise); o usuário troca pelo toggle no header.
  const pref = (await cookies()).get("nexus-app-theme")?.value;
  const theme = pref === "light" ? "theme-light" : "theme-dark";
  return (
    <div id="app-root" className={`${theme} min-h-screen`}>
      {children}
    </div>
  );
}
