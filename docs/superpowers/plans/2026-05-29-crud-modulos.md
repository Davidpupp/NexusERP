# CRUD dos Módulos — Implementation Plan

> **For agentic workers:** executar via superpowers:executing-plans. O padrão detalhado (action-context, ownership, conversão de páginas, mapa de campos) está no spec `2026-05-29-crud-modulos-design.md` — seguir §2–§5 para cada entidade.

**Goal:** Ligar todas as telas do app a dados reais do Prisma, escopados por empresa, com CRUD via modal.

**Architecture:** Vertical por módulo + infra compartilhada (abordagem A). Mutações via server actions com `requireModuleMutation` (tenant + role + audit), páginas server-component buscam dados scoped, interatividade em `<XManager>` client com modal Radix.

**Tech Stack:** Next 16 server components/actions, Prisma 7, react-hook-form + zod, Radix Dialog, sonner.

**Nota git:** repo não-git → checkpoint = build/typecheck/lint.

---

### Task 1 — Infra compartilhada
- Create `src/lib/action-context.ts` (`requireModuleMutation`, `logAudit`).
- Create `src/components/ui/{Modal,Field,DataTable,EmptyState,ConfirmDialog,StatusBadge}.tsx` (tema dark).
- Add zod schemas faltantes em `src/lib/validations.ts` (§3 do spec).
- [ ] Checkpoint: `tsc --noEmit` + `eslint`.

### Task 2 — Lote A: financeiro (template), clientes, estoque
- `actions/transaction.ts`, `actions/customer.ts`, `actions/product.ts` (+`inventoryMovement`).
- Converter páginas + `<Manager>` client cada.
- [ ] Checkpoint: `npm run build`.

### Task 3 — Lote B: vendas (kanban), compras, projetos, producao
- `actions/opportunity.ts`, `actions/supplier.ts`+`purchaseOrder.ts`, `actions/project.ts`+`task.ts`.
- vendas/producao = kanban (update stage/status no drop ou via select).
- [ ] Checkpoint: build.

### Task 4 — Lote C: suporte, automacoes, configuracoes
- `actions/supportTicket.ts`+`supportMessage.ts`, `actions/automation.ts`, `actions/companySettings.ts`.
- [ ] Checkpoint: build.

### Task 5 — Lote D: relatorios, portal-cliente, dashboard (read-only/agregações)
- Agregações Prisma reais; dashboard KPIs/charts com dados do banco.
- [ ] Checkpoint: build + lint `--max-warnings=0`.

---

## Self-Review
- Cobertura: §4 do spec mapeia todos os 13 módulos a tasks 2–5; infra em task 1. ✓
- Ownership/segurança: `requireModuleMutation` + `where companyId` em toda mutação (spec §2.4). ✓
- Verificação sem DB: build/tsc/lint por lote (spec §7). ✓
