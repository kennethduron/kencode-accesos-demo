import { isValidAccessCode, normalizeAccessCode } from "./access.ts";

export const QR_PAYLOAD_PREFIX = "KCA1";

export function buildQrPayload(code: string): string {
  const normalized = normalizeAccessCode(code);
  if (!isValidAccessCode(normalized)) throw new Error("Invalid access code");
  return `${QR_PAYLOAD_PREFIX}:${normalized}`;
}

export function parseQrPayload(payload: string): string | null {
  if (typeof payload !== "string") return null;
  const match = payload.trim().match(/^KCA1:([^:]+)$/);
  if (!match) return null;
  const code = normalizeAccessCode(match[1]);
  return isValidAccessCode(code) ? code : null;
}
