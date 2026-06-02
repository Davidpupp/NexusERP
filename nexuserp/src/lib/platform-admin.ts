import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

/**
 * Acesso à área de PLATAFORMA (`/admin`) — separada do ERP dos clientes (tenants).
 * Só o dono da plataforma vê leads/solicitações e (futuramente) gestão de contas.
 *
 * Quem é admin de plataforma é definido por allowlist de e-mail em
 * `PLATFORM_ADMIN_EMAILS` (separados por vírgula). O admin padrão sempre entra.
 */
const DEFAULT_ADMIN = "admin@nexuserp.com.br";

export function getPlatformAdminEmails(): string[] {
  const extra = (env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([DEFAULT_ADMIN, ...extra]));
}

export function isPlatformAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getPlatformAdminEmails().includes(email.toLowerCase().trim());
}

/**
 * Guard de servidor para páginas/ações de plataforma. Sem sessão → /login.
 * Sessão sem permissão de plataforma → /app/dashboard (não vaza a existência da área).
 * Retorna o e-mail do admin para uso na página.
 */
export async function requirePlatformAdmin(): Promise<{ email: string }> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login?callbackUrl=/admin");
  if (!isPlatformAdmin(email)) redirect("/app/dashboard");
  return { email };
}
