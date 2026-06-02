"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import { NICHES, COMPANY_SIZES, MODULE_META, getNiche } from "@/lib/onboarding-config";
import { nicheIcon } from "@/components/onboarding/nicheIcons";
import { saveOnboarding } from "@/actions/onboarding";

const STEPS = ["Tipo de uso", "Detalhes", "Módulos", "Dados", "Pronto"];
type Answer = string | boolean;

function OnboardingWizard() {
  const searchParams = useSearchParams();
  const reconfig = searchParams.get("reconfig") === "1";

  const [step, setStep] = useState(0);
  const [nicheId, setNicheId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [companySize, setCompanySize] = useState<string>("");
  const [initial, setInitial] = useState({ companyName: "", cnpj: "", phone: "", city: "" });
  const [saving, setSaving] = useState(false);

  const niche = useMemo(() => (nicheId ? getNiche(nicheId) : null), [nicheId]);

  function pickNiche(id: string) {
    const n = getNiche(id);
    setNicheId(id);
    setSelectedModules(n.recommendedModules);
    const nameQ = n.questions.find((q) => q.id === "name");
    setInitial((p) => ({ ...p, companyName: typeof answers.name === "string" ? answers.name : p.companyName }));
    void nameQ;
  }

  function setAnswer(id: string, value: Answer) {
    setAnswers((p) => ({ ...p, [id]: value }));
    if (id === "name" && typeof value === "string") setInitial((p) => ({ ...p, companyName: p.companyName || value }));
  }

  function toggleModule(m: string) {
    setSelectedModules((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]));
  }

  const nameAnswer = typeof answers.name === "string" ? answers.name.trim() : "";
  const canNext = step === 0 ? !!nicheId : step === 1 ? nameAnswer.length > 0 : true;

  async function finish() {
    if (!niche) return;
    setSaving(true);
    const res = await saveOnboarding({
      niche: niche.id,
      answers,
      selectedModules,
      companySize: companySize || undefined,
      initialData: {
        companyName: initial.companyName || undefined,
        cnpj: initial.cnpj || undefined,
        phone: initial.phone || undefined,
        city: initial.city || undefined,
      },
    });
    if (res.success) {
      toast.success("Sua NexusERP foi configurada!");
      // Navegação dura: garante que o layout do /app re-rode getCurrentCompany
      // com o perfil já onboardado (evita corrida push+refresh).
      window.location.assign(reconfig ? "/app/configuracoes" : "/app/dashboard");
    } else {
      setSaving(false);
      toast.error(res.error);
    }
  }

  return (
    <div className="min-h-screen bg-absolute-black text-ice-white flex flex-col">
      <header className="border-b border-d-border/70 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Logo size="md" href="/" variant="dark" />
          <span className="text-xs text-d-on-surface-variant">{reconfig ? "Reconfigurar sistema" : "Configuração inicial"}</span>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="max-w-3xl w-full">
          {/* Barra de progresso */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors",
                  i < step ? "bg-success text-absolute-black" : i === step ? "bg-nexus-yellow text-absolute-black" : "bg-d-surface-container text-d-on-surface-variant"
                )}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span className="text-xs text-d-on-surface-variant hidden sm:inline">{label}</span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-d-border" />}
              </div>
            ))}
          </div>

          <div className="card-dark p-6 sm:p-8">
            {/* Passo 0 — nicho */}
            {step === 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-ice-white font-sora mb-1">Vamos adaptar a NexusERP para sua realidade.</h2>
                <p className="text-sm text-d-on-surface-variant mb-6">Escolha o tipo de uso que mais combina com você.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {NICHES.map((n) => {
                    const Icon = nicheIcon(n.icon);
                    const active = nicheId === n.id;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => pickNiche(n.id)}
                        className={cn(
                          "text-left p-4 rounded-2xl border transition-all group",
                          active ? "border-nexus-yellow bg-nexus-yellow/10" : "border-d-border hover:border-nexus-yellow/50 hover:bg-d-surface-container"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors",
                          active ? "bg-nexus-yellow text-absolute-black" : "bg-d-surface-container text-nexus-yellow group-hover:bg-nexus-yellow/20"
                        )}>
                          <Icon size={20} />
                        </div>
                        <p className="text-sm font-semibold text-ice-white">{n.label}</p>
                        <p className="text-xs text-d-on-surface-variant mt-0.5 leading-snug">{n.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Passo 1 — perguntas do nicho */}
            {step === 1 && niche && (
              <div>
                <h2 className="text-xl font-bold text-ice-white font-sora mb-1">Conte um pouco sobre {niche.isPersonal ? "você" : "o seu negócio"}.</h2>
                <p className="text-sm text-d-on-surface-variant mb-6">Suas respostas ajustam módulos e atalhos. Você pode mudar depois.</p>
                <div className="space-y-4">
                  {niche.questions.map((q) => (
                    <div key={q.id}>
                      {q.type === "text" && (
                        <div>
                          <label className="block text-xs font-medium text-d-on-surface-variant mb-1.5">{q.label}</label>
                          <input
                            value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
                            onChange={(e) => setAnswer(q.id, e.target.value)}
                            placeholder={q.placeholder}
                            className="w-full px-4 py-3 rounded-xl bg-d-surface-container border border-d-border text-sm text-ice-white placeholder-d-on-surface-variant focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 transition-all"
                          />
                        </div>
                      )}
                      {q.type === "select" && (
                        <div>
                          <label className="block text-xs font-medium text-d-on-surface-variant mb-1.5">{q.label}</label>
                          <div className="flex flex-wrap gap-2">
                            {q.options?.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setAnswer(q.id, opt)}
                                className={cn(
                                  "px-3 py-2 rounded-full text-xs font-medium border transition-all",
                                  answers[q.id] === opt ? "border-nexus-yellow bg-nexus-yellow/10 text-ice-white" : "border-d-border text-d-on-surface-variant hover:border-nexus-yellow/50"
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {q.type === "bool" && (
                        <button
                          type="button"
                          onClick={() => setAnswer(q.id, !(answers[q.id] === true))}
                          className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border border-d-border hover:border-nexus-yellow/40 transition-all text-left"
                        >
                          <span className="text-sm text-ice-white">{q.label}</span>
                          <span className={cn(
                            "w-11 h-6 rounded-full flex items-center px-0.5 transition-colors flex-shrink-0",
                            answers[q.id] === true ? "bg-nexus-yellow justify-end" : "bg-d-surface-container justify-start"
                          )}>
                            <span className="w-5 h-5 rounded-full bg-ice-white" />
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passo 2 — módulos recomendados */}
            {step === 2 && niche && (
              <div>
                <h2 className="text-xl font-bold text-ice-white font-sora mb-1">Com base nas suas respostas, recomendamos estes módulos.</h2>
                <p className="text-sm text-d-on-surface-variant mb-6">Ative ou desative o que quiser. Você pode alterar depois nas configurações.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {niche.recommendedModules.map((m) => {
                    const meta = MODULE_META[m] ?? { label: m, description: "" };
                    const on = selectedModules.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleModule(m)}
                        className={cn(
                          "text-left p-4 rounded-2xl border transition-all flex items-start gap-3",
                          on ? "border-nexus-yellow bg-nexus-yellow/10" : "border-d-border hover:bg-d-surface-container"
                        )}
                      >
                        <span className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                          on ? "bg-nexus-yellow border-nexus-yellow text-absolute-black" : "border-d-border"
                        )}>
                          {on && <Check size={13} />}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-ice-white">{meta.label}</span>
                          <span className="block text-xs text-d-on-surface-variant mt-0.5 leading-snug">{meta.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Passo 3 — dados iniciais (opcional) */}
            {step === 3 && niche && (
              <div>
                <h2 className="text-xl font-bold text-ice-white font-sora mb-1">Alguns dados para personalizar.</h2>
                <p className="text-sm text-d-on-surface-variant mb-6">Tudo opcional — você pode preencher depois.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-d-on-surface-variant mb-1.5">{niche.isPersonal ? "Seu nome" : "Nome da empresa"}</label>
                    <input value={initial.companyName} onChange={(e) => setInitial((p) => ({ ...p, companyName: e.target.value }))} placeholder={niche.isPersonal ? "Seu nome" : "Minha Empresa Ltda"} className="w-full px-4 py-3 rounded-xl bg-d-surface-container border border-d-border text-sm text-ice-white placeholder-d-on-surface-variant focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 transition-all" />
                  </div>
                  {!niche.isPersonal && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-d-on-surface-variant mb-1.5">CNPJ (opcional)</label>
                        <input value={initial.cnpj} onChange={(e) => setInitial((p) => ({ ...p, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" className="w-full px-4 py-3 rounded-xl bg-d-surface-container border border-d-border text-sm text-ice-white placeholder-d-on-surface-variant focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-d-on-surface-variant mb-1.5">Cidade (opcional)</label>
                        <input value={initial.city} onChange={(e) => setInitial((p) => ({ ...p, city: e.target.value }))} placeholder="São Paulo" className="w-full px-4 py-3 rounded-xl bg-d-surface-container border border-d-border text-sm text-ice-white placeholder-d-on-surface-variant focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 transition-all" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-d-on-surface-variant mb-2">{niche.isPersonal ? "Como você se organiza?" : "Tamanho da equipe"}</label>
                    <div className="flex flex-wrap gap-2">
                      {COMPANY_SIZES.map((s) => (
                        <button key={s.id} type="button" onClick={() => setCompanySize(s.id)} className={cn(
                          "px-3 py-2 rounded-full text-xs font-medium border transition-all",
                          companySize === s.id ? "border-nexus-yellow bg-nexus-yellow/10 text-ice-white" : "border-d-border text-d-on-surface-variant hover:border-nexus-yellow/50"
                        )}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 4 — sucesso */}
            {step === 4 && niche && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-nexus-yellow/15 flex items-center justify-center mx-auto mb-5">
                  <Sparkles size={28} className="text-nexus-yellow" />
                </div>
                <h2 className="text-2xl font-bold text-ice-white font-sora mb-2">Sua NexusERP está pronta.</h2>
                <p className="text-sm text-d-on-surface-variant max-w-md mx-auto mb-6">
                  Configuramos seu painel, módulos e principais atalhos com base nas suas respostas. Agora você já pode começar a organizar sua operação com mais clareza.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedModules.map((m) => (
                    <span key={m} className="px-3 py-1.5 rounded-full bg-nexus-yellow/10 border border-nexus-yellow/20 text-xs font-medium text-ice-white">
                      {MODULE_META[m]?.label ?? m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Navegação */}
            <div className="flex gap-3 mt-8">
              {step > 0 && step < 4 && (
                <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 px-5 py-3 rounded-full text-sm font-semibold text-ice-white border border-d-border hover:bg-d-surface-container transition-all">
                  <ArrowLeft size={16} /> Voltar
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => canNext && setStep(step + 1)}
                  disabled={!canNext}
                  className="flex-1 py-3 rounded-full text-sm font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-full text-sm font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all flex items-center justify-center gap-2 hover:shadow-glow"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Configurando…" : "Ir para meu painel"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingWizard />
    </Suspense>
  );
}
