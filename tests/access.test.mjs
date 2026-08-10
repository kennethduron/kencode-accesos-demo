import test from "node:test";
import assert from "node:assert/strict";
import {
  cancelAuthorization,
  confirmEntryInDomain,
  createAuthorization,
  createUniqueAuthorization,
  filterAuthorizations,
  generateAccessCode,
  hydrateStoredDemoState,
  normalizeAccessCode,
  resolveAuthorizationStatus,
  validateAccess,
} from "../src/lib/access.ts";
import { buildQrPayload, parseQrPayload } from "../src/lib/qr.ts";
import { authorizationToFirebase, firebaseToAuthorization } from "../src/repositories/firebase-mapping.ts";

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

test("buildQrPayload construye KCA1 con un código válido", () => {
  assert.equal(buildQrPayload("a7x9-2k4p"), "KCA1:A7X9-2K4P");
});

test("parseQrPayload extrae un código KCA1 válido", () => {
  assert.equal(parseQrPayload("KCA1:A7X9-2K4P"), "A7X9-2K4P");
});

test("parseQrPayload rechaza prefijo y contenido corruptos", () => {
  assert.equal(parseQrPayload("OTRO:A7X9-2K4P"), null);
  assert.equal(parseQrPayload("KCA1:contenido-inválido"), null);
  assert.equal(parseQrPayload("KCA1:A7X9-2K4P:PII"), null);
});

test("el QR no contiene información personal", () => {
  const authorization = createAuthorization(input(), now, () => 0.45);
  const payload = buildQrPayload(authorization.code);
  assert.equal(payload, `KCA1:${authorization.code}`);
  assert.ok(!payload.includes(authorization.visitorName));
  assert.ok(!payload.includes(authorization.plate));
  assert.ok(!payload.includes(authorization.residenceLabel));
});

test("normaliza código manual, espacios y guiones Unicode", () => {
  assert.equal(normalizeAccessCode("  a7x9 – 2k4p "), "A7X9-2K4P");
  assert.equal(normalizeAccessCode("a7x92k4p"), "A7X9-2K4P");
});

test("validation engine retorna AUTHORIZED", () => {
  const authorization = createAuthorization(input(), now, () => 0.31);
  assert.equal(validateAccess(authorization.code, authorization, new Date(2026, 7, 10, 12, 1)).code, "AUTHORIZED");
});

test("validation engine retorna EXPIRED", () => {
  const authorization = createAuthorization(input(), now, () => 0.32);
  assert.equal(validateAccess(authorization.code, authorization, new Date(2026, 7, 12, 13, 0)).code, "EXPIRED");
});

test("validation engine retorna USED", () => {
  const authorization = { ...createAuthorization(input({ validity: "single" }), now, () => 0.33), entryCount: 1, status: "used" };
  assert.equal(validateAccess(authorization.code, authorization, new Date(2026, 7, 10, 12, 1)).code, "USED");
});

test("validation engine retorna CANCELLED", () => {
  const authorization = { ...createAuthorization(input(), now, () => 0.34), status: "cancelled" };
  assert.equal(validateAccess(authorization.code, authorization, new Date(2026, 7, 10, 12, 1)).code, "CANCELLED");
});

test("validation engine retorna NOT_FOUND e INVALID_FORMAT", () => {
  assert.equal(validateAccess("A7X9-2K4P", null, now).code, "NOT_FOUND");
  assert.equal(validateAccess("incorrecto", null, now).code, "INVALID_FORMAT");
});

test("validation engine retorna NOT_YET_VALID", () => {
  const authorization = createAuthorization(input(), now, () => 0.35);
  assert.equal(validateAccess(authorization.code, authorization, new Date(2026, 7, 10, 11, 0)).code, "NOT_YET_VALID");
});

test("single-use se consume una vez y el segundo consumo falla", () => {
  const authorization = createAuthorization(input({ validity: "single" }), now, () => 0.36);
  const first = confirmEntryInDomain(authorization, new Date(2026, 7, 10, 12, 1));
  assert.equal(first.validation.code, "AUTHORIZED");
  assert.equal(first.authorization.status, "used");
  assert.equal(first.authorization.entryCount, 1);
  const second = confirmEntryInDomain(first.authorization, new Date(2026, 7, 10, 12, 2));
  assert.equal(second.validation.code, "USED");
  assert.equal(second.authorization.entryCount, 1);
});

test("multiple-use permanece activo y aumenta entradas", () => {
  const authorization = createAuthorization(input({ validity: "48h" }), now, () => 0.37);
  const first = confirmEntryInDomain(authorization, new Date(2026, 7, 10, 12, 1));
  const second = confirmEntryInDomain(first.authorization, new Date(2026, 7, 10, 12, 2));
  assert.equal(second.authorization.status, "active");
  assert.equal(second.authorization.entryCount, 2);
});

test("un código colisionado genera otro", async () => {
  let calls = 0;
  const random = () => (calls++ < 8 ? 0.1 : 0.2);
  const firstCode = generateAccessCode(() => 0.1);
  const authorization = await createUniqueAuthorization(input(), async (code) => code === firstCode, now, random);
  assert.notEqual(authorization.code, firstCode);
});

test("el dominio local sigue creando, confirmando e hidratando", () => {
  const authorization = createAuthorization(input({ validity: "48h" }), now, () => 0.38);
  const confirmed = confirmEntryInDomain(authorization, new Date(2026, 7, 10, 12, 1)).authorization;
  const hydrated = hydrateStoredDemoState(JSON.stringify({ version: 1, authorizations: [confirmed], selectedId: confirmed.id }), now);
  assert.equal(hydrated.authorizations[0].entryCount, 1);
  assert.equal(hydrated.authorizations[0].status, "active");
});

test("mapea dominio a Firebase y Firebase a dominio", () => {
  const authorization = createAuthorization(input(), now, () => 0.39);
  const timestamp = { fromDate: (value) => ({ toDate: () => value }) };
  const record = authorizationToFirebase(authorization, "demo-uid", timestamp);
  assert.equal(record.usageMode, "multiple");
  assert.equal(record.accessType, "car");
  assert.equal(record.createdByUid, "demo-uid");
  const restored = firebaseToAuthorization(record);
  assert.ok(restored);
  assert.equal(restored.code, authorization.code);
  assert.equal(restored.usageMode, authorization.usageMode);
  assert.equal(restored.entryType, authorization.entryType);
});
