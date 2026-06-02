import { test, expect } from "@playwright/test";

// A tela de escolha aparece SEMPRE primeiro. Clicar num card confirma o plano
// e leva ao formulário de dados (?plano=<slug>&step=dados).
test("tela de escolha de plano leva ao formulário", async ({ page }) => {
  test.setTimeout(90_000); // dev compila a rota a frio sob paralelismo

  await page.goto("/checkout");

  await expect(page.getByRole("button", { name: /Selecionar plano Start/i })).toBeVisible();
  const growth = page.getByRole("button", { name: /Selecionar plano Growth/i });
  await expect(growth).toBeVisible();

  await growth.click();

  await page.waitForURL(/\/checkout\?plano=growth&step=dados/);
  await expect(page.getByPlaceholder("João Silva")).toBeVisible();
});

// Mesmo vindo com ?plano= (CTA da landing), os cards de escolha ainda aparecem.
test("?plano= ainda mostra os cards de escolha", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/checkout?plano=growth");
  await expect(page.getByRole("button", { name: /Selecionar plano Growth/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Selecionar plano Start/i })).toBeVisible();
  // O formulário só aparece após confirmar o plano.
  await expect(page.getByPlaceholder("João Silva")).toHaveCount(0);
});
