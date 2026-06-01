import { requireModuleAccess } from "@/lib/authz-guard";

export default async function ModuleLayout({ children }: { readonly children: React.ReactNode }) {
  await requireModuleAccess("producao");
  return <>{children}</>;
}
