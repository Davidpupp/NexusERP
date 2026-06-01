import { test, expect } from "@playwright/test";

// Funil completo no modo mock (sem chaves MP): checkout → pagamento → ativação → onboarding.
test("compra → liberação automática → onboarding", async ({ page }) => {
  test.setTimeout(90_000); // dev compila rotas a frio sob paralelismo
  const email = `e2e${Date.now()}@nexus.test`;

  await page.goto("/checkout?plano=growth");
  await page.getByPlaceholder("João Silva").fill("E2E Tester");
  await page.getByPlaceholder("joao@empresa.com.br").fill(email);
  await page.getByPlaceholder("(11) 99999-9999").fill("11999999999");
  await page.getByPlaceholder("Minha Empresa Ltda").fill("Empresa E2E");
  await page.getByRole("button", { name: /ir para o pagamento/i }).click();

  await page.waitForURL(/\/checkout\/pagamento/);
  await page.getByPlaceholder("0000 0000 0000 0000").fill("5031433215406351");
  await page.getByPlaceholder("JOAO A SILVA").fill("E2E TESTER");
  await page.getByPlaceholder("MM/AA").fill("12/30");
  await page.getByPlaceholder("000", { exact: true }).fill("123");
  await page.getByPlaceholder("000.000.000-00").fill("12345678909");
  await page.getByRole("button", { name: /pagar/i }).click();

  // Pagamento mock aprovado → página de ativação.
  await page.waitForURL(/\/ativar/, { timeout: 45_000 });
  await page.getByPlaceholder(/Crie uma senha/i).fill("senha12345");
  await page.getByPlaceholder(/Confirme a senha/i).fill("senha12345");
  await page.getByRole("button", { name: /ativar e acessar/i }).click();

  // Auto-login → onboarding adaptativo.
  await page.waitForURL(/\/onboarding/, { timeout: 45_000 });
  await page.getByRole("button", { name: /Varejo/i }).click();
  await page.getByRole("button", { name: /^Continuar$/i }).click();
  await page.getByRole("button", { name: /Apenas eu/i }).click();
  await page.getByRole("button", { name: /^Continuar$/i }).click();
  await page.getByRole("button", { name: /^Continuar$/i }).click(); // canais (opcional)
  await page.getByRole("button", { name: /Configurar e acessar painel/i }).click();

  // Configuração concluída → painel.
  await page.waitForURL(/\/app\/dashboard/, { timeout: 45_000 });
  await expect(page).toHaveURL(/\/app\/dashboard/);
});
