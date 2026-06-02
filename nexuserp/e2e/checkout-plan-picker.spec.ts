import { test, expect } from "@playwright/test";

// /checkout sem ?plano= mostra a tela interativa de escolha. Clicar num card
// leva ao formulário de dados já com o plano selecionado (?plano=<slug>).
test("tela de escolha de plano leva ao formulário", async ({ page }) => {
  test.setTimeout(90_000); // dev compila a rota a frio sob paralelismo

  await page.goto("/checkout");

  // Os dois planos pagos aparecem como cards selecionáveis.
  await expect(page.getByRole("button", { name: /Selecionar plano Start/i })).toBeVisible();
  const growth = page.getByRole("button", { name: /Selecionar plano Growth/i });
  await expect(growth).toBeVisible();

  await growth.click();

  // Vai para o formulário (mesma rota, com ?plano=growth) e mostra os campos.
  await page.waitForURL(/\/checkout\?plano=growth/);
  await expect(page.getByPlaceholder("João Silva")).toBeVisible();
});

// Entrar com ?plano= (CTA da landing) pula a escolha e vai direto ao form.
test("?plano= pula a escolha e abre o formulário", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/checkout?plano=growth");
  await expect(page.getByPlaceholder("João Silva")).toBeVisible();
  await expect(page.getByRole("button", { name: /Selecionar plano Growth/i })).toHaveCount(0);
});
