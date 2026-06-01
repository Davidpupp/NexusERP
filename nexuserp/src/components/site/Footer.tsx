import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

const FOOTER_LINKS = {
  Produto: [
    { label: "Soluções", href: "/#solucoes" },
    { label: "Módulos", href: "/#modulos" },
    { label: "Integrações", href: "/#integracoes" },
    { label: "Planos", href: "/planos" },
  ],
  Empresa: [
    { label: "Benefícios", href: "/#beneficios" },
    { label: "Futuro do projeto", href: "/#futuro" },
    { label: "Adquirir serviços", href: "/adquirir" },
  ],
  Acesso: [
    { label: "Entrar", href: "/login" },
    { label: "Privacidade", href: "/privacidade" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-pub-surface text-pub-text border-t border-pub-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2">
            <Logo size="md" href="/" variant="public" />
            <p className="mt-4 text-sm text-pub-muted leading-relaxed max-w-xs">
              Conectando processos. Impulsionando resultados. A plataforma de gestão empresarial
              para empresas brasileiras que querem crescer com controle.
            </p>
            <Link
              href="/adquirir"
              className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-electric text-pub-on-accent hover:bg-electric-strong transition-all"
            >
              Adquirir nossos serviços <ArrowRight size={15} />
            </Link>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-pub-text mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-pub-muted hover:text-pub-text transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-pub-border pt-8 flex flex-col gap-3">
          <p className="text-xs text-pub-muted">
            A NexusERP é uma plataforma profissional de gestão empresarial. O acesso ao sistema é
            liberado apenas para clientes contratados — não há cadastro público nem teste gratuito.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <p className="text-sm text-pub-muted">
              © {new Date().getFullYear()} nexusERP. Todos os direitos reservados.
            </p>
            <span className="text-xs text-pub-muted">Feito com ♥ no Brasil 🇧🇷</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
