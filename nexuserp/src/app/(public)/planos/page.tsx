import { PlansSection } from "@/components/site/PlansSection";
import { FaqSection } from "@/components/site/FaqSection";
import { CtaSection } from "@/components/site/CtaSection";

export const metadata = {
  title: "Planos e Preços — nexusERP",
  description: "Escolha o plano ideal para seu negócio. Start, Growth ou Enterprise.",
};

export default function PlanosPage() {
  return (
    <div className="pt-16">
      <PlansSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}
