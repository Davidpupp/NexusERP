import type { Metadata } from "next";
import { HeroSection } from "@/components/site/HeroSection";
import { WhatIsSection } from "@/components/site/WhatIsSection";
import { ProblemsSection } from "@/components/site/ProblemsSection";
import { FeaturesSection } from "@/components/site/FeaturesSection";
import { IntegrationsSection } from "@/components/site/IntegrationsSection";
import { BenefitsSection } from "@/components/site/BenefitsSection";
import { PlansSection } from "@/components/site/PlansSection";
import { FutureSection } from "@/components/site/FutureSection";
import { FaqSection } from "@/components/site/FaqSection";
import { CtaSection } from "@/components/site/CtaSection";

export const metadata: Metadata = {
  title: "NexusERP | Sistema de gestão empresarial completo",
  description:
    "Centralize vendas, estoque, financeiro, clientes, relatórios e integrações em uma plataforma ERP profissional para empresas que buscam mais controle e crescimento.",
  keywords: [
    "ERP",
    "sistema de gestão empresarial",
    "gestão de estoque",
    "gestão financeira",
    "sistema para empresas",
    "controle de vendas",
    "ERP online",
    "software de gestão",
  ],
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhatIsSection />
      <ProblemsSection />
      <FeaturesSection />
      <IntegrationsSection />
      <BenefitsSection />
      <PlansSection />
      <FutureSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
