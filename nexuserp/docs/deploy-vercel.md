# Deploy em Produção (Vercel)

## 1. Banco de dados gerenciado
Provisione um Postgres gerenciado (Neon, Supabase ou RDS) e copie a connection string
(com `?sslmode=require`).

## 2. Migrations
O projeto usa **migrations versionadas** (`prisma/migrations/`).
- Build de produção roda automaticamente `prisma migrate deploy` (script `vercel-build`).
- Ao mudar o schema: `npm run db:migrate -- --name <mudanca>` (gera migration) e commite.
- A migration baseline `0_init` reflete o schema atual.

Primeiro deploy num banco vazio: `migrate deploy` aplica `0_init`. Depois rode os planos:
```bash
DATABASE_URL="<prod>" npm run db:seed:plans   # só planos, sem dados demo
```

## 3. Configurar projeto na Vercel
- Importe o repositório.
- **Build Command:** `npm run vercel-build` (já roda migrate deploy + next build).
- **Install Command:** padrão (`npm install`).
- Node 20+.

## 4. Variáveis de ambiente (Vercel → Settings → Environment Variables)
Obrigatórias:
- `DATABASE_URL` — Postgres gerenciado
- `AUTH_SECRET` — `openssl rand -base64 32`
- `AUTH_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` — URL do deploy (ex: https://app.seudominio.com)

Opcionais (cada uma tem fallback; ative conforme for usando):
- `RESEND_API_KEY`, `EMAIL_FROM` — envio real de e-mails
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — rate-limit distribuído
- `SENTRY_DSN` — telemetria de erros
- `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `NEXT_PUBLIC_MP_PUBLIC_KEY` — Mercado Pago (Pix + cartão)

## 5. Webhook Mercado Pago
No painel MP → Webhooks, cadastre:
`https://<NEXT_PUBLIC_APP_URL>/api/webhooks/mercadopago`
e copie o secret para `MP_WEBHOOK_SECRET`.

## 6. Checklist pós-deploy
- [ ] `migrate deploy` aplicou as migrations (ver logs do build)
- [ ] `db:seed:plans` rodado (planos aparecem em /planos)
- [ ] Login funciona (criar conta → verificar e-mail)
- [ ] Headers de segurança presentes (CSP, HSTS) — checar via DevTools
- [ ] Webhook MP recebendo (testar pagamento Pix sandbox)
- [ ] Backups configurados (ver docs/backup-retencao.md)
