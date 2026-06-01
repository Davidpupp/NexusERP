import { test, expect } from "@playwright/test";

test("página adquirir salva lead", async ({ page }) => {
  await page.goto("/adquirir");
  await page.getByPlaceholder("Seu nome").fill("Lead E2E");
  await page.getByPlaceholder("voce@empresa.com.br").fill(`lead${Date.now()}@nexus.test`);
  await page.getByPlaceholder("(11) 99999-9999").fill("11988887777");
  await page.getByRole("button", { name: /solicitar contrata/i }).click();
  await expect(page.getByText(/Recebemos seu interesse/i)).toBeVisible({ timeout: 15_000 });
});

test("cadastro público redireciona (sem signup grátis)", async ({ page }) => {
  await page.goto("/cadastro");
  await expect(page).toHaveURL(/\/checkout/);
});
