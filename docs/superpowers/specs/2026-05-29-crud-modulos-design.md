# Sub-projeto 2 — CRUD real dos módulos (ligado ao Prisma)

**Data:** 2026-05-29
**Status:** Aprovado (abordagem A — vertical por módulo + infra compartilhada; modal/dialog; CRUD completo)
**Depende de:** Sub-projeto 1 (tenant + authz).

## 1. Objetivo

Substituir os dados mock das telas do app por dados reais do Postgres via Prisma, escopados por empresa (`companyId`), com criar/editar/excluir por modal, validação zod, checagem de papel, audit log e `revalidatePath`.

## 2. Infra compartilhada (criada uma vez)

### 2.1 `src/lib/action-context.ts`
```
requireModuleMutation(module: ModuleKey): Promise<{ companyId: string; userId: string; role: UserRole }>
```
- Chama `getCurrentCompany()`; valida `canAccessModule(planSlug, role, module)`. Se negar → lança `Error("FORBIDDEN")` (mutações não redirecionam; retornam erro tratável).
- Retorna `companyId`, `userId`, `role`.
- Helper `logAudit(tx, { companyId, userId, action, entity, entityId })`.

### 2.2 UI dark compartilhada (`src/components/ui/`)
- `Modal.tsx` — wrapper Radix Dialog tema dark (overlay blur, card graphite, título, fechar).
- `Field.tsx` — label + input/select/textarea dark + erro (integra react-hook-form).
- `DataTable.tsx` — tabela dark genérica (header `bg-d-surface-container`, linhas, hover).
- `EmptyState.tsx` — estado vazio dark.
- `ConfirmDialog.tsx` — confirmação de exclusão.
- `StatusBadge.tsx` — pill colorida por status.

### 2.3 Padrão de cada entidade
- `src/actions/<entity>.ts` (`"use server"`): `create`, `update`, `remove` (e `list` quando útil). Cada um: `requireModuleMutation` → `zod.safeParse` → `prisma.<model>` op com `where: { companyId }` (ownership enforced) → `logAudit` → `revalidatePath("/app/<module>")` → `ActionResult`.
- `src/app/(app)/app/<module>/page.tsx` (server component): `const ctx = await requireModuleAccess("<module>")`; busca lista `prisma.<model>.findMany({ where: { companyId: ctx.companyId }, orderBy })`; renderiza KPIs/tabela + `<XManager initialData=... />` (client) com botão "Novo" → Modal.

### 2.4 Ownership/segurança
- Toda query/mutação filtra por `companyId` do tenant. `update`/`remove` usam `updateMany`/`deleteMany` com `where: { id, companyId }` (impede editar/excluir registro de outra empresa). Se `count === 0` → erro "não encontrado".

## 3. Schemas zod

Já existem em `validations.ts`: `transactionSchema`, `customerSchema`, `opportunitySchema`, `productSchema`.
**Adicionar:** `supplierSchema`, `purchaseOrderSchema`, `projectSchema`, `taskSchema`, `supportTicketSchema`, `supportMessageSchema`, `automationSchema`, `costCenterSchema`, `inventoryMovementSchema`, `companySettingsSchema`.

## 4. Mapa módulo → entidade → campos editáveis

| Módulo | Modelo | Campos no form |
|---|---|---|
| financeiro | Transaction | description, category, type(INCOME/EXPENSE), amount, status, method?, dueDate? |
| clientes | Customer | name, email?, phone?, cnpj?, segment?, notes? |
| vendas | Opportunity | title, estimatedValue, stage, customerId?, nextAction? (kanban move = update stage) |
| estoque | Product | name, sku?, category?, quantity, minQuantity, costPrice, salePrice, supplierId?; ajuste → InventoryMovement(type,quantity,notes) |
| compras | Supplier | name, email?, phone?, cnpj? · PurchaseOrder | supplierId?, total, status, expectedDate? |
| projetos | Project | name, description?, status, startDate?, endDate? · Task | title, description?, status, priority, dueDate?, projectId? |
| producao | Task (board por status) | title, description?, status, priority, dueDate? |
| suporte | SupportTicket | subject, category?, priority, status, customerId? · SupportMessage | content |
| automacoes | Automation | name, description?, trigger, action, status(ACTIVE/PAUSED) |
| relatorios | (read-only) | agregações de Transaction/Order/Product |
| configuracoes | Company + CompanyMember | company.name, cnpj; listar membros + alterar role |
| portal-cliente | (read-only) | tickets/pedidos do CLIENT |
| dashboard | (read-only) | KPIs reais: receita/despesa (Transaction), pedidos (Order), clientes (Customer), estoque crítico (Product where quantity<minQuantity) |

## 5. Conversão de páginas

Páginas hoje são `"use client"` com arrays mock. Viram **server components**: removem mock, buscam dados reais, e delegam interatividade a um `<XManager>` client. Mantêm o tema dark já aplicado (classes idênticas).

## 6. Erros e bordas

- Empresa sem dados → `EmptyState`.
- Mutação negada por role → `ActionResult { success:false, error:"Sem permissão" }` (manager mostra toast via `sonner`, já instalado).
- `revalidatePath` após cada escrita.
- Datas: inputs `type="date"` → string ISO → `new Date()` no server.
- Floats (amount/price): `valueAsNumber` no form.

## 7. Verificação (sem runtime/DB)

- `npx tsc --noEmit`, `eslint --max-warnings=0`, `npm run build` verdes após cada lote.
- Teste unitário dos novos schemas zod (opcional, `tsx --test`).
- Runtime (queries reais) testado depois com Postgres + `db push` + `seed`.

## 8. Ordem de implementação (lotes)

1. Infra (action-context + UI dark).
2. Lote A: financeiro (template), clientes, estoque.
3. Lote B: vendas (kanban), compras, projetos, producao.
4. Lote C: suporte, automacoes, configuracoes.
5. Lote D: relatorios, portal-cliente, dashboard (agregações read-only).

## 9. Fora de escopo

- Filtros/busca avançada, paginação infinita (usar `take: 100` simples).
- Upload de arquivos.
- Permissões a nível de campo.
