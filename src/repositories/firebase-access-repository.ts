import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  Timestamp,
  where,
} from "firebase/firestore";
import { createInitialAuthorizations, createUniqueAuthorization, generateAccessCode, normalizeAccessCode, validateAccess } from "@/lib/access";
import { ensureAnonymousUser } from "@/lib/firebase/auth";
import { getFirebaseDatabase } from "@/lib/firebase/client";
import type { AccessRepository, ConfirmEntryResult, UnsubscribeAccess } from "@/repositories/access-repository";
import { AccessRepositoryError } from "@/repositories/access-repository";
import { authorizationToFirebase, firebaseToAuthorization } from "@/repositories/firebase-mapping";
import type { AccessSession, Authorization, AuthorizationInput } from "@/types/demo";

const AUTHORIZATIONS = "demo_authorizations";
const EVENTS = "demo_access_events";

function repositoryError(error: unknown): AccessRepositoryError {
  if (process.env.NODE_ENV === "development") console.error("Firebase demo repository error", error);
  const message = error instanceof Error ? error.message : "Unknown Firebase error";
  const code = message.includes("permission-denied") ? "PERMISSION" : "CONNECTION";
  return new AccessRepositoryError("No fue posible completar la operación de demostración.", code, { cause: error });
}

export class FirebaseAccessRepository implements AccessRepository {
  readonly backend = "firebase" as const;
  private session: AccessSession | null = null;

  async initialize(): Promise<AccessSession> {
    if (this.session) return this.session;
    try {
      const user = await ensureAnonymousUser();
      this.session = { uid: user.uid, backend: this.backend };
      return this.session;
    } catch (error) {
      throw repositoryError(error);
    }
  }

  async createAuthorization(input: AuthorizationInput): Promise<Authorization> {
    const session = await this.initialize();
    const db = getFirebaseDatabase();
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const authorization = await createUniqueAuthorization(input, async () => false);
      const reference = doc(db, AUTHORIZATIONS, authorization.code);
      try {
        const created = await runTransaction(db, async (transaction) => {
          const existing = await transaction.get(reference);
          if (existing.exists()) return false;
          const owned = { ...authorization, id: authorization.code, createdByUid: session.uid };
          transaction.set(reference, authorizationToFirebase(owned, session.uid, Timestamp));
          return owned;
        });
        if (created) return created;
      } catch (error) {
        throw repositoryError(error);
      }
    }
    throw new AccessRepositoryError("No fue posible generar un código único.", "COLLISION");
  }

  async getAuthorizationByCode(code: string): Promise<Authorization | null> {
    await this.initialize();
    const normalized = normalizeAccessCode(code);
    try {
      const snapshot = await getDoc(doc(getFirebaseDatabase(), AUTHORIZATIONS, normalized));
      return snapshot.exists() ? firebaseToAuthorization(snapshot.data()) : null;
    } catch (error) {
      throw repositoryError(error);
    }
  }

  subscribeAuthorization(code: string, listener: (authorization: Authorization | null) => void, onError?: (error: Error) => void): UnsubscribeAccess {
    const normalized = normalizeAccessCode(code);
    return onSnapshot(doc(getFirebaseDatabase(), AUTHORIZATIONS, normalized), (snapshot) => {
      listener(snapshot.exists() ? firebaseToAuthorization(snapshot.data()) : null);
    }, (error) => onError?.(repositoryError(error)));
  }

  subscribeOwnedAuthorizations(listener: (authorizations: Authorization[]) => void, onError?: (error: Error) => void): UnsubscribeAccess {
    let unsubscribe: UnsubscribeAccess = () => undefined;
    void this.initialize().then((session) => {
      const ownedQuery = query(collection(getFirebaseDatabase(), AUTHORIZATIONS), where("createdByUid", "==", session.uid));
      unsubscribe = onSnapshot(ownedQuery, (snapshot) => {
        const authorizations = snapshot.docs.map((item) => firebaseToAuthorization(item.data())).filter((item): item is Authorization => Boolean(item)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        listener(authorizations);
      }, (error) => onError?.(repositoryError(error)));
    }).catch((error) => onError?.(repositoryError(error)));
    return () => unsubscribe();
  }

  async cancelAuthorization(code: string): Promise<void> {
    const session = await this.initialize();
    const reference = doc(getFirebaseDatabase(), AUTHORIZATIONS, normalizeAccessCode(code));
    try {
      await runTransaction(getFirebaseDatabase(), async (transaction) => {
        const snapshot = await transaction.get(reference);
        if (!snapshot.exists()) throw new Error("not-found");
        const authorization = firebaseToAuthorization(snapshot.data());
        if (!authorization || authorization.createdByUid !== session.uid) throw new Error("permission-denied");
        transaction.update(reference, { status: "cancelled", cancelledAt: Timestamp.now(), updatedAt: Timestamp.now() });
      });
    } catch (error) {
      throw repositoryError(error);
    }
  }

  revokeAuthorization(code: string): Promise<void> {
    return this.cancelAuthorization(code);
  }

  async confirmEntry(code: string): Promise<ConfirmEntryResult> {
    await this.initialize();
    const db = getFirebaseDatabase();
    const normalized = normalizeAccessCode(code);
    const reference = doc(db, AUTHORIZATIONS, normalized);
    try {
      return await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);
        const authorization = snapshot.exists() ? firebaseToAuthorization(snapshot.data()) : null;
        const now = new Date();
        const validation = validateAccess(normalized, authorization, now);
        if (!authorization || validation.code !== "AUTHORIZED") return { validation, authorization };
        const updated: Authorization = {
          ...authorization,
          entryCount: authorization.entryCount + 1,
          lastEntryAt: now.toISOString(),
          entryAt: now.toISOString(),
          updatedAt: now.toISOString(),
          status: authorization.usageMode === "single-entry" ? "used" : "active",
        };
        transaction.update(reference, {
          entryCount: updated.entryCount,
          lastEntryAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
          status: updated.status,
        });
        const eventReference = doc(collection(db, EVENTS));
        transaction.set(eventReference, {
          authorizationId: authorization.id,
          authorizationCode: authorization.code,
          eventType: "entry_confirmed",
          eventAt: Timestamp.fromDate(now),
          residenceId: authorization.residenceId,
          securityStation: "Puesto Principal",
          demo: true,
          schemaVersion: 1,
        });
        return { validation, authorization: updated };
      });
    } catch (error) {
      throw repositoryError(error);
    }
  }

  async resetDemoScenarios(): Promise<Authorization[]> {
    const session = await this.initialize();
    const db = getFirebaseDatabase();
    const seeds = createInitialAuthorizations();
    const now = new Date().toISOString();
    const templates: Authorization[] = [
      { ...seeds[1], status: "active", entryCount: 0, lastEntryAt: undefined, entryAt: undefined },
      { ...seeds[0], status: "active" },
      { ...seeds[1], status: "used", entryCount: 1 },
      { ...seeds[2], status: "expired", entryCount: 0 },
      { ...seeds[4], status: "cancelled", entryCount: 0, cancelledAt: now },
    ];
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const scenarios = templates.map((template) => {
        const code = generateAccessCode();
        return { ...template, id: code, code, createdByUid: session.uid, createdAt: now, updatedAt: now };
      });
      try {
        const created = await runTransaction(db, async (transaction) => {
          const references = scenarios.map((scenario) => doc(db, AUTHORIZATIONS, scenario.code));
          const snapshots = await Promise.all(references.map((reference) => transaction.get(reference)));
          if (snapshots.some((snapshot) => snapshot.exists())) return false;
          references.forEach((reference, index) => transaction.set(reference, authorizationToFirebase(scenarios[index], session.uid, Timestamp)));
          return true;
        });
        if (created) return scenarios;
      } catch (error) {
        throw repositoryError(error);
      }
    }
    throw new AccessRepositoryError("No fue posible restablecer los escenarios de Firebase.", "COLLISION");
  }
}
