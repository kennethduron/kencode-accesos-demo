import { getAuth, onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { getFirebaseClientApp } from "@/lib/firebase/client";

let userPromise: Promise<User> | null = null;

function waitForInitialAuth(): Promise<User | null> {
  const auth = getAuth(getFirebaseClientApp());
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

export function ensureAnonymousUser(): Promise<User> {
  if (!userPromise) {
    userPromise = (async () => {
      const auth = getAuth(getFirebaseClientApp());
      const existing = await waitForInitialAuth();
      if (existing) return existing;
      const credential = await signInAnonymously(auth);
      return credential.user;
    })().catch((error) => {
      userPromise = null;
      throw error;
    });
  }
  return userPromise;
}
