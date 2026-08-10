import type { Timestamp } from "firebase/firestore";
import type { Authorization, EntryType, PresenceState, UsageMode, ValidityType, VisitType } from "../types/demo.ts";

export interface FirebaseAuthorizationRecord {
  id: string;
  code: string;
  visitorName: string;
  visitType: VisitType;
  accessType: EntryType;
  vehicleDescription: string;
  plate: string;
  residenceId: string;
  residenceLabel: string;
  status: Authorization["status"];
  usageMode: "single" | "multiple";
  validity: ValidityType;
  startsAt: Timestamp;
  expiresAt: Timestamp;
  entryCount: number;
  exitCount: number;
  presenceState: PresenceState;
  lastEntryAt?: Timestamp | null;
  lastExitAt?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  cancelledAt?: Timestamp | null;
  createdByUid: string;
  demo: true;
  schemaVersion: 1;
}

interface TimestampFactory {
  fromDate(value: Date): Timestamp;
}

function iso(value: unknown): string | undefined {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value.toDate as () => Date)().toISOString();
  }
  return undefined;
}

export function authorizationToFirebase(
  authorization: Authorization,
  createdByUid: string,
  timestamp: TimestampFactory,
): FirebaseAuthorizationRecord {
  return {
    id: authorization.id,
    code: authorization.code,
    visitorName: authorization.visitorName,
    visitType: authorization.visitType,
    accessType: authorization.entryType,
    vehicleDescription: authorization.vehicle,
    plate: authorization.plate,
    residenceId: authorization.residenceId,
    residenceLabel: authorization.residenceLabel,
    status: authorization.status,
    usageMode: authorization.usageMode === "single-entry" ? "single" : "multiple",
    validity: authorization.validity,
    startsAt: timestamp.fromDate(new Date(authorization.scheduledAt)),
    expiresAt: timestamp.fromDate(new Date(authorization.expiresAt)),
    entryCount: authorization.entryCount,
    exitCount: authorization.exitCount,
    presenceState: authorization.presenceState,
    lastEntryAt: authorization.lastEntryAt ? timestamp.fromDate(new Date(authorization.lastEntryAt)) : null,
    lastExitAt: authorization.lastExitAt ? timestamp.fromDate(new Date(authorization.lastExitAt)) : null,
    createdAt: timestamp.fromDate(new Date(authorization.createdAt)),
    updatedAt: timestamp.fromDate(new Date(authorization.updatedAt)),
    cancelledAt: authorization.cancelledAt ? timestamp.fromDate(new Date(authorization.cancelledAt)) : null,
    createdByUid,
    demo: true,
    schemaVersion: 1,
  };
}

export function firebaseToAuthorization(data: Record<string, unknown>): Authorization | null {
  const requiredStrings = ["id", "code", "visitorName", "visitType", "accessType", "vehicleDescription", "plate", "residenceId", "residenceLabel", "status", "usageMode", "validity", "createdByUid"];
  if (!requiredStrings.every((key) => typeof data[key] === "string")) return null;
  const scheduledAt = iso(data.startsAt);
  const expiresAt = iso(data.expiresAt);
  const createdAt = iso(data.createdAt);
  const updatedAt = iso(data.updatedAt);
  if (!scheduledAt || !expiresAt || !createdAt || !updatedAt || !Number.isInteger(data.entryCount) || Number(data.entryCount) < 0) return null;
  const usageMode: UsageMode = data.usageMode === "single" ? "single-entry" : data.usageMode === "multiple" ? "multiple-entry" : "single-entry";
  const lastEntryAt = iso(data.lastEntryAt);
  const lastExitAt = iso(data.lastExitAt);
  const inferredPresence: PresenceState = lastEntryAt && (!lastExitAt || new Date(lastEntryAt) > new Date(lastExitAt)) ? "inside" : "outside";
  const presenceState: PresenceState = data.presenceState === "inside" ? "inside" : data.presenceState === "outside" ? "outside" : inferredPresence;
  const exitCount = Number.isInteger(data.exitCount) && Number(data.exitCount) >= 0 ? Number(data.exitCount) : lastExitAt ? 1 : 0;
  return {
    id: String(data.id),
    code: String(data.code),
    visitorName: String(data.visitorName),
    visitType: data.visitType as VisitType,
    entryType: data.accessType as EntryType,
    vehicle: String(data.vehicleDescription),
    plate: String(data.plate),
    residenceId: String(data.residenceId),
    residenceLabel: String(data.residenceLabel),
    status: data.status as Authorization["status"],
    usageMode,
    validity: data.validity as ValidityType,
    scheduledAt,
    expiresAt,
    entryCount: Number(data.entryCount),
    exitCount,
    presenceState,
    lastEntryAt,
    lastExitAt,
    entryAt: lastEntryAt,
    exitAt: lastExitAt,
    createdAt,
    updatedAt,
    cancelledAt: iso(data.cancelledAt),
    createdByUid: String(data.createdByUid),
  };
}
