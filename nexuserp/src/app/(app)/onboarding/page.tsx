"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import { SEGMENTS, COMPANY_SIZES, CHANNELS, getSegment } from "@/lib/onboarding-config";
import { saveOnboarding } from "@/actions/onboarding";

const STEPS = ["Modelo de negócio", "Tamanho", "Canais", "Pronto"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [channels, setChannels] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const seg = segment ? getSegment(segment) : null;
  const canNext = step === 0 ? !!segment : step === 1 ? !!size : true;

  const toggleChannel = (c: string) =>
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const finish = async () => {
    setSaving(true);
    const res = await saveOnboarding({ segment, companySize: size, channels });
    if (res.success) {
      toast.success("Sistema configurado para o seu negócio!");
      router.push("/app/dashboard");
    } else {
      setSaving(false);
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-absolute-black text-ice-white flex flex-col">
      <header className="border-b border-d-border/70 py-4 px-6">
        <div className="max-w-2xl mx-auto"><Logo size="md" href="/" variant="dark" /></div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-2xl w-full">
          {/* Steps */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  i < step ? "bg-success text-absolute-black" : i === step ? "bg-nexus-yellow text-absolute-black" : "bg-d-surface-container text-d-on-surface-variant"
                )}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span className="text-xs text-d-on-surface-variant hidden sm:inline">{label}</span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-d-border" />}
              </div>
            ))}
          </div>

          <div className="card-dark p-8">
            {step === 0 && (
              <div>
                <h2 className="text-xl font-bold text-ice-white font-sora mb-1">Qual o modelo do seu negócio?</h2>
                <p className="text-sm text-d-on-surface-variant mb-6">Vamos configurar a interface e os módulos para você.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {SEGMENTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSegment(s.id)}
                      className={cn(
                        "text-left p-4 rounded-xl border transition-all",
                        segment === s.id
                          ? "border-nexus-yellow bg-nexus-yellow/10"
                          : "border-d-border hover:bg-d-surface-container"
                      )}
                    >
                      <p className="text-sm font-semibold text-ice-white">{s.label}</p>
                      <p className="text-xs text-d-on-surface-variant mt-0.5">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-ice-white font-sora mb-1">Qual o tamanho da equipe?</h2>
                <p className="text-sm text-d-on-surface-variant mb-6">Ajuda a calibrar limites e relatórios.</p>
                <div className="grid grid-cols-2 gap-3">
                  {COMPANY_SIZES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSize(s.id)}
                      className={cn(
                        "p-4 rounded-xl border text-sm font-medium transition-all",
                        size === s.id ? "border-nexus-yellow bg-nexus-yellow/10 text-ice-white" : "border-d-border text-d-on-surface-variant hover:bg-d-surface-container"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-ice-white font-sora mb-1">Onde você vende?</h2>
                <p className="text-sm text-d-on-surface-variant mb-6">Selecione todos os canais que usa (opcional).</p>
                <div className="grid grid-cols-2 gap-3">
                  {CHANNELS.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleChannel(c)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2",
                        channels.includes(c) ? "border-nexus-yellow bg-nexus-yellow/10 text-ice-white" : "border-d-border text-d-on-surface-variant hover:bg-d-surface-container"
                      )}
                    >
                      {channels.includes(c) && <Check size={13} className="text-success" />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && seg && (
              <div>
                <h2 className="text-xl font-bold text-ice-white font-sora mb-1">Tudo pronto, {seg.label}!</h2>
                <p className="text-sm text-d-on-surface-variant mb-6">Vamos preparar seu painel com foco em:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {seg.primaryModules.map((m) => (
                    <span key={m} className="px-3 py-1.5 rounded-full bg-nexus-yellow/10 border border-nexus-yellow/20 text-xs font-medium text-ice-white capitalize">
                      {m}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-d-on-surface-variant">
                  Categorias financeiras e centros de custo do seu segmento serão criados automaticamente.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-full text-sm font-semibold text-ice-white border border-d-border hover:bg-d-surface-container transition-all">
                  Voltar
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => canNext && setStep(step + 1)}
                  disabled={!canNext}
                  className="flex-1 py-3 rounded-full text-sm font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={finish}
                  disabled={saving}
                  className="flex-1 py-3 rounded-full text-sm font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all flex items-center justify-center gap-2 hover:shadow-glow"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Configurando…" : "Configurar e acessar painel"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
