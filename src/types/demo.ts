export type AccessStatus = "active" | "used" | "completed" | "expired" | "cancelled";

export type VisitType = "uber" | "delivery" | "family" | "friend" | "provider" | "other";

export type EntryType = "car" | "motorcycle" | "pedestrian";

export type ValidityType = "single" | "24h" | "48h" | "custom";

export type UsageMode = "single-entry" | "multiple-entry";

export type DemoRole = "residente" | "seguridad" | "administracion";

export interface DemoResident {
  firstName: string;
  home: string;
  community: string;
}

export interface DemoAccess {
  visitor: string;
  visitorType: string;
  vehicle: string;
  plate: string;
  code: string;
  status: AccessStatus;
}

export interface Authorization {
  id: string;
  code: string;
  visitorName: string;
  visitType: VisitType;
  entryType: EntryType;
  vehicle: string;
  plate: string;
  scheduledAt: string;
  validity: ValidityType;
  status: AccessStatus;
  createdAt: string;
  expiresAt: string;
  usageMode: UsageMode;
  entryAt?: string;
  exitAt?: string;
}

export interface AuthorizationInput {
  visitorName: string;
  visitType: VisitType;
  entryType: EntryType;
  vehicle: string;
  plate: string;
  date: string;
  time: string;
  validity: ValidityType;
  customExpiresAt?: string;
}

export interface StoredDemoState {
  version: 1;
  authorizations: Authorization[];
  selectedId: string | null;
}
