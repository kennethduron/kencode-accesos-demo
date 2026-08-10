import {
  confirmEntryInDomain,
  createInitialAuthorizations,
  createUniqueAuthorization,
  hydrateStoredDemoState,
  LOCAL_SESSION_KEY,
  normalizeAccessCode,
  STORAGE_KEY,
  validateAccess,
} from "@/lib/access";
import type { AccessRepository, ConfirmEntryResult, UnsubscribeAccess } from "@/repositories/access-repository";
import type { AccessSession, Authorization, AuthorizationInput } from "@/types/demo";

type Listener = (authorizations: Authorization[]) => void;

export class LocalAccessRepository implements AccessRepository {
  readonly backend = "local" as const;
  private authorizations: Authorization[] = [];
  private listeners = new Set<Listener>();
  private initialized = false;
  private storageListener: ((event: StorageEvent) => void) | null = null;

  async initialize(): Promise<AccessSession> {
    if (!this.initialized) {
      const stored = hydrateStoredDemoState(window.localStorage.getItem(STORAGE_KEY));
      this.authorizations = stored.authorizations;
      this.storageListener = (event) => {
        if (event.key !== STORAGE_KEY) return;
        this.authorizations = hydrateStoredDemoState(event.newValue).authorizations;
        this.emit();
      };
      window.addEventListener("storage", this.storageListener);
      this.initialized = true;
    }
    let uid = window.localStorage.getItem(LOCAL_SESSION_KEY);
    if (!uid) {
      uid = `local-${globalThis.crypto.randomUUID()}`;
      window.localStorage.setItem(LOCAL_SESSION_KEY, uid);
    }
    return { uid, backend: this.backend };
  }

  private persist() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, authorizations: this.authorizations, selectedId: this.authorizations[0]?.id ?? null }));
    this.emit();
  }

  private emit() {
    const snapshot = [...this.authorizations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    this.listeners.forEach((listener) => listener(snapshot));
  }

  async createAuthorization(input: AuthorizationInput): Promise<Authorization> {
    const authorization = await createUniqueAuthorization(input, async (code) => this.authorizations.some((item) => item.code === code));
    this.authorizations = [{ ...authorization, createdByUid: (await this.initialize()).uid }, ...this.authorizations];
    this.persist();
    return this.authorizations[0];
  }

  async getAuthorizationByCode(code: string): Promise<Authorization | null> {
    const normalized = normalizeAccessCode(code);
    return this.authorizations.find((item) => item.code === normalized) ?? null;
  }

  subscribeAuthorization(code: string, listener: (authorization: Authorization | null) => void): UnsubscribeAccess {
    const normalized = normalizeAccessCode(code);
    const ownedListener = (authorizations: Authorization[]) => listener(authorizations.find((item) => item.code === normalized) ?? null);
    this.listeners.add(ownedListener);
    ownedListener(this.authorizations);
    return () => this.listeners.delete(ownedListener);
  }

  subscribeOwnedAuthorizations(listener: Listener): UnsubscribeAccess {
    this.listeners.add(listener);
    listener([...this.authorizations]);
    return () => this.listeners.delete(listener);
  }

  async cancelAuthorization(code: string): Promise<void> {
    const now = new Date().toISOString();
    const normalized = normalizeAccessCode(code);
    this.authorizations = this.authorizations.map((item) => item.code === normalized ? { ...item, status: "cancelled", cancelledAt: now, updatedAt: now } : item);
    this.persist();
  }

  revokeAuthorization(code: string): Promise<void> {
    return this.cancelAuthorization(code);
  }

  async confirmEntry(code: string): Promise<ConfirmEntryResult> {
    const authorization = await this.getAuthorizationByCode(code);
    const validation = validateAccess(code, authorization);
    if (!authorization || validation.code !== "AUTHORIZED") return { validation, authorization };
    const confirmed = confirmEntryInDomain(authorization);
    this.authorizations = this.authorizations.map((item) => item.code === authorization.code ? confirmed.authorization : item);
    this.persist();
    return { validation, authorization: confirmed.authorization };
  }

  async resetDemoScenarios(): Promise<Authorization[]> {
    this.authorizations = createInitialAuthorizations();
    this.persist();
    return this.authorizations;
  }
}
