import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@nexuserp.com.br";
const ADMIN_PASSWORD = "123456";

// Área de plataforma /admin: só o admin de plataforma entra.
test("/admin sem sessão redireciona para login", async ({ page }) => {
  await page.goto("/admin");
  await page.waitForURL(/\/login/);
  await expect(page).toHaveURL(/\/login/);
});

test("admin de plataforma vê as solicitações", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /entrar/i }).click();
  await page.waitForURL(/\/app\//, { timeout: 15_000 });

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /Solicitações de contratação/i })).toBeVisible();
});
