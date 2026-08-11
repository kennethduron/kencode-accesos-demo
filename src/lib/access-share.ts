import { formatDemoDate, formatDemoTime, normalizeAccessCode, validityLabels, visitTypeLabels } from "./access.ts";
import { buildQrPayload } from "./qr.ts";
import type { AccessStatus, Authorization } from "../types/demo.ts";

export type AccessShareVariant = "access" | "family";
export type ShareCapability = "files" | "text" | "download";

export interface AccessShareCardModel {
  brand: "ECOTERRA";
  product: "Control de Accesos y Visitas";
  title: string;
  statusLabel: string;
  code: string;
  qrPayload: string;
  visitor: string;
  home: string;
  visitType: string;
  validity: string;
  instruction: "Presente este QR o código al personal de seguridad.";
  footer: "Demostración desarrollada por Ken Code";
  filename: string;
  shareable: boolean;
}

const invalidStatusLabels: Record<Exclude<AccessStatus, "active">, string> = {
  used: "CÓDIGO UTILIZADO",
  completed: "ACCESO FINALIZADO",
  expired: "ACCESO VENCIDO",
  cancelled: "ACCESO CANCELADO",
};

function homeFromResidenceLabel(label: string): string {
  const [home] = label.split(/[·•]/);
  return home.trim() || "Casa 27";
}

export function createAccessShareFilename(code: string): string {
  const normalized = normalizeAccessCode(code).toLowerCase();
  return `ecoterra-access-${normalized}.png`;
}

export function buildAccessShareModel(
  authorization: Authorization,
  status: AccessStatus,
  variant: AccessShareVariant = "access",
): AccessShareCardModel {
  const code = normalizeAccessCode(authorization.code);
  const shareable = status === "active";

  return {
    brand: "ECOTERRA",
    product: "Control de Accesos y Visitas",
    title: shareable ? (variant === "family" ? "PERMISO ACTIVO" : "ACCESO AUTORIZADO") : invalidStatusLabels[status],
    statusLabel: shareable ? "VIGENTE" : "NO VIGENTE",
    code,
    qrPayload: buildQrPayload(code),
    visitor: authorization.visitorName,
    home: homeFromResidenceLabel(authorization.residenceLabel),
    visitType: visitTypeLabels[authorization.visitType],
    validity: `${validityLabels[authorization.validity]} · válido hasta ${formatDemoDate(authorization.expiresAt)} · ${formatDemoTime(authorization.expiresAt)}`,
    instruction: "Presente este QR o código al personal de seguridad.",
    footer: "Demostración desarrollada por Ken Code",
    filename: createAccessShareFilename(code),
    shareable,
  };
}

export function buildAccessShareText(model: AccessShareCardModel): string {
  return `${model.brand}\n${model.title}\nCódigo: ${model.code}\n${model.instruction}`;
}

export function getShareCapability(
  shareNavigator: Pick<Navigator, "share" | "canShare"> | undefined,
  files: File[],
): ShareCapability {
  if (!shareNavigator || typeof shareNavigator.share !== "function") return "download";
  if (typeof shareNavigator.canShare !== "function") return "text";
  try {
    return shareNavigator.canShare({ files }) ? "files" : "text";
  } catch {
    return "text";
  }
}

export function isShareCancellation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}
