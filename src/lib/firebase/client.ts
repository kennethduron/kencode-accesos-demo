import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebasePublicConfig } from "@/lib/firebase/config";

let firestore: Firestore | null = null;

export function getFirebaseClientApp(): FirebaseApp {
  if (typeof window === "undefined") throw new Error("Firebase client is only available in the browser");
  return getApps().length ? getApp() : initializeApp(getFirebasePublicConfig());
}

export function getFirebaseDatabase(): Firestore {
  if (!firestore) firestore = getFirestore(getFirebaseClientApp());
  return firestore;
}
