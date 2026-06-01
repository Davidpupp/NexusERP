import { test, expect } from "@playwright/test";

test("cron nega sem secret", async ({ request }) => {
  const res = await request.get("/api/cron");
  expect(res.status()).toBe(401);
});

test("cron processa fila com secret", async ({ request }) => {
  const res = await request.get("/api/cron?secret=e2e-cron-secret");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
});
