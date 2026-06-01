import { env } from "@/lib/env";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

/**
 * Pluggable email sender.
 * - Production: Resend (set RESEND_API_KEY + EMAIL_FROM).
 * - Dev / no key: logs the email to the console so flows work without a provider.
 */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM ?? "NexusERP <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("📧 [DEV EMAIL] (sem RESEND_API_KEY — não enviado)");
    console.log(`   Para: ${msg.to}`);
    console.log(`   Assunto: ${msg.subject}`);
    console.log(`   HTML: ${msg.html.replace(/\s+/g, " ").slice(0, 300)}…`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: msg.to, subject: msg.subject, html: msg.html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

/** Minimal branded HTML wrapper. */
export function emailLayout(title: string, bodyHtml: string, ctaUrl?: string, ctaLabel?: string): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#33363A">
    <h1 style="font-size:20px;color:#33363A">${title}</h1>
    <div style="font-size:14px;line-height:22px;color:#6B7180">${bodyHtml}</div>
    ${
      ctaUrl
        ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:20px;background:#FFD54A;color:#33363A;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600">${ctaLabel ?? "Abrir"}</a>`
        : ""
    }
    <p style="margin-top:24px;font-size:12px;color:#C7CCD1">NexusERP — Gestão empresarial integrada</p>
  </div>`;
}
