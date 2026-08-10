import test from "node:test";
import assert from "node:assert/strict";
import {
  cancelAuthorization,
  createAuthorization,
  filterAuthorizations,
  generateAccessCode,
  hydrateStoredDemoState,
  resolveAuthorizationStatus,
} from "../src/lib/access.ts";

const now = new Date(2026, 7, 10, 10, 0, 0);

function input(overrides = {}) {
  return {
    visitorName: "María Gómez",
    visitType: "friend",
    entryType: "car",
    vehicle: "Toyota Corolla",
    plate: "abc-123",
    date: "2026-08-10",
    time: "12:00",
    validity: "24h",
    customExpiresAt: "",
    ...overrides,
  };
}

test("crea una autorización completa con código válido", () => {
  const authorization = createAuthorization(input(), now, () => 0.1);
  assert.match(authorization.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.equal(authorization.visitorName, "María Gómez");
  assert.equal(authorization.plate, "ABC-123");
  assert.equal(authorization.status, "active");
});

test("genera códigos con el formato alfanumérico esperado", () => {
  assert.match(generateAccessCode(() => Math.random()), /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
});

test("un permiso familiar de 48 horas admite múltiples entradas", () => {
  const authorization = createAuthorization(input({ visitType: "family", validity: "48h" }), now, () => 0.2);
  assert.equal(authorization.usageMode, "multiple-entry");
  assert.equal(new Date(authorization.expiresAt).getTime() - new Date(authorization.scheduledAt).getTime(), 48 * 60 * 60 * 1000);
});

test("un permiso de un ingreso conserva modalidad única", () => {
  const authorization = createAuthorization(input({ visitType: "uber", validity: "single" }), now, () => 0.3);
  assert.equal(authorization.usageMode, "single-entry");
});

test("cancelar o revocar actualiza el registro sin eliminarlo", () => {
  const authorization = createAuthorization(input(), now, () => 0.4);
  const result = cancelAuthorization([authorization], authorization.id);
  assert.equal(result.length, 1);
  assert.equal(result[0].status, "cancelled");
});

test("la búsqueda encuentra visitante y código", () => {
  const authorization = createAuthorization(input(), now, () => 0.5);
  assert.equal(filterAuthorizations([authorization], "maría", "all", "", now).length, 1);
  assert.equal(filterAuthorizations([authorization], authorization.code.slice(0, 4), "all", "", now).length, 1);
  assert.equal(filterAuthorizations([authorization], "inexistente", "all", "", now).length, 0);
});

test("los filtros agrupan finalizados y separan vencidos", () => {
  const base = createAuthorization(input(), now, () => 0.6);
  const completed = { ...base, id: "completed", status: "completed" };
  const used = { ...base, id: "used", status: "used" };
  const expired = { ...base, id: "expired", status: "expired" };
  assert.equal(filterAuthorizations([completed, used, expired], "", "finalized", "", now).length, 2);
  assert.equal(filterAuthorizations([completed, used, expired], "", "expired", "", now).length, 1);
});

test("una autorización activa cambia a vencida al superar expiresAt", () => {
  const authorization = createAuthorization(input({ validity: "single" }), now, () => 0.7);
  const later = new Date(new Date(authorization.expiresAt).getTime() + 1);
  assert.equal(resolveAuthorizationStatus(authorization, later), "expired");
});

test("la hidratación acepta estado válido y rechaza storage corrupto", () => {
  const authorization = createAuthorization(input(), now, () => 0.8);
  const valid = hydrateStoredDemoState(JSON.stringify({ version: 1, authorizations: [authorization], selectedId: authorization.id }), now);
  assert.equal(valid.authorizations.length, 1);
  assert.equal(valid.selectedId, authorization.id);

  const corrupt = hydrateStoredDemoState("{contenido inválido", now);
  assert.ok(corrupt.authorizations.length >= 1);
  assert.equal(corrupt.version, 1);

  const maliciousShape = hydrateStoredDemoState(JSON.stringify({ version: 1, authorizations: [{ id: 3 }], selectedId: null }), now);
  assert.ok(maliciousShape.authorizations.length >= 1);
});
