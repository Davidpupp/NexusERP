import { Globe, Smartphone, Monitor, Workflow } from "lucide-react";

const FUTURE = [
  { icon: Globe, title: "Plataforma web", description: "Painel responsivo, multiempresa e multiusuário, com permissões e integrações externas — o núcleo já em evolução." },
  { icon: Smartphone, title: "Aplicativo mobile", description: "Arquitetura pensada para, no futuro, expor APIs reutilizáveis e dashboards adaptados a telas pequenas (Android/iOS)." },
  { icon: Monitor, title: "Aplicativo desktop", description: "Estrutura preparada para uma futura versão desktop (Windows/macOS/Linux) reaproveitando a mesma base." },
  { icon: Workflow, title: "Automações e integrações", description: "Base planejada para webhooks, sincronizações e automações que reduzem trabalho manual conforme a operação cresce." },
];

export function FutureSection() {
  return (
    <section id="futuro" className="py-24 bg-pub-surface border-t border-pub-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-electric mb-3 tracking-widest uppercase">Futuro do projeto</p>
          <h2 className="text-3xl md:text-4xl font-bold text-pub-text mb-4">Uma plataforma pensada para evoluir</h2>
          <p className="text-lg text-pub-muted max-w-2xl mx-auto">
            A NexusERP é construída com arquitetura modular. Estes são os caminhos planejados —
            descritos com transparência, sem prometer o que ainda não está disponível.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FUTURE.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-2xl bg-pub-bg border border-pub-border">
              <div className="w-12 h-12 rounded-xl bg-electric/15 flex items-center justify-center mb-4">
                <Icon size={22} className="text-electric" />
              </div>
              <h3 className="text-base font-semibold text-pub-text mb-2">{title}</h3>
              <p className="text-sm text-pub-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
