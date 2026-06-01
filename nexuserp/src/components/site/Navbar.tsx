"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { PublicThemeToggle } from "./PublicThemeToggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Soluções", href: "/#solucoes" },
  { label: "Módulos", href: "/#modulos" },
  { label: "Integrações", href: "/#integracoes" },
  { label: "Benefícios", href: "/#beneficios" },
  { label: "Futuro", href: "/#futuro" },
  { label: "Planos", href: "/planos" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-pub-surface/90 backdrop-blur-md border-b border-pub-border shadow-sm" : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo size="md" variant="public" />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-pub-muted hover:text-pub-text transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <PublicThemeToggle className="p-2 rounded-full text-pub-muted hover:text-pub-text hover:bg-pub-elevated transition-colors" />
          <Link
            href="/login"
            className="text-sm font-medium text-pub-text hover:text-pub-muted transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/checkout?plano=growth"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-electric text-pub-on-accent hover:bg-electric-strong transition-all duration-200 shadow-sm"
          >
            Assinar agora
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-1">
          <PublicThemeToggle className="p-2 rounded-full text-pub-muted hover:text-pub-text" />
          <button
            className="p-2 text-pub-text"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-pub-surface border-t border-pub-border px-6 py-4 space-y-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-pub-text hover:text-pub-muted"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-pub-border space-y-2">
            <Link
              href="/login"
              className="block text-sm font-medium text-pub-text"
              onClick={() => setMobileOpen(false)}
            >
              Entrar
            </Link>
            <Link
              href="/checkout?plano=growth"
              className="block text-center px-4 py-2.5 rounded-full text-sm font-semibold bg-electric text-pub-on-accent"
              onClick={() => setMobileOpen(false)}
            >
              Assinar agora
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
