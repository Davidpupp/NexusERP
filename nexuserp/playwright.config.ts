import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT ?? "3000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: 1, // absorve timeout esporádico de compilação a frio sob paralelismo
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Testes rodam o checkout em modo MOCK (determinístico): zeramos as chaves
    // do Mercado Pago para o servidor de teste. As chaves reais ficam só em
    // produção (Vercel). Next não sobrescreve vars já presentes em process.env.
    env: {
      MP_ACCESS_TOKEN: "",
      NEXT_PUBLIC_MP_PUBLIC_KEY: "",
      MP_WEBHOOK_SECRET: "",
      // .env aponta AUTH_URL para o domínio de produção (Vercel). Nos testes
      // (localhost) isso quebra o NextAuth → forçamos localhost.
      AUTH_URL: `http://localhost:${PORT}`,
      NEXTAUTH_URL: `http://localhost:${PORT}`,
      NEXT_PUBLIC_APP_URL: `http://localhost:${PORT}`,
      // Secret de cron só para os testes (não é o de produção).
      CRON_SECRET: "e2e-cron-secret",
    },
  },
});
