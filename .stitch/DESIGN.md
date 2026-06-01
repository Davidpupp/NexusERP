---
name: NexusERP
colors:
  primary: '#FFD54A'
  on-primary: '#33363A'
  primary-container: '#FFF3C4'
  on-primary-container: '#33363A'
  background: '#FAFAFA'
  surface: '#FFFFFF'
  surface-container: '#F1F2F4'
  surface-container-high: '#E8E9EC'
  on-surface: '#33363A'
  on-surface-variant: '#6B7180'
  secondary: '#33363A'
  on-secondary: '#FFFFFF'
  outline: '#E5E7EB'
  outline-variant: '#C7CCD1'
  error: '#DC2626'
  on-error: '#FFFFFF'
  success: '#16A34A'
  on-success: '#FFFFFF'
  warning: '#F59E0B'
  info: '#1565C0'
  chart-revenue: '#4A90D9'
  chart-expense: '#FFD54A'

typography:
  display:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Sora
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  kpi-stat:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px

rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px

spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  sidebar-width: 220px
  header-height: 64px
  card-padding: 24px
---

# Design System: NexusERP
**Project ID:** 1893663162471472573

## 1. Visual Theme & Atmosphere

NexusERP encarna **precisão industrial com acessibilidade humana** — a rara combinação de um sistema de gestão que parece sofisticado sem ser intimidador. O vocabulário visual é construído sobre uma dualidade deliberada: o amarelo-banana vibrante (#FFD54A) colide produtivamente com o aço escovado dos tons prata (#C7CCD1), espelhando o próprio símbolo da marca — um X formado por pás cruzadas (amarelo + prata), com um hub circular no centro, metáfora de integração e fluxo.

A densidade informacional é gerida por **generosidade espacial**: fundos em branco quente (#FAFAFA / #FFFFFF) dominam, deixando cada dado respirar. O amarelo nunca é decorativo — aparece cirurgicamente em CTAs, estados ativos e destaques críticos, o que multiplica seu impacto quando presente. Tudo no sistema sugere um ERP para empresas brasileiras que cresceram além das planilhas mas ainda valorizam clareza operacional imediata.

**Referências de tom:** Linear, Ramp, Mercury — corporativo premium, sem a frieza dos ERPs tradicionais.

## 2. Color Palette & Roles

**Amarelo Banana (#FFD54A)**
O coração da marca. Quente, assertivo, energético sem ser agressivo. Usado exclusivamente para: botões CTA primários (pill-shaped), estado ativo na sidebar (background 15% opacidade + borda esquerda sólida 3px), badges "Mais escolhido" em pricing, highlights de notificação no sino do header, e como segunda linha nos gráficos de barras. Nunca como fundo de texto corrido — isso seria ruído, não sinal.

**Amarelo Banana Escuro (#F6C400)**
Sombra direta do amarelo primário. Aparece exclusivamente no hover de botões CTA, garantindo feedback tátil sem mudar a identidade cromática.

**Grafite Profundo (#33363A)**
A âncora de seriedade. Cor de todo texto primário: headings, valores de KPI, labels de navegação, texto de card. Também é o fundo do Footer do site institucional, onde inverte a hierarquia — texto branco sobre grafite — para criar contraste dramático e encerrar a página com peso visual.

**Cinza Branco Quente (#FAFAFA)**
O canvas. Fundo do app, fundo do site. Não é branco puro — é levemente aquecido, eliminando a frieza clínica de #FFFFFF enquanto ainda comunica limpeza.

**Branco Puro (#FFFFFF)**
A camada elevada. Fundo de todos os cards, sidebar, header. Cria separação visual do canvas #FAFAFA sem precisar de bordas ou sombras pesadas.

**Cinza Claro (#F1F2F4)**
A textura funcional. Fundo de inputs, células de hover em tabelas, backgrounds de header de tabela (uppercase labels), área de pills de integração. Comunica "elemento interativo" ou "elemento secundário" sem chamar atenção.

**Prata Metálica (#C7CCD1)**
O fio condutor. Bordas de cards (#E5E7EB mais suave é o outline, C7CCD1 é para ícones inativos), separadores horizontais, placeholders de input, ícones de sidebar no estado inativo. Carrega a frieza do metal que complementa o calor do amarelo.

**Cinza Médio (#6B7180)**
Texto secundário: subtítulos, metadados, labels "vs. mês anterior" em KPIs, texto de navegação inativo. Mantém hierarquia sem desaparecer.

**Azul Gráfico (#4A90D9)**
Reservado exclusivamente para a linha de Receita nos gráficos de linha. Cor de informação neutra — não é CTA, não é alerta. Cria par cromático com o amarelo nos charts bicolores.

**Verde Positivo (#16A34A)** · **Vermelho Negativo (#DC2626)** · **Âmbar Aviso (#F59E0B)**
Estado financeiro codificado por cor: variações positivas em KPIs aparecem em verde com ícone ▲; negativas em vermelho com ▼; pendências/alertas em âmbar. Nunca usados como cores decorativas — sempre portadores de significado funcional.

## 3. Typography Rules

**Sora SemiBold/Bold** — personalidade e hierarquia.
Todos os headings, títulos de página, valores numéricos grandes (KPIs), e o nome da marca. Sora é geométrica com caráter — seus terminais arredondados e espacejamento open criam presença sem arrogância. O tracking negativo em displays (-0.02em) aperta as letras para coesão visual em tamanhos grandes.

**Inter Regular/Medium/SemiBold** — funcionalidade e legibilidade.
Todo texto operacional: corpo de texto, labels de tabela, metadados, placeholders, mensagens de erro. Inter foi desenhada para interfaces digitais — sua x-height generosa é legível em 11px, o que é essencial para dashboards densos.

**Hierarquia em prática:**
- `Sora 700 / 48px / -0.02em` → Hero section do site, display de landing
- `Sora 600 / 28px / -0.01em` → Título de página no app (ex: "Dashboard")
- `Sora 600 / 22px` → Títulos de seção, títulos de modal
- `Sora 600 / 18px` → Subtítulos de card, grupos de formulário
- `Sora 700 / 32px / -0.02em` → Valores de KPI (R$ 2,4M, 1.243, 28,6%)
- `Inter 600 / 14px` → Labels de coluna em tabelas (uppercase + tracking positivo)
- `Inter 400 / 14px` → Texto de linha em tabelas, descrições
- `Inter 500 / 12px` → Badges de status, variações percentuais, metadados
- `Inter 400 / 11px` → Timestamps, "vs. mês anterior", captions

Números em contexto financeiro usam **tabular-nums** obrigatoriamente para alinhamento vertical perfeito em tabelas.

## 4. Component Stylings

**Botões CTA (Primário)**
Forma pill — `border-radius: 9999px` (completamente arredondado). Fundo Amarelo Banana (#FFD54A), texto Grafite (#33363A), font-weight 600. No hover: Amarelo Escuro (#F6C400) + sombra dourada difusa `0 4px 12px rgba(255,213,74,0.35)`. Padding `14px 24px` no site; `8px 16px` nos botões de tabela. Ícone opcional à esquerda com gap 8px. O formato pill comunica modernidade e convida ao toque — contraste deliberado com a seriedade do conteúdo ERP.

**Botões Secundários (Ghost)**
Bordas finas (#E5E7EB), fundo branco, texto grafite. No hover: fundo #F1F2F4, borda #C7CCD1. Mesmo border-radius do contexto (pill no site, rounded-lg no app). Para ações de menor comprometimento (Cancelar, Filtrar, Ver mais).

**Cards e Containers**
Cantos generosamente arredondados — `border-radius: 12px` (0.75rem). Fundo branco puro (#FFFFFF) sobre canvas #FAFAFA para elevação visual sem bordas visíveis. Sombra whisper-soft dupla: `0 1px 4px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04)` — quase invisível em descanso, sutil o suficiente para definir limite. Cards clicáveis intensificam para `0 4px 16px rgba(0,0,0,0.10)` com translate(-1px) no hover — sensação de levitação.

**Cards de KPI**
Layout vertical em três camadas: label cinza-médio (12px) → valor grande Sora Bold (32px, grafite) → linha de variação (ícone ▲/▼ + percentual colorido + "vs. mês anterior" cinza). Ícone opcional no canto superior direito em 32×32px com fundo #F1F2F4. Padding interno 20px/24px.

**Sidebar de Navegação**
220px de largura, altura total da viewport, fundo branco, borda direita 1px solid #E8E9EC. Logo no topo (64px de altura). Itens de navegação com ícone Lucide outline 18px + label Inter 14px — gap 12px. Estado inativo: texto #6B7180, ícone #C7CCD1. Estado ativo/hover: fundo rgba(255,213,74,0.15) + borda esquerda 2-3px solid #FFD54A + texto/ícone #33363A — transição suave 150ms. Footer da sidebar: avatar circular 32px (inicial do nome em fundo amarelo) + nome + email truncado + ícone logout.

**Header do App**
64px de altura, fundo branco, borda inferior 1px #E8E9EC. Esquerda: título da página atual em Sora 600 16px + data por extenso em Inter 12px cinza abaixo. Centro: campo de busca pill (fundo #F1F2F4, largura 224px, ícone lupa à esquerda). Direita: botão "+ Novo" amarelo + sino de notificações com badge amarelo pulsante + avatar circular.

**Navbar do Site (Pública)**
Transparente no topo — visível sobre o hero gradient. Com scroll (>20px): background white/95 + backdrop-blur-md + borda inferior + sombra suave. Links em Inter 14px médio, texto cinza que escurece no hover. CTA "Solicitar demonstração" em pill amarelo à direita.

**Inputs e Formulários**
Fundo #F1F2F4 sem borda default — a cor de fundo já delimita o campo. Border-radius 8px. No focus: fundo muda para branco + borda 2px solid #FFD54A + halo `0 0 0 3px rgba(255,213,74,0.20)` — transição 150ms. Label acima em Inter 13px SemiBold #33363A. Placeholder em #C7CCD1 (prata metálica). Mensagem de erro em Inter 12px #DC2626 abaixo do campo.

**Tabelas**
Header: fundo #F1F2F4, labels Inter 11-12px Medium uppercase #6B7180, padding 12px 20px. Linhas: fundo branco, border-bottom 1px #E8E9EC, padding 14px 20px. Hover: #FAFAFA. Sem zebra-striping por padrão — só hover resolve a legibilidade. Badges de status em pills coloridas (fundo 10% opacidade + texto na cor funcional): verde/Pago, âmbar/Pendente, vermelho/Vencido.

**Kanban (Funil de Vendas)**
Colunas de largura fixa (224px), scroll horizontal. Cada coluna tem card branco com border-top 2px colorido indicando o estágio. Cards de oportunidade: fundo #F1F2F4, texto truncado, valor em negrito, ícone de tendência. Separação entre colunas por gap 12px.

**Gráfico de Linha (Recharts)**
Linhas stroke 2px com dots circulares r=3 nos pontos. Receita: azul (#4A90D9), Despesa: amarelo (#FFD54A). Grid horizontal tracejado #F1F2F4, sem grid vertical. Tooltip com border-radius 8px, borda #E5E7EB, font Inter 12px. Legenda em linha abaixo do gráfico.

**Gráfico de Barras Horizontais**
Barras amarelas (#FFD54A) sobre track cinza (#F1F2F4), ambas com border-radius 4px. Labels à esquerda, valores à direita. Proporção visual simples sem eixo Y visível.

**Planos de Preço**
3 cards lado a lado. Start e Enterprise: fundo branco, borda #E5E7EB. Growth (destacado): fundo grafite (#33363A), texto branco, preço em amarelo banana. Badge "Mais escolhido" pill amarelo no topo do card destacado. Botão primário no card escuro é amarelo; nos claros é ghost. Ícone check circle em amarelo para features incluídas.

## 5. Layout Principles

**App Shell — Fixed Sidebar + Scrollable Content**
Layout de 2 colunas: sidebar fixa 220px à esquerda, área de conteúdo flex-1 à direita. Dentro da área de conteúdo: header fixo 64px no topo + `<main>` scrollável com padding 24px. Fundo do main em #F4F5F7 (ligeiramente mais escuro que branco para criar contraste com cards brancos).

**Dashboard Grid**
4 KPI cards em grid igual (grid-cols-4, gap 16px) no topo. Abaixo: 2 charts em grid (grid-cols-2, gap 16px). Abaixo: bottom row em grid-cols-3 (atividades recentes ocupa 2 colunas, métricas rápidas ocupa 1 coluna).

**Site Público — Seções Empilhadas**
Máximo 7xl (1280px) de largura, centrado. Padding lateral 24px. Seções alternadas: fundo branco (#FFFFFF) e fundo cinza claro (#F1F2F4) para criar ritmo visual. Hero section usa gradient diagonal — from warm-white through white to soft-gray. Padding vertical de seção: 80-96px (py-20 a py-24).

**Espaçamento Interno**
Grid base de 4px. Card padding: 20px / 24px. Gap entre seções de conteúdo: 24px. Gap entre cards KPI: 16px. Gap entre seções de página: 32px. Sidebar items: gap vertical 2px entre links.

**Checkout — Dois Painéis**
Formulário na esquerda (2/3 da largura), resumo sticky na direita (1/3). Header próprio sem Navbar do site — isolado do contexto de navegação para reduzir fricção de compra.

**Responsividade**
Desktop (≥1280px): layout completo. Tablet (768-1279px): sidebar recolhe para ícones. Mobile (<768px): sidebar vira drawer com overlay, cards de KPI em stack, tabelas com scroll horizontal e coluna identificadora fixada.

## 6. Prompts para Stitch

**App Shell + Dashboard:**
> "Tela de dashboard ERP brasileiro com sidebar branca fixa (220px) à esquerda contendo logo nexusERP (ícone X amarelo + prata, texto 'nexus' grafite e 'ERP' amarelo) e 10 itens de navegação com ícones outline, item Dashboard ativo com fundo amarelo-banana 15% e borda esquerda amarela. Header superior branco (64px) com título 'Dashboard' em Sora SemiBold, busca pill cinza no centro, botão '+Novo' amarelo e avatar à direita. Área principal cinza-claro com 4 cards KPI brancos (R$ 2,4M, 1.243, 532, 28,6%) com variações verdes, gráfico de linha bicolor (azul=receita, amarelo=despesa) e gráfico de barras horizontais amarelas por categoria. Fonte Sora para números, Inter para texto."

**Card de KPI:**
> "Card branco arredondado (12px) com sombra ultra-suave, label Inter 12px cinza-médio no topo, valor monetário enorme em Sora Bold 32px grafite (ex: R$ 2,4M), linha inferior com ícone seta-cima verde + '+12,5%' verde SemiBold + 'vs. mês anterior' cinza-prata 11px. Ícone categoria 18px em fundo #F1F2F4 no canto superior direito."

**Tela de Módulo (tabela):**
> "Tela 'Financeiro' do ERP com 4 cards KPI no topo (Saldo Atual, Receitas, Despesas, Pendências) seguidos de tabela com header cinza-claro uppercase, linhas brancas com hover, colunas: Data, Descrição, Categoria, Tipo (ícone + texto colorido), Valor (verde/vermelho), Status (badge pill), Método. Botão '+Nova transação' amarelo pill no canto superior direito da tabela."

**Funil Kanban:**
> "Tela de Vendas com métricas no topo e kanban horizontal com 5 colunas (Novo Lead, Em Contato, Proposta, Negociação, Fechado). Cada coluna tem card branco com border-top 2px colorida e cards de oportunidade em fundo cinza-claro dentro — nome da empresa, valor em negrito, ícone de tendência verde."

**Site — Hero:**
> "Landing page enterprise clean em tema claro. Hero com headline grande em Sora 700 grafite 'Gestão empresarial integrada para empresas que querem crescer com controle.' em amarelo a última frase. Mockup de dashboard à direita (card branco com mini-sidebar amarela, 4 mini KPIs e mini gráfico). Dois botões: amarelo pill 'Solicitar demonstração' e ghost 'Ver recursos'. Três stats abaixo: +2.400 empresas, 98,7% satisfação, 4,9★. Gradiente sutil no fundo de branco-quente para cinza-claro."

**Checkout:**
> "Página de checkout SaaS 2 colunas sobre fundo cinza-claro. Esquerda: formulário com campos de fundo cinza-claro, focus amarelo, label acima, botão amarelo pill 'Continuar para pagamento'. Direita: card branco sticky 'Resumo do pedido' com plano destacado em amarelo-claro, breakdown de valores, total em negrito, lista de features incluídas com ícones check verde."
