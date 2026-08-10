import type { AccessSession, AccessValidationResult, Authorization, AuthorizationInput } from "@/types/demo";

export type UnsubscribeAccess = () => void;

export interface ConfirmEntryResult {
  validation: AccessValidationResult;
  authorization: Authorization | null;
}

export interface AccessRepository {
  readonly backend: "local" | "firebase";
  initialize(): Promise<AccessSession>;
  createAuthorization(input: AuthorizationInput): Promise<Authorization>;
  getAuthorizationByCode(code: string): Promise<Authorization | null>;
  subscribeAuthorization(code: string, listener: (authorization: Authorization | null) => void, onError?: (error: Error) => void): UnsubscribeAccess;
  subscribeOwnedAuthorizations(listener: (authorizations: Authorization[]) => void, onError?: (error: Error) => void): UnsubscribeAccess;
  cancelAuthorization(code: string): Promise<void>;
  revokeAuthorization(code: string): Promise<void>;
  confirmEntry(code: string): Promise<ConfirmEntryResult>;
  resetDemoScenarios(): Promise<Authorization[]>;
}

export class AccessRepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: "CONFIGURATION" | "CONNECTION" | "COLLISION" | "PERMISSION" | "UNKNOWN",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AccessRepositoryError";
  }
}
