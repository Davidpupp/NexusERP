import { test } from "node:test";
import assert from "node:assert/strict";
import { canAccessModule, planRank } from "./authz";

test("planRank ordena start < growth < enterprise", () => {
  assert.ok(planRank("start") < planRank("growth"));
  assert.ok(planRank("growth") < planRank("enterprise"));
});

test("start nega módulo growth (projetos) por plano", () => {
  const r = canAccessModule("start", "OWNER", "projetos");
  assert.equal(r.ok, false);
  assert.equal(r.reason, "plan");
});

test("growth permite projetos para MANAGER", () => {
  assert.deepEqual(canAccessModule("growth", "MANAGER", "projetos"), { ok: true });
});

test("financeiro negado para SALES por role", () => {
  const r = canAccessModule("growth", "SALES", "financeiro");
  assert.equal(r.ok, false);
  assert.equal(r.reason, "role");
});

test("CLIENT só acessa portal-cliente", () => {
  assert.equal(canAccessModule("enterprise", "CLIENT", "financeiro").ok, false);
  assert.equal(canAccessModule("enterprise", "CLIENT", "portal-cliente").ok, true);
});

test("enterprise permite módulo growth", () => {
  assert.equal(canAccessModule("enterprise", "ADMIN", "automacoes").ok, true);
});
