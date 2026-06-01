"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { loginSchema, type LoginFormData } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setAuthError("E-mail ou senha incorretos. Verifique e tente novamente.");
    } else {
      router.push("/app/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-soft-gray flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <Logo size="lg" href="/" />
          </div>
          <p className="text-muted mt-3 text-sm">Entre na sua conta</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-graphite mb-2">E-mail</label>
              <input
                {...register("email")}
                type="email"
                placeholder="seu@email.com.br"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg bg-soft-gray border border-transparent text-graphite placeholder-silver text-sm focus:outline-none focus:bg-white focus:border-banana focus:ring-2 focus:ring-banana/20 transition-all"
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-graphite">Senha</label>
                <Link href="/esqueci-senha" className="text-xs text-banana hover:text-banana-dark">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-soft-gray border border-transparent text-graphite text-sm focus:outline-none focus:bg-white focus:border-banana focus:ring-2 focus:ring-banana/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-muted"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full font-semibold text-graphite bg-banana hover:bg-banana-dark disabled:opacity-60 transition-all"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Ainda não é cliente?{" "}
              <Link href="/checkout" className="font-semibold text-graphite hover:text-banana transition-colors">
                Adquirir nossos serviços
              </Link>
            </p>
          </div>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <p className="text-center text-xs text-muted mt-6">
            Demo: <span className="font-mono">admin@nexuserp.com.br</span> / <span className="font-mono">123456</span>
          </p>
        )}
      </div>
    </div>
  );
}
