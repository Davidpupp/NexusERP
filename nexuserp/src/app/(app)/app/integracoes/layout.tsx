import { requireModuleAccess } from "@/lib/authz-guard";

export default async function IntegracoesLayout({ children }: { readonly children: React.ReactNode }) {
  await requireModuleAccess("integracoes");
  return <>{children}</>;
}
