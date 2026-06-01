import { requireModuleAccess } from "@/lib/authz-guard";

export default async function PedidosLayout({ children }: { readonly children: React.ReactNode }) {
  await requireModuleAccess("pedidos");
  return <>{children}</>;
}
