import type { AccessRepository } from "@/repositories/access-repository";
import { FirebaseAccessRepository } from "@/repositories/firebase-access-repository";
import { LocalAccessRepository } from "@/repositories/local-access-repository";

let repository: AccessRepository | null = null;

export function getDemoBackend(): "local" | "firebase" {
  return process.env.NEXT_PUBLIC_DEMO_BACKEND === "firebase" ? "firebase" : "local";
}

export function getAccessRepository(): AccessRepository {
  if (!repository) repository = getDemoBackend() === "firebase" ? new FirebaseAccessRepository() : new LocalAccessRepository();
  return repository;
}
