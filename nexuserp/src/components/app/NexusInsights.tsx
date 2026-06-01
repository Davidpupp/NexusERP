"use client";

import { useState } from "react";
import { Sparkles, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { getDashboardInsights, askNexusIa } from "@/actions/ai";

export function NexusInsights({ enabled }: { readonly enabled: boolean }) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  const gen = async () => {
    setLoading(true);
    const res = await getDashboardInsights();
    setLoading(false);
    if (res.success) setInsights(res.data.insights);
    else toast.error(res.error);
  };

  const ask = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    const res = await askNexusIa(question);
    setAsking(false);
    if (res.success) setAnswer(res.data.answer);
    else toast.error(res.error);
  };

  return (
    <div className="card-dark p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-nexus-yellow" />
        <h3 className="text-sm font-semibold text-ice-white">Nexus IA</h3>
      </div>
      {!enabled ? (
        <p className="text-xs text-d-on-surface-variant">
          Configure <span className="font-mono">ANTHROPIC_API_KEY</span> para ativar insights e o assistente de IA.
        </p>
      ) : (
        <>
          <p className="text-xs text-d-on-surface-variant mb-4">Insights automáticos sobre o seu negócio.</p>

          {insights ? (
            <div className="text-sm text-ice-white whitespace-pre-wrap leading-relaxed mb-4">{insights}</div>
          ) : (
            <button
              onClick={gen}
              disabled={loading}
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? "Analisando..." : "Gerar insights"}
            </button>
          )}

          <div className="border-t border-d-border pt-4">
            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask()}
                placeholder="Pergunte algo sobre seus dados..."
                className="flex-1 px-3 py-2 rounded-lg bg-d-surface-container border border-d-border text-sm text-ice-white placeholder-d-on-surface-variant focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20"
              />
              <button
                onClick={ask}
                disabled={asking}
                className="px-3 rounded-lg text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all"
              >
                {asking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            {answer && <p className="text-sm text-d-on-surface-variant whitespace-pre-wrap leading-relaxed mt-3">{answer}</p>}
          </div>
        </>
      )}
    </div>
  );
}
