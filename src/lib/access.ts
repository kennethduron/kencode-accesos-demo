import type {
  AccessStatus,
  AccessEvent,
  AccessValidationResult,
  Authorization,
  AuthorizationInput,
  EntryType,
  StoredDemoState,
  UsageMode,
  ValidityType,
  VisitType,
} from "@/types/demo";

export const STORAGE_KEY = "kencode-access-demo-v1";
export const LOCAL_SESSION_KEY = "kencode-access-local-session-v1";
export const DEMO_RESIDENCE_ID = "valle-azul-casa-27";
export const DEMO_RESIDENCE_LABEL = "Casa 27 · ECOTERRA";
export const ACCESS_CODE_PATTERN = /^[A-HJ-KM-NP-Z2-9]{4}-[A-HJ-KM-NP-Z2-9]{4}$/;

export const visitTypeLabels: Record<VisitType, string> = {
  uber: "Uber",
  delivery: "Delivery",
  family: "Familiar",
  friend: "Amigo",
  provider: "Proveedor",
  other: "Otro",
};

export const entryTypeLabels: Record<EntryType, string> = {
  car: "Automóvil",
  motorcycle: "Motocicleta",
  pedestrian: "Peatonal",
};

export const validityLabels: Record<ValidityType, string> = {
  single: "1 ingreso",
  "24h": "24 horas",
  "48h": "48 horas",
  custom: "Horario personalizado",
};

export const statusLabels: Record<AccessStatus, string> = {
  active: "Activo",
  used: "Utilizado",
  completed: "Finalizado",
  expired: "Vencido",
  cancelled: "Cancelado",
};

const visitTypes = Object.keys(visitTypeLabels) as VisitType[];
const entryTypes = Object.keys(entryTypeLabels) as EntryType[];
const validities = Object.keys(validityLabels) as ValidityType[];
const statuses = Object.keys(statusLabels) as AccessStatus[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export function toLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toLocalTimeInput(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function parseLocalDateTime(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (toLocalDateInput(parsed) !== date || toLocalTimeInput(parsed) !== time) return null;
  return parsed;
}

export type AuthorizationErrors = Partial<Record<"visitorName" | "plate" | "date" | "time" | "validity" | "customExpiresAt", string>>;

export function validateAuthorizationInput(input: AuthorizationInput, now = new Date()): AuthorizationErrors {
  const errors: AuthorizationErrors = {};
  const name = input.visitorName.trim();
  const scheduled = parseLocalDateTime(input.date, input.time);

  if (!name) errors.visitorName = "Ingresa el nombre del visitante.";
  if (!input.date || !scheduled) errors.date = "Selecciona una fecha válida.";
  if (!input.time || !scheduled) errors.time = "Selecciona una hora válida.";
  if (scheduled && scheduled.getTime() < now.getTime() - 5 * 60_000) {
    errors.date = "La visita debe programarse para una fecha y hora futuras.";
    errors.time = "Revisa la hora programada.";
  }
  if (input.entryType !== "pedestrian" && !input.plate.trim()) {
    errors.plate = "Ingresa la placa del vehículo.";
  }
  if (!validities.includes(input.validity)) errors.validity = "Selecciona una vigencia válida.";
  if (input.visitType === "family" && !["24h", "48h"].includes(input.validity)) {
    errors.validity = "Los permisos familiares deben durar 24 o 48 horas.";
  }
  if (input.validity === "custom") {
    const custom = input.customExpiresAt ? new Date(input.customExpiresAt) : null;
    if (!custom || Number.isNaN(custom.getTime()) || (scheduled && custom <= scheduled)) {
      errors.customExpiresAt = "La expiración debe ser posterior al inicio de la visita.";
    }
  }
  return errors;
}

function secureRandom(): number {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    globalThis.crypto.getRandomValues(value);
    return value[0] / 4_294_967_296;
  }
  return Math.random();
}

export function generateAccessCode(random: () => number = secureRandom): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const part = () => Array.from({ length: 4 }, () => alphabet[Math.floor(random() * alphabet.length) % alphabet.length]).join("");
  return `${part()}-${part()}`;
}

export function normalizeAccessCode(value: string): string {
  const compact = value
    .trim()
    .toUpperCase()
    .replace(/[‐‑‒–—―−]/g, "-")
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-");
  const withoutHyphen = compact.replace(/-/g, "").slice(0, 8);
  if (withoutHyphen.length <= 4) return withoutHyphen;
  return `${withoutHyphen.slice(0, 4)}-${withoutHyphen.slice(4)}`;
}

export function isValidAccessCode(value: string): boolean {
  return ACCESS_CODE_PATTERN.test(normalizeAccessCode(value));
}

function expirationFor(input: AuthorizationInput, scheduled: Date): Date {
  if (input.validity === "24h") return new Date(scheduled.getTime() + 24 * 60 * 60 * 1000);
  if (input.validity === "48h") return new Date(scheduled.getTime() + 48 * 60 * 60 * 1000);
  if (input.validity === "custom" && input.customExpiresAt) return new Date(input.customExpiresAt);
  return new Date(scheduled.getTime() + 12 * 60 * 60 * 1000);
}

export function createAuthorization(input: AuthorizationInput, now = new Date(), random: () => number = secureRandom): Authorization {
  const errors = validateAuthorizationInput(input, now);
  if (Object.keys(errors).length > 0) throw new Error("Invalid authorization input");

  const scheduled = parseLocalDateTime(input.date, input.time);
  if (!scheduled) throw new Error("Invalid scheduled date");
  const code = generateAccessCode(random);
  const usageMode: UsageMode = input.validity === "single" ? "single-entry" : "multiple-entry";

  return {
    id: `auth-${now.getTime()}-${code.replace("-", "").toLowerCase()}`,
    code,
    visitorName: input.visitorName.trim(),
    visitType: input.visitType,
    entryType: input.entryType,
    vehicle: input.entryType === "pedestrian" ? "Peatonal" : input.vehicle.trim() || entryTypeLabels[input.entryType],
    plate: input.entryType === "pedestrian" ? "No aplica" : input.plate.trim().toUpperCase(),
    scheduledAt: scheduled.toISOString(),
    validity: input.validity,
    status: "active",
    createdAt: now.toISOString(),
    expiresAt: expirationFor(input, scheduled).toISOString(),
    usageMode,
    residenceId: DEMO_RESIDENCE_ID,
    residenceLabel: DEMO_RESIDENCE_LABEL,
    entryCount: 0,
    exitCount: 0,
    presenceState: "outside",
    updatedAt: now.toISOString(),
  };
}

export async function createUniqueAuthorization(
  input: AuthorizationInput,
  codeExists: (code: string) => Promise<boolean>,
  now = new Date(),
  random: () => number = secureRandom,
  maxAttempts = 12,
): Promise<Authorization> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const authorization = createAuthorization(input, now, random);
    if (!(await codeExists(authorization.code))) return authorization;
  }
  throw new Error("Unable to generate a unique access code");
}

export function resolveAuthorizationStatus(authorization: Authorization, now = new Date()): AccessStatus {
  if (!["cancelled", "completed"].includes(authorization.status) && new Date(authorization.expiresAt).getTime() <= now.getTime()) return "expired";
  if (authorization.usageMode === "single-entry" && authorization.entryCount > 0) return "used";
  return authorization.status;
}

export function validateAccess(
  rawCode: string,
  authorization: Authorization | null,
  now = new Date(),
): AccessValidationResult {
  const normalizedCode = normalizeAccessCode(rawCode);
  if (!ACCESS_CODE_PATTERN.test(normalizedCode)) return { code: "INVALID_FORMAT", normalizedCode, authorization: null };
  if (!authorization) return { code: "NOT_FOUND", normalizedCode, authorization: null };
  if (authorization.usageMode === "multiple-entry" && authorization.presenceState === "inside") {
    return { code: "INSIDE", normalizedCode, authorization };
  }
  if (authorization.status === "cancelled") return { code: "CANCELLED", normalizedCode, authorization };
  if (new Date(authorization.scheduledAt).getTime() > now.getTime()) return { code: "NOT_YET_VALID", normalizedCode, authorization };
  if (new Date(authorization.expiresAt).getTime() <= now.getTime()) return { code: "EXPIRED", normalizedCode, authorization };
  if (authorization.usageMode === "single-entry" && (authorization.entryCount > 0 || authorization.status === "used")) {
    return { code: "USED", normalizedCode, authorization };
  }
  return { code: "AUTHORIZED", normalizedCode, authorization };
}

export function confirmEntryInDomain(
  authorization: Authorization,
  now = new Date(),
): { authorization: Authorization; validation: AccessValidationResult } {
  const validation = validateAccess(authorization.code, authorization, now);
  if (validation.code !== "AUTHORIZED") return { authorization, validation };
  const entryCount = authorization.entryCount + 1;
  return {
    authorization: {
      ...authorization,
      entryCount,
      presenceState: "inside",
      lastEntryAt: now.toISOString(),
      entryAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: authorization.usageMode === "single-entry" ? "used" : "active",
    },
    validation,
  };
}

export function confirmExitInDomain(
  authorization: Authorization,
  now = new Date(),
): { authorization: Authorization; confirmed: boolean } {
  if (authorization.usageMode !== "multiple-entry" || authorization.presenceState !== "inside") {
    return { authorization, confirmed: false };
  }

  const exitCount = authorization.exitCount + 1;
  return {
    confirmed: true,
    authorization: {
      ...authorization,
      presenceState: "outside",
      exitCount,
      lastExitAt: now.toISOString(),
      exitAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  };
}

export function createAccessEvent(
  authorization: Authorization,
  eventType: AccessEvent["eventType"],
  now = new Date(),
): AccessEvent {
  return {
    authorizationId: authorization.id,
    authorizationCode: authorization.code,
    eventType,
    eventAt: now.toISOString(),
    residenceId: authorization.residenceId,
    securityStation: "Puesto Principal",
    demo: true,
    schemaVersion: 1,
  };
}

export function cancelAuthorization(authorizations: Authorization[], id: string): Authorization[] {
  const cancelledAt = new Date().toISOString();
  return authorizations.map((authorization) =>
    authorization.id === id ? { ...authorization, status: "cancelled" as const, cancelledAt, updatedAt: cancelledAt } : authorization,
  );
}

export type HistoryFilter = "all" | "finalized" | AccessStatus;

export function filterAuthorizations(
  authorizations: Authorization[],
  query: string,
  filter: HistoryFilter,
  date: string,
  now = new Date(),
): Authorization[] {
  const normalized = query.trim().toLocaleLowerCase("es");
  return authorizations.filter((authorization) => {
    const status = resolveAuthorizationStatus(authorization, now);
    const searchable = `${authorization.visitorName} ${authorization.code}`.toLocaleLowerCase("es");
    const matchesQuery = !normalized || searchable.includes(normalized);
    const matchesFilter = filter === "all" || status === filter || (filter === "finalized" && ["used", "completed"].includes(status));
    const matchesDate = !date || toLocalDateInput(new Date(authorization.scheduledAt)) === date;
    return matchesQuery && matchesFilter && matchesDate;
  });
}

function isAuthorization(value: unknown): value is Authorization {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.code === "string" &&
    ACCESS_CODE_PATTERN.test(value.code) &&
    typeof value.visitorName === "string" &&
    visitTypes.includes(value.visitType as VisitType) &&
    entryTypes.includes(value.entryType as EntryType) &&
    typeof value.vehicle === "string" &&
    typeof value.plate === "string" &&
    isIsoDate(value.scheduledAt) &&
    validities.includes(value.validity as ValidityType) &&
    statuses.includes(value.status as AccessStatus) &&
    isIsoDate(value.createdAt) &&
    isIsoDate(value.expiresAt) &&
    ["single-entry", "multiple-entry"].includes(value.usageMode as UsageMode) &&
    (value.residenceId === undefined || typeof value.residenceId === "string") &&
    (value.residenceLabel === undefined || typeof value.residenceLabel === "string") &&
    (value.entryCount === undefined || (typeof value.entryCount === "number" && Number.isInteger(value.entryCount) && value.entryCount >= 0)) &&
    (value.exitCount === undefined || (typeof value.exitCount === "number" && Number.isInteger(value.exitCount) && value.exitCount >= 0)) &&
    (value.presenceState === undefined || ["outside", "inside"].includes(value.presenceState as string)) &&
    (value.updatedAt === undefined || isIsoDate(value.updatedAt)) &&
    (value.lastEntryAt === undefined || isIsoDate(value.lastEntryAt)) &&
    (value.lastExitAt === undefined || isIsoDate(value.lastExitAt)) &&
    (value.createdByUid === undefined || typeof value.createdByUid === "string") &&
    (value.cancelledAt === undefined || isIsoDate(value.cancelledAt)) &&
    (value.entryAt === undefined || isIsoDate(value.entryAt)) &&
    (value.exitAt === undefined || isIsoDate(value.exitAt))
  );
}

function normalizeHydratedAuthorization(authorization: Authorization): Authorization {
  const lastEntryAt = authorization.lastEntryAt ?? authorization.entryAt;
  const lastExitAt = authorization.lastExitAt ?? authorization.exitAt;
  const inferredPresence = lastEntryAt && (!lastExitAt || new Date(lastEntryAt) > new Date(lastExitAt)) ? "inside" : "outside";
  return {
    ...authorization,
    residenceId: authorization.residenceId ?? DEMO_RESIDENCE_ID,
    residenceLabel: authorization.residenceLabel ?? DEMO_RESIDENCE_LABEL,
    entryCount: authorization.entryCount ?? (authorization.entryAt ? 1 : 0),
    exitCount: authorization.exitCount ?? (lastExitAt ? 1 : 0),
    presenceState: authorization.presenceState ?? inferredPresence,
    lastEntryAt,
    lastExitAt,
    updatedAt: authorization.updatedAt ?? authorization.createdAt,
  };
}

function relativeIso(now: Date, hours: number, minutes = 0): string {
  return new Date(now.getTime() + (hours * 60 + minutes) * 60_000).toISOString();
}

export function createInitialAuthorizations(now = new Date()): Authorization[] {
  const today = toLocalDateInput(now);
  const yesterday = toLocalDateInput(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const at = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString();

  return [
    { id: "seed-family", code: "A7X9-2K4P", visitorName: "María Gómez", visitType: "family", entryType: "car", vehicle: "Toyota Corolla", plate: "ABC-123", scheduledAt: at(today, "16:20"), validity: "48h", status: "active", createdAt: relativeIso(now, -1), expiresAt: relativeIso(now, 47, 52), usageMode: "multiple-entry", entryAt: at(today, "16:20") },
    { id: "seed-uber", code: "UBR2-7K4M", visitorName: "Uber", visitType: "uber", entryType: "car", vehicle: "Vehículo de plataforma", plate: "HND-8420", scheduledAt: at(today, "14:45"), validity: "single", status: "used", createdAt: relativeIso(now, -4), expiresAt: relativeIso(now, 8), usageMode: "single-entry", entryAt: at(today, "14:45") },
    { id: "seed-delivery", code: "DLV5-2P9Q", visitorName: "Carlos López", visitType: "delivery", entryType: "motorcycle", vehicle: "Motocicleta de reparto", plate: "MTR-218", scheduledAt: at(yesterday, "20:12"), validity: "single", status: "expired", createdAt: relativeIso(now, -28), expiresAt: relativeIso(now, -16), usageMode: "single-entry" },
    { id: "seed-friend", code: "AMG4-8H2N", visitorName: "Laura Martínez", visitType: "friend", entryType: "pedestrian", vehicle: "Peatonal", plate: "No aplica", scheduledAt: at(today, "10:15"), validity: "single", status: "completed", createdAt: relativeIso(now, -8), expiresAt: relativeIso(now, 4), usageMode: "single-entry", entryAt: at(today, "10:16"), exitAt: at(today, "11:05") },
    { id: "seed-provider", code: "PRV8-3J6K", visitorName: "Servicios Técnicos", visitType: "provider", entryType: "car", vehicle: "Panel blanca", plate: "PAA-7041", scheduledAt: at(today, "09:30"), validity: "24h", status: "active", createdAt: relativeIso(now, -10), expiresAt: relativeIso(now, 14), usageMode: "multiple-entry" },
    { id: "seed-family-two", code: "JSM7-4Q8P", visitorName: "José Martínez", visitType: "family", entryType: "car", vehicle: "Honda Civic", plate: "HBC-3042", scheduledAt: at(today, "18:00"), validity: "24h", status: "active", createdAt: relativeIso(now, -2), expiresAt: relativeIso(now, 22), usageMode: "multiple-entry" },
  ].map((authorization) => normalizeHydratedAuthorization(authorization as Authorization));
}

export function hydrateStoredDemoState(raw: string | null, now = new Date()): StoredDemoState {
  const fallbackAuthorizations = createInitialAuthorizations(now);
  const fallback: StoredDemoState = { version: 1, authorizations: fallbackAuthorizations, selectedId: "seed-family" };
  if (!raw) return fallback;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.authorizations)) return fallback;
    const authorizations = parsed.authorizations.filter(isAuthorization).slice(0, 100).map(normalizeHydratedAuthorization);
    if (authorizations.length === 0) return fallback;
    const selectedId = typeof parsed.selectedId === "string" && authorizations.some((item) => item.id === parsed.selectedId)
      ? parsed.selectedId
      : authorizations[0].id;
    return { version: 1, authorizations, selectedId };
  } catch {
    return fallback;
  }
}

export function formatRemainingTime(expiresAt: string, now = new Date()): string {
  const difference = new Date(expiresAt).getTime() - now.getTime();
  if (difference <= 0) return "Vencido";
  const totalMinutes = Math.ceil(difference / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} d ${hours} h`;
  return `${hours} h ${minutes} min`;
}

export function formatDemoDate(value: string): string {
  return new Intl.DateTimeFormat("es-HN", { dateStyle: "medium" }).format(new Date(value));
}

export function formatDemoTime(value: string): string {
  return new Intl.DateTimeFormat("es-HN", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
