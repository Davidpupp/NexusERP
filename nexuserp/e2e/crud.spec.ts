import { test, expect } from "@playwright/test";

// Requer banco com seed (admin@nexuserp.com.br / 123456) e servidor em :3000.
const EMAIL = "admin@nexuserp.com.br";
const PASSWORD = "123456";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /entrar/i }).click();
  await page.waitForURL(/\/app\//, { timeout: 15_000 });
}

test("login leva ao app", async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/\/app\//);
});

test("dashboard carrega com KPIs e painel Nexus IA", async ({ page }) => {
  await login(page);
  await page.goto("/app/dashboard");
  await expect(page.getByText(/Receita/i).first()).toBeVisible();
  await expect(page.getByText(/Nexus IA/i)).toBeVisible();
});

test("criar cliente via modal", async ({ page }) => {
  await login(page);
  await page.goto("/app/clientes");
  await page.getByRole("button", { name: /novo cliente/i }).click();
  const nome = `Cliente E2E ${Date.now()}`;
  await page.getByLabel("Nome").fill(nome);
  await page.getByRole("button", { name: /^salvar$/i }).click();
  await expect(page.getByText(nome)).toBeVisible({ timeout: 10_000 });
});

test("criar transação no financeiro", async ({ page }) => {
  await login(page);
  await page.goto("/app/financeiro");
  await expect(page.getByText(/Bancos conectados/i)).toBeVisible();
  await page.getByRole("button", { name: /nova transação/i }).click();
  const desc = `Receita E2E ${Date.now()}`;
  await page.getByLabel("Descrição").fill(desc);
  await page.getByLabel("Categoria").fill("Vendas");
  await page.getByLabel("Valor (R$)").fill("1234.56");
  await page.getByRole("button", { name: /^salvar$/i }).click();
  await expect(page.getByText(desc)).toBeVisible({ timeout: 10_000 });
});
