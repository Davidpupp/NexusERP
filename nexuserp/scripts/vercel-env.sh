#!/usr/bin/env bash
# Empurra as variáveis do .env para o ambiente PRODUCTION do Vercel.
#
# Pré-requisitos (VOCÊ roda, com a SUA conta — segredos não passam por mais ninguém):
#   1. npm i -g vercel
#   2. vercel login            # autentica no navegador
#   3. vercel link             # vincula esta pasta ao projeto (nexuserp-five)
#   4. bash scripts/vercel-env.sh
#
# Observações de segurança/produção:
#   - DATABASE_URL é PULADO: o .env aponta para localhost (Postgres de dev).
#     Configure no Vercel a URL do Postgres GERENCIADO (Neon/Supabase/Vercel Postgres).
#   - MP_WEBHOOK_SECRET vazio: pegue no painel do Mercado Pago e configure.
#   - Rode também para preview/development trocando "production" abaixo, se quiser.

set -euo pipefail
ENV_FILE="${1:-.env}"
TARGET="production"
SKIP_KEYS=("DATABASE_URL")  # não empurrar valores de dev

command -v vercel >/dev/null 2>&1 || { echo "vercel CLI não encontrado. Rode: npm i -g vercel"; exit 1; }
vercel whoami >/dev/null 2>&1 || { echo "Não logado. Rode: vercel login"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "$ENV_FILE não encontrado."; exit 1; }

is_skipped() { local k="$1"; for s in "${SKIP_KEYS[@]}"; do [ "$k" = "$s" ] && return 0; done; return 1; }

while IFS= read -r line || [ -n "$line" ]; do
  line="${line%$'\r'}"                          # remove CR (Windows)
  case "$line" in ""|\#*) continue;; esac        # pula vazio/comentário
  key="${line%%=*}"
  val="${line#*=}"
  key="$(echo "$key" | xargs)"                    # trim
  val="${val%\"}"; val="${val#\"}"                # remove aspas externas
  [ -z "$val" ] && { echo "skip $key (vazio)"; continue; }
  if is_skipped "$key"; then echo "skip $key (configure manualmente em prod)"; continue; fi

  echo "→ $key"
  vercel env rm "$key" "$TARGET" -y >/dev/null 2>&1 || true   # remove anterior se existir
  printf '%s' "$val" | vercel env add "$key" "$TARGET" >/dev/null
done < "$ENV_FILE"

echo "Pronto. Confira em: Vercel → Settings → Environment Variables."
echo "Depois: redeploy (vercel --prod) para aplicar."
