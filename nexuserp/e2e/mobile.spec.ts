import { test, expect } from "@playwright/test";

const EMAIL = "admin@nexuserp.com.br";
const PASSWORD = "123456";

test.use({ viewport: { width: 390, height: 844 } }); // iPhone-ish

test("app navega no celular via drawer", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /entrar/i }).click();
  await page.waitForURL(/\/app\//, { timeout: 15_000 });

  // No celular a sidebar fica escondida; abre pelo hambúrguer.
  await page.getByRole("button", { name: /abrir menu/i }).click();
  await page.getByRole("link", { name: /Pedidos/i }).click();
  await page.waitForURL(/\/app\/pedidos/, { timeout: 15_000 });
  await expect(page).toHaveURL(/\/app\/pedidos/);
});
