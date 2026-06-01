"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";

/** Persiste a preferência de tema do app na conta do usuário (sincroniza dispositivos). */
export async function saveThemePreference(theme: "light" | "dark" | "system"): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autenticado." };
  await prisma.user.update({ where: { id: session.user.id }, data: { themePreference: theme } });
  return { success: true, data: null };
}
