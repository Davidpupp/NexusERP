"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { leadSchema } from "@/lib/validations";
import { createLead } from "@/actions/lead";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-pub-bg border border-pub-border text-sm text-pub-text placeholder-pub-muted focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/20 transition-all";
const labelClass = "block text-xs font-medium text-pub-muted mb-1.5";

const USER_RANGES = ["Apenas eu", "2 a 5", "6 a 10", "11 a 25", "26 a 50", "Mais de 50"];

export function AcquireForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", company: "", email: "", phone: "", segment: "", usersQuantity: "", mainNeed: "", message: "" },
  });

  const onSubmit = async (v: typeof leadSchema._input) => {
    setServerError(null);
    const res = await createLead(v);
    if (res.success) setSent(true);
    else setServerError(res.error);
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-pub-surface border border-pub-border p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-pub-text mb-2">Recebemos seu interesse!</h2>
        <p className="text-pub-muted text-sm max-w-md mx-auto">
          Nossa equipe entrará em contato para entender sua operação e liberar a melhor configuração
          da NexusERP para a sua empresa.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-pub-surface border border-pub-border p-6 sm:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Nome *</label>
          <input {...register("name")} placeholder="Seu nome" className={inputClass} />
          {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Empresa</label>
          <input {...register("company")} placeholder="Nome da empresa" className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>E-mail *</label>
          <input {...register("email")} type="email" placeholder="voce@empresa.com.br" className={inputClass} />
          {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Telefone / WhatsApp *</label>
          <input {...register("phone")} placeholder="(11) 99999-9999" className={inputClass} />
          {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Segmento</label>
          <input {...register("segment")} placeholder="Varejo, serviços, indústria…" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Quantidade de usuários</label>
          <select {...register("usersQuantity")} className={inputClass}>
            <option value="">Selecione</option>
            {USER_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Necessidade principal</label>
        <input {...register("mainNeed")} placeholder="Ex.: controlar estoque e financeiro juntos" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Mensagem</label>
        <textarea {...register("message")} rows={4} placeholder="Conte um pouco sobre sua operação." className={inputClass} />
      </div>

      {serverError && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">{serverError}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-full font-semibold text-pub-on-accent bg-electric hover:bg-electric-strong disabled:opacity-60 transition-all flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Enviando..." : "Solicitar contratação"}
      </button>

      <p className="text-center text-xs text-pub-muted">
        Prefere contratar direto?{" "}
        <Link href="/checkout" className="font-semibold text-pub-text hover:text-electric inline-flex items-center gap-1">
          Comprar agora <ArrowRight size={12} />
        </Link>
      </p>
    </form>
  );
}
