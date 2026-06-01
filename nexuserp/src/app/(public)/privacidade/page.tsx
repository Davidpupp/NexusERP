import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — NexusERP",
  description: "Como a NexusERP coleta, usa e protege seus dados, em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-graphite font-sora mb-2">Política de Privacidade</h1>
      <p className="text-sm text-muted mb-10">Última atualização: 29/05/2026 · Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).</p>

      <div className="space-y-8 text-sm leading-relaxed text-graphite">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Dados que coletamos</h2>
          <p className="text-muted">Coletamos dados de cadastro (nome, e-mail, empresa, CNPJ), dados operacionais inseridos por você no sistema (clientes, transações, produtos, etc.) e dados técnicos de acesso (IP, logs de auditoria) para segurança.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">2. Finalidade</h2>
          <p className="text-muted">Os dados são usados para fornecer o serviço de gestão empresarial, processar pagamentos, garantir segurança e cumprir obrigações legais. Não vendemos seus dados.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">3. Base legal</h2>
          <p className="text-muted">Tratamos dados com base na execução de contrato, cumprimento de obrigação legal e legítimo interesse, conforme art. 7º da LGPD.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">4. Seus direitos (art. 18)</h2>
          <p className="text-muted">Você pode acessar, corrigir, exportar (portabilidade) e excluir seus dados a qualquer momento. As funções de <strong>exportar</strong> e <strong>excluir conta</strong> estão disponíveis em Configurações → Privacidade dentro do sistema.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">5. Segurança</h2>
          <p className="text-muted">Senhas são armazenadas com hash bcrypt, o tráfego é cifrado por TLS, e aplicamos cabeçalhos de segurança (CSP, HSTS) e controle de acesso por papel e plano.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">6. Cookies</h2>
          <p className="text-muted">Usamos cookies essenciais para autenticação. Cookies não essenciais só são usados após o seu consentimento.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">7. Contato do Encarregado (DPO)</h2>
          <p className="text-muted">Para exercer seus direitos ou tirar dúvidas: privacidade@nexuserp.com.br</p>
        </section>
      </div>
    </div>
  );
}
