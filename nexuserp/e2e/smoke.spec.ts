import { test, expect } from "@playwright/test";

test("home pública carrega", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/nexus/i);
});

test("rota do app sem sessão redireciona para /login", async ({ page }) => {
  await page.goto("/app/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("página de login tem campos de e-mail e senha", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test("política de privacidade acessível", async ({ page }) => {
  await page.goto("/privacidade");
  await expect(page.getByRole("heading", { name: /Política de Privacidade/i })).toBeVisible();
});

test("checkout (dados) carrega com resumo do pedido", async ({ page }) => {
  await page.goto("/checkout?plano=growth&step=dados");
  await expect(page.getByText(/Resumo do pedido/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /ir para o pagamento/i })).toBeVisible();
});
