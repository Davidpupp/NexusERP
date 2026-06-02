"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { Check, ArrowRight, Star } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import type { Plan } from "@/types";

/**
 * Card interativo de plano: superfície preta com luz amarela atrás, spotlight que
 * segue o mouse e leve tilt 3D no hover. O card inteiro é um <button> acessível;
 * todo o brilho/tilt é decorativo (aria-hidden) e desligado em prefers-reduced-motion.
 */
export function PlanCard({
  plan,
  popular,
  index,
  onSelect,
}: {
  readonly plan: Plan;
  readonly popular: boolean;
  readonly index: number;
  readonly onSelect: () => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);

  // Posição do mouse normalizada (0..1), centro por padrão.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  // Tilt suave a partir da posição (desligado em reduced-motion).
  const rx = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 });
  const rotateX = reduce ? 0 : rx;
  const rotateY = reduce ? 0 : ry;

  // Spotlight radial seguindo o cursor.
  const sx = useTransform(px, (v) => `${v * 100}%`);
  const sy = useTransform(py, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${sx} ${sy}, rgba(255,212,0,0.16), transparent 60%)`;

  function handleMove(e: React.PointerEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }

  function reset() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onSelect}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      aria-label={`Selecionar plano ${plan.name} — ${formatCurrency(plan.price)} por mês`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08 * index, ease: "easeOut" }}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={{ scale: 0.99 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn(
        "group relative isolate flex flex-col text-left rounded-3xl p-7 sm:p-8 w-full",
        "bg-absolute-black border transition-colors duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-absolute-black",
        popular
          ? "border-nexus-yellow/60 hover:border-nexus-yellow"
          : "border-d-border hover:border-nexus-yellow/50"
      )}
    >
      {/* Luz amarela atrás do card (pulsa devagar, exceto em reduced-motion). */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, rgba(255,212,0,0.30), transparent 70%)",
        }}
        animate={reduce ? undefined : { opacity: popular ? [0.55, 0.85, 0.55] : [0.3, 0.5, 0.3] }}
        initial={{ opacity: popular ? 0.6 : 0.35 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Spotlight que segue o cursor (decorativo). */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: spotlight }}
      />

      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-nexus-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-absolute-black shadow-glow">
          <Star size={12} className="fill-absolute-black" /> Mais popular
        </span>
      )}

      <h3 className="font-sora text-xl font-bold text-ice-white">{plan.name}</h3>
      <p className="mt-1 text-xs text-d-on-surface-variant">
        {plan.userLimit ? `Até ${plan.userLimit} usuários` : "Usuários ilimitados"}
      </p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-sora text-4xl font-bold text-ice-white tabular-nums">
          {formatCurrency(plan.price)}
        </span>
        <span className="text-sm text-d-on-surface-variant">/mês</span>
      </div>
      <p className="mt-1 text-xs text-d-on-surface-variant">Sem fidelidade · cancele quando quiser</p>

      <ul className="mt-6 space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-d-on-surface-variant">
            <Check size={16} className="mt-0.5 flex-shrink-0 text-nexus-yellow" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <span
        className={cn(
          "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold transition-all",
          popular
            ? "bg-nexus-yellow text-absolute-black group-hover:bg-nexus-yellow-dim group-hover:shadow-glow"
            : "border border-nexus-yellow/40 text-nexus-yellow group-hover:bg-nexus-yellow group-hover:text-absolute-black"
        )}
      >
        Selecionar plano
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </motion.button>
  );
}
