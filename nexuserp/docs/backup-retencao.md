# Backup & Retenção de Dados — NexusERP

## 1. Banco de dados (PostgreSQL)

### Backups automáticos
- **Produção gerenciada** (Neon, Supabase, RDS): habilitar Point-in-Time Recovery (PITR) e snapshots diários. Reter snapshots por **30 dias**.
- **Auto-hospedado**: `pg_dump` diário via cron.
  ```bash
  pg_dump "$DATABASE_URL" -Fc -f /backups/nexuserp-$(date +%F).dump
  # restauração:
  pg_restore -d "$DATABASE_URL" --clean /backups/nexuserp-2026-05-29.dump
  ```
- Armazenar backups cifrados em bucket separado (S3/R2) com versionamento.

### Frequência recomendada
| Ambiente | Full dump | PITR/WAL | Retenção |
|---|---|---|---|
| Produção | diário | contínuo | 30 dias |
| Staging | semanal | — | 7 dias |

## 2. Retenção por tipo de dado (LGPD)

| Dado | Retenção | Base |
|---|---|---|
| Conta/empresa ativa | enquanto ativa | execução de contrato |
| Após exclusão da conta | apagado imediatamente (`deleteAccount`) | direito de eliminação |
| Logs de auditoria (`AuditLog`) | 12 meses | legítimo interesse/segurança |
| Dados fiscais (notas, pagamentos) | 5 anos | obrigação legal fiscal |
| Backups | 30 dias (depois sobrescritos) | segurança |

> A exclusão de conta (`src/actions/privacy.ts → deleteAccount`) remove os dados do banco vivo. Backups expiram pela política de retenção (até 30 dias).

## 3. Dev local

Postgres embarcado (`npm run db:dev`) grava em `.pgdata/` (gitignored). Para resetar:
```bash
# pare o processo db:dev e:
rm -rf .pgdata && npm run db:dev   # recria limpo
npm run db:push && npm run db:seed
```

## 4. Disaster recovery
- RPO alvo: ≤ 24h (full diário) / ≤ 5min (com PITR).
- RTO alvo: ≤ 1h.
- Testar restauração **trimestralmente** num ambiente isolado.
