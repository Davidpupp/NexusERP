import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env, isAiEnabled } from "@/lib/env";

const MODEL = "claude-opus-4-8";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `Você é a "Nexus IA", assistente de inteligência de negócios embarcada no NexusERP — um ERP brasileiro.
Seu papel: analisar os dados financeiros e operacionais de UMA empresa e gerar insights práticos, diretos e acionáveis, em português do Brasil.
Diretrizes:
- Seja específico e baseado nos números fornecidos. Nunca invente dados que não estão no contexto.
- Foque em fluxo de caixa, oportunidades de receita, riscos (estoque crítico, contas vencidas, margem) e próximos passos.
- Tom profissional, conciso, sem floreios. Use valores em R$ quando relevante.
- Você opera sobre os dados de uma única empresa (multi-tenant) — jamais referencie outras empresas.`;

async function runClaude(opts: {
  system?: string;
  user: string;
  maxTokens: number;
  adaptive?: boolean;
}): Promise<string> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens,
    ...(opts.adaptive ? { thinking: { type: "adaptive" as const } } : {}),
    system: [
      {
        type: "text" as const,
        text: opts.system ?? SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" as const },
      },
    ],
    messages: [{ role: "user" as const, content: opts.user }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/** Insights do dashboard a partir de um resumo já escopado por empresa. */
export async function generateInsights(summary: Record<string, unknown>): Promise<string> {
  if (!isAiEnabled) throw new Error("AI_DISABLED");
  return runClaude({
    user: `Analise o resumo da empresa e gere de 3 a 5 insights acionáveis (em tópicos curtos):\n\n${JSON.stringify(summary, null, 2)}`,
    maxTokens: 1200,
    adaptive: true,
  });
}

/** Sugere uma categoria financeira para uma transação. */
export async function categorizeTransaction(
  description: string,
  existingCategories: string[]
): Promise<string> {
  if (!isAiEnabled) throw new Error("AI_DISABLED");
  const out = await runClaude({
    system:
      "Você classifica transações financeiras de um ERP em UMA categoria. Responda APENAS com o nome da categoria, sem explicação.",
    user: `Categorias existentes: ${existingCategories.join(", ") || "(nenhuma)"}\nTransação: "${description}"\nCategoria:`,
    maxTokens: 30,
  });
  return out.split("\n")[0].replace(/^["'\s-]+|["'\s.]+$/g, "").slice(0, 60);
}

/** Assistente de perguntas sobre os dados da empresa (contexto já escopado). */
export async function askNexus(question: string, context: Record<string, unknown>): Promise<string> {
  if (!isAiEnabled) throw new Error("AI_DISABLED");
  return runClaude({
    user: `Contexto da empresa:\n${JSON.stringify(context, null, 2)}\n\nPergunta do usuário: ${question}\n\nResponda com base apenas no contexto acima.`,
    maxTokens: 1000,
    adaptive: true,
  });
}
