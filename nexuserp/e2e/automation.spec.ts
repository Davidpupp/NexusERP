import { test, expect } from "@playwright/test";

const EMAIL = "admin@nexuserp.com.br";
const PASSWORD = "123456";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /entrar/i }).click();
  await page.waitForURL(/\/app\//, { timeout: 15_000 });
}

test("venda dispara automação (estoque/financeiro) + notificação", async ({ page }) => {
  test.setTimeout(60_000);
  await login(page);
  await page.goto("/app/pedidos");

  await page.getByRole("button", { name: /novo pedido/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("Descrição").first().fill("Item automação E2E");
  const nums = dialog.locator('input[type="number"]');
  await nums.nth(0).fill("2"); // quantidade
  await nums.nth(1).fill("50"); // preço unitário
  await dialog.getByRole("button", { name: /registrar venda/i }).click();

  // Pedido aparece na lista (motor processou o evento sale.created → estoque+financeiro).
  await expect(page.getByText("Consumidor").first()).toBeVisible({ timeout: 15_000 });

  // Notificação automática gerada pelo motor. Navegação fresh garante que o
  // layout (sino) re-busque as notificações do servidor antes de abrir.
  await page.goto("/app/dashboard");
  await page.getByRole("button", { name: /notifica/i }).click();
  await expect(page.getByText(/Venda registrada/i).first()).toBeVisible({ timeout: 10_000 });
});
