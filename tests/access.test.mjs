import test from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_RESIDENCE_LABEL,
  cancelAuthorization,
  confirmEntryInDomain,
  confirmExitInDomain,
  createAccessEvent,
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
import {
  buildAccessShareModel,
  buildAccessShareText,
  createAccessShareFilename,
  getShareCapability,
  isShareCancellation,
} from "../src/lib/access-share.ts";
import {
  ACCESS_SHARE_CARD_HEIGHT,
  ACCESS_SHARE_CARD_WIDTH,
  ACCESS_SHARE_CODE_FONT_SIZE,
  ACCESS_SHARE_FOOTER_HEIGHT,
  ACCESS_SHARE_HEADER_HEIGHT,
  ACCESS_SHARE_QR_SIZE,
} from "../src/lib/create-access-share-card.ts";
import { createAccessValidationGate } from "../src/lib/access-validation-feedback.ts";
import { authorizationToFirebase, firebaseToAuthorization } from "../src/repositories/firebase-mapping.ts";
import manifest from "../src/app/manifest.ts";
import { isOnlineState, shouldShowIosInstallHelp } from "../src/lib/connectivity.ts";
import { demoResident } from "../src/data/demo.ts";
import { landingImages } from "../src/data/landing-images.ts";
import {
  SITE_URL,
  SOCIAL_IMAGE_ALT,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_PATH,
  SOCIAL_IMAGE_WIDTH,
  siteMetadata,
} from "../src/lib/site-metadata.ts";

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

test("multiple-use permanece activo y aumenta entradas después de salir", () => {
  const authorization = createAuthorization(input({ validity: "48h" }), now, () => 0.37);
  const first = confirmEntryInDomain(authorization, new Date(2026, 7, 10, 12, 1));
  const exit = confirmExitInDomain(first.authorization, new Date(2026, 7, 10, 12, 2));
  const second = confirmEntryInDomain(exit.authorization, new Date(2026, 7, 10, 12, 3));
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
  assert.equal(restored.presenceState, "outside");
  assert.equal(restored.exitCount, 0);
});

test("una autorización nueva inicia fuera y sin salidas", () => {
  const authorization = createAuthorization(input({ validity: "48h" }), now, () => 0.4);
  assert.equal(authorization.presenceState, "outside");
  assert.equal(authorization.entryCount, 0);
  assert.equal(authorization.exitCount, 0);
});

test("validation engine retorna INSIDE para visitante multiple-use dentro", () => {
  const authorization = createAuthorization(input({ validity: "48h" }), now, () => 0.41);
  const entered = confirmEntryInDomain(authorization, new Date(2026, 7, 10, 12, 1)).authorization;
  assert.equal(validateAccess(entered.code, entered, new Date(2026, 7, 10, 12, 2)).code, "INSIDE");
});

test("confirmar salida actualiza presenceState, exitCount y lastExitAt", () => {
  const authorization = createAuthorization(input({ validity: "48h" }), now, () => 0.42);
  const entered = confirmEntryInDomain(authorization, new Date(2026, 7, 10, 12, 1)).authorization;
  const exited = confirmExitInDomain(entered, new Date(2026, 7, 10, 12, 5));
  assert.equal(exited.confirmed, true);
  assert.equal(exited.authorization.presenceState, "outside");
  assert.equal(exited.authorization.exitCount, 1);
  assert.equal(exited.authorization.lastExitAt, new Date(2026, 7, 10, 12, 5).toISOString());
  assert.equal(exited.authorization.status, "active");
});

test("no permite confirmar salida si el visitante ya está fuera", () => {
  const authorization = createAuthorization(input({ validity: "48h" }), now, () => 0.43);
  const result = confirmExitInDomain(authorization, new Date(2026, 7, 10, 12, 5));
  assert.equal(result.confirmed, false);
  assert.equal(result.authorization.exitCount, 0);
  assert.equal(result.authorization.presenceState, "outside");
});

test("multiple-use completa entrada, salida y nueva entrada", () => {
  const authorization = createAuthorization(input({ validity: "48h" }), now, () => 0.44);
  const firstEntry = confirmEntryInDomain(authorization, new Date(2026, 7, 10, 12, 1)).authorization;
  const exit = confirmExitInDomain(firstEntry, new Date(2026, 7, 10, 12, 2)).authorization;
  const secondEntry = confirmEntryInDomain(exit, new Date(2026, 7, 10, 12, 3)).authorization;
  assert.equal(secondEntry.entryCount, 2);
  assert.equal(secondEntry.exitCount, 1);
  assert.equal(secondEntry.presenceState, "inside");
  assert.equal(secondEntry.status, "active");
});

test("Familiar 48h reutiliza exactamente el mismo código tras entrada, salida y reentrada", () => {
  const authorization = createAuthorization(input({ visitType: "family", validity: "48h" }), now, () => 0.441);
  const originalCode = authorization.code;
  assert.equal(validateAccess(originalCode, authorization, new Date(2026, 7, 10, 12, 0)).code, "AUTHORIZED");

  const firstEntry = confirmEntryInDomain(authorization, new Date(2026, 7, 10, 12, 1)).authorization;
  assert.equal(firstEntry.code, originalCode);
  assert.equal(firstEntry.presenceState, "inside");
  assert.equal(firstEntry.entryCount, 1);
  assert.equal(validateAccess(originalCode, firstEntry, new Date(2026, 7, 10, 12, 2)).code, "INSIDE");

  const firstExit = confirmExitInDomain(firstEntry, new Date(2026, 7, 10, 12, 3)).authorization;
  assert.equal(firstExit.code, originalCode);
  assert.equal(firstExit.presenceState, "outside");
  assert.equal(firstExit.exitCount, 1);
  assert.equal(validateAccess(originalCode, firstExit, new Date(2026, 7, 10, 12, 4)).code, "AUTHORIZED");

  const secondEntry = confirmEntryInDomain(firstExit, new Date(2026, 7, 10, 12, 5)).authorization;
  assert.equal(secondEntry.code, originalCode);
  assert.equal(secondEntry.presenceState, "inside");
  assert.equal(secondEntry.entryCount, 2);
});

test("single-use no se reactiva mediante confirmación de salida", () => {
  const authorization = createAuthorization(input({ validity: "single" }), now, () => 0.45);
  const entered = confirmEntryInDomain(authorization, new Date(2026, 7, 10, 12, 1)).authorization;
  const exit = confirmExitInDomain(entered, new Date(2026, 7, 10, 12, 2));
  assert.equal(exit.confirmed, false);
  assert.equal(exit.authorization.status, "used");
  assert.equal(validateAccess(exit.authorization.code, exit.authorization, new Date(2026, 7, 10, 12, 3)).code, "USED");
});

test("evento de salida usa exit_confirmed sin duplicar PII", () => {
  const authorization = createAuthorization(input({ validity: "48h" }), now, () => 0.46);
  const event = createAccessEvent(authorization, "exit_confirmed", new Date(2026, 7, 10, 12, 2));
  assert.equal(event.eventType, "exit_confirmed");
  assert.equal(event.authorizationCode, authorization.code);
  assert.equal("visitorName" in event, false);
  assert.equal(event.securityStation, "Puesto Principal");
});

test("mapping Firebase conserva presencia y conteos de salida", () => {
  const authorization = createAuthorization(input({ validity: "48h" }), now, () => 0.47);
  const entered = confirmEntryInDomain(authorization, new Date(2026, 7, 10, 12, 1)).authorization;
  const exited = confirmExitInDomain(entered, new Date(2026, 7, 10, 12, 2)).authorization;
  const timestamp = { fromDate: (value) => ({ toDate: () => value }) };
  const restored = firebaseToAuthorization(authorizationToFirebase(exited, "demo-uid", timestamp));
  assert.ok(restored);
  assert.equal(restored.presenceState, "outside");
  assert.equal(restored.exitCount, 1);
  assert.equal(restored.lastExitAt, exited.lastExitAt);
});

test("validation gate activa loading al iniciar y lo limpia al completar", async () => {
  const gate = createAccessValidationGate({ minimumVisibleMs: 0 });
  let loading = false;
  let completeTask;
  const task = new Promise((resolve) => { completeTask = resolve; });

  const validation = gate.run(
    () => task,
    () => { loading = true; },
    () => { loading = false; },
  );

  assert.equal(loading, true);
  assert.equal(gate.isProcessing(), true);
  completeTask("AUTHORIZED");
  const result = await validation;
  assert.deepEqual(result, { started: true, value: "AUTHORIZED" });
  assert.equal(loading, false);
  assert.equal(gate.isProcessing(), false);
});

test("validation gate rechaza doble procesamiento mientras hay un lookup activo", async () => {
  const gate = createAccessValidationGate({ minimumVisibleMs: 0 });
  let completeTask;
  const task = new Promise((resolve) => { completeTask = resolve; });
  const first = gate.run(() => task, () => undefined, () => undefined);

  const second = await gate.run(
    async () => "duplicado",
    () => assert.fail("el segundo lookup no debe iniciar"),
    () => assert.fail("el segundo lookup no debe finalizar"),
  );

  assert.deepEqual(second, { started: false });
  completeTask("primero");
  assert.deepEqual(await first, { started: true, value: "primero" });
});

test("validation gate limpia loading y permite reintentar después de un error", async () => {
  const gate = createAccessValidationGate({ minimumVisibleMs: 0 });
  let loading = false;

  await assert.rejects(
    gate.run(
      async () => { throw new Error("Firebase unavailable"); },
      () => { loading = true; },
      () => { loading = false; },
    ),
    /Firebase unavailable/,
  );

  assert.equal(loading, false);
  assert.equal(gate.isProcessing(), false);
  const retry = await gate.run(async () => "retry-ok", () => undefined, () => undefined);
  assert.deepEqual(retry, { started: true, value: "retry-ok" });
});

test("validation gate conserva el overlay durante el mínimo visual configurado", async () => {
  let currentTime = 1_000;
  const waits = [];
  const gate = createAccessValidationGate({
    minimumVisibleMs: 400,
    now: () => currentTime,
    wait: async (milliseconds) => {
      waits.push(milliseconds);
      currentTime += milliseconds;
    },
  });

  await gate.run(
    async () => {
      currentTime += 125;
      return "AUTHORIZED";
    },
    () => undefined,
    () => undefined,
  );

  assert.deepEqual(waits, [275]);
});

test("manifest PWA conserva identidad, modo standalone e iconos requeridos", () => {
  const value = manifest();
  assert.equal(value.name, "ECOTERRA Access Demo");
  assert.equal(value.short_name, "ECOTERRA Access");
  assert.match(value.description, /ECOTERRA/);
  assert.equal(value.start_url, "/");
  assert.equal(value.display, "standalone");
  assert.ok(value.icons?.some((icon) => icon.sizes === "192x192" && icon.purpose === "any"));
  assert.ok(value.icons?.some((icon) => icon.sizes === "512x512" && icon.purpose === "any"));
  assert.ok(value.icons?.some((icon) => icon.purpose === "maskable"));
});

test("metadata social define canonical, Open Graph y Twitter para ECOTERRA", () => {
  assert.equal(siteMetadata.metadataBase?.toString(), `${SITE_URL}/`);
  assert.equal(siteMetadata.alternates?.canonical, "/");
  assert.equal(siteMetadata.robots?.index, false);
  assert.equal(siteMetadata.openGraph?.title, "ECOTERRA | Sistema Digital de Control de Accesos");
  assert.equal(siteMetadata.openGraph?.url, SITE_URL);
  const image = siteMetadata.openGraph?.images?.[0];
  assert.equal(image?.url, SOCIAL_IMAGE_PATH);
  assert.equal(image?.width, SOCIAL_IMAGE_WIDTH);
  assert.equal(image?.height, SOCIAL_IMAGE_HEIGHT);
  assert.equal(image?.alt, SOCIAL_IMAGE_ALT);
  assert.equal(siteMetadata.twitter?.card, "summary_large_image");
  assert.deepEqual(siteMetadata.twitter?.images, [SOCIAL_IMAGE_PATH]);
});

test("metadata y manifest referencian todos los iconos ECOTERRA requeridos", () => {
  const iconUrls = siteMetadata.icons?.icon?.map((icon) => typeof icon === "string" || icon instanceof URL ? icon.toString() : icon.url);
  assert.ok(iconUrls?.includes("/favicon.ico"));
  assert.ok(iconUrls?.includes("/icons/icon-32x32.png"));
  assert.ok(iconUrls?.includes("/icons/icon-48x48.png"));
  assert.ok(iconUrls?.includes("/icons/icon-192.png"));
  assert.ok(iconUrls?.includes("/icons/icon-512.png"));
  assert.equal(siteMetadata.appleWebApp?.title, "ECOTERRA Access");
  assert.ok(manifest().icons?.some((icon) => icon.src === "/icons/maskable-512.png" && icon.purpose === "maskable"));
});

test("la residencia principal visible de la demo es ECOTERRA", () => {
  assert.equal(demoResident.community, "ECOTERRA");
  assert.equal(DEMO_RESIDENCE_LABEL, "Casa 27 · ECOTERRA");
});

test("detección de conexión trata únicamente onLine=false como offline", () => {
  assert.equal(isOnlineState(true), true);
  assert.equal(isOnlineState(undefined), true);
  assert.equal(isOnlineState(false), false);
});

test("ayuda de instalación iOS aparece solo en Safari y fuera de standalone", () => {
  const safari = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";
  assert.equal(shouldShowIosInstallHelp({ userAgent: safari }), true);
  assert.equal(shouldShowIosInstallHelp({ userAgent: safari, navigatorStandalone: true }), false);
  assert.equal(shouldShowIosInstallHelp({ userAgent: safari.replace("Version/18.0", "CriOS/126.0") }), false);
});

test("tarjeta compartible usa un filename profesional basado únicamente en el código", () => {
  assert.equal(createAccessShareFilename("A7X9-2K4P"), "ecoterra-access-a7x9-2k4p.png");
});

test("tarjeta compartible conserva exactamente el mismo código y payload QR", () => {
  const authorization = { ...createAuthorization(input({ visitType: "family", validity: "48h" }), now, () => 0.2), code: "A7X9-2K4P" };
  const model = buildAccessShareModel(authorization, "active", "family");
  assert.equal(model.code, "A7X9-2K4P");
  assert.equal(model.qrPayload, "KCA1:A7X9-2K4P");
  assert.match(buildAccessShareText(model), /Código: A7X9-2K4P/);
});

test("tarjeta compartible contiene datos mínimos y excluye información interna", () => {
  const authorization = {
    ...createAuthorization(input({ visitType: "family", validity: "48h" }), now, () => 0.2),
    code: "A7X9-2K4P",
    createdByUid: "internal-uid",
  };
  const model = buildAccessShareModel(authorization, "active", "family");
  assert.deepEqual(
    { visitor: model.visitor, home: model.home, visitType: model.visitType },
    { visitor: authorization.visitorName, home: "Casa 27", visitType: "Familiar" },
  );
  for (const forbidden of ["id", "uid", "plate", "vehicle", "residenceId", "createdByUid"]) {
    assert.equal(Object.hasOwn(model, forbidden), false);
  }
  assert.doesNotMatch(JSON.stringify(model), /internal-uid|ABC-123|Toyota Corolla/);
});

test("un acceso cancelado no se presenta ni se genera como autorizado", () => {
  const authorization = { ...createAuthorization(input(), now, () => 0.2), status: "cancelled" };
  const model = buildAccessShareModel(authorization, "cancelled");
  assert.equal(model.shareable, false);
  assert.equal(model.title, "ACCESO CANCELADO");
  assert.doesNotMatch(model.title, /AUTORIZADO/);
});

test("vigencia compartida se deriva de la autorización real", () => {
  const authorization24 = createAuthorization(input({ validity: "24h" }), now, () => 0.2);
  const authorization48 = createAuthorization(input({ visitType: "family", validity: "48h" }), now, () => 0.2);
  const validity24 = buildAccessShareModel(authorization24, "active").validity;
  const validity48 = buildAccessShareModel(authorization48, "active", "family").validity;
  assert.match(validity24, /^24 horas · válido hasta /);
  assert.match(validity48, /^48 horas · válido hasta /);
  assert.notEqual(validity24, validity48);
});

test("share card mantiene formato operativo y jerarquía medible", () => {
  assert.deepEqual([ACCESS_SHARE_CARD_WIDTH, ACCESS_SHARE_CARD_HEIGHT], [1080, 1350]);
  assert.ok(ACCESS_SHARE_HEADER_HEIGHT / ACCESS_SHARE_CARD_HEIGHT >= 0.12);
  assert.ok(ACCESS_SHARE_HEADER_HEIGHT / ACCESS_SHARE_CARD_HEIGHT <= 0.16);
  assert.ok(ACCESS_SHARE_FOOTER_HEIGHT / ACCESS_SHARE_CARD_HEIGHT >= 0.05);
  assert.ok(ACCESS_SHARE_FOOTER_HEIGHT / ACCESS_SHARE_CARD_HEIGHT <= 0.07);
  assert.ok(ACCESS_SHARE_QR_SIZE >= 430 && ACCESS_SHARE_QR_SIZE <= 520);
  assert.ok(ACCESS_SHARE_CODE_FONT_SIZE >= 48 && ACCESS_SHARE_CODE_FONT_SIZE <= 68);
});

test("permiso familiar usa branding compacto y estado operativo", () => {
  const authorization = createAuthorization(input({ visitType: "family", validity: "48h" }), now, () => 0.2);
  const model = buildAccessShareModel(authorization, "active", "family");
  assert.equal(model.product, "Control de Accesos y Visitas");
  assert.equal(model.title, "PERMISO ACTIVO");
  assert.equal(model.statusLabel, "VIGENTE");
});

test("imágenes comerciales son locales, ilustrativas y no se atribuyen a ECOTERRA", () => {
  for (const image of Object.values(landingImages)) {
    assert.match(image.src, /^\/images\/ecoterra-demo\//);
    assert.match(image.alt, /imagen ilustrativa/i);
    assert.doesNotMatch(image.alt, /ECOTERRA/i);
    assert.match(image.sourceUrl, /^https:\/\/unsplash\.com\/photos\//);
    assert.ok(image.width > 0 && image.height > 0);
  }
});

test("capacidad de compartir distingue archivos, texto y descarga", () => {
  const files = [{}];
  assert.equal(getShareCapability({ share() {}, canShare: () => true }, files), "files");
  assert.equal(getShareCapability({ share() {}, canShare: () => false }, files), "text");
  assert.equal(getShareCapability(undefined, files), "download");
});

test("cancelar el selector de compartir se trata como una cancelación normal", () => {
  assert.equal(isShareCancellation(new DOMException("cancelled", "AbortError")), true);
  assert.equal(isShareCancellation({ name: "AbortError" }), true);
  assert.equal(isShareCancellation(new Error("network")), false);
});
