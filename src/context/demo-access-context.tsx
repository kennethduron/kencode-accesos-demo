"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { getAccessRepository, getDemoBackend } from "@/repositories";
import type { Authorization, AuthorizationInput } from "@/types/demo";

const SELECTED_KEY = "kencode-selected-authorization-v1";

interface DemoState {
  authorizations: Authorization[];
  selectedId: string | null;
  hydrated: boolean;
  busy: boolean;
  error: string;
}

type DemoAction =
  | { type: "ready"; payload: Authorization[] }
  | { type: "sync"; payload: Authorization[] }
  | { type: "upsert"; payload: Authorization }
  | { type: "select"; payload: string }
  | { type: "busy"; payload: boolean }
  | { type: "error"; payload: string };

interface DemoAccessContextValue extends DemoState {
  backend: "local" | "firebase";
  selectedAuthorization: Authorization | null;
  createAccess: (input: AuthorizationInput) => Promise<Authorization>;
  selectAuthorization: (id: string) => void;
  cancelById: (id: string) => Promise<void>;
  resetDemo: () => Promise<boolean>;
  clearError: () => void;
}

const initialState: DemoState = { authorizations: [], selectedId: null, hydrated: false, busy: false, error: "" };

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "ready": {
      const stored = typeof window === "undefined" ? null : window.localStorage.getItem(SELECTED_KEY);
      const selectedId = stored && action.payload.some((item) => item.id === stored) ? stored : action.payload[0]?.id ?? null;
      return { ...state, authorizations: action.payload, selectedId, hydrated: true, error: "" };
    }
    case "sync": {
      const selectedId = state.selectedId && action.payload.some((item) => item.id === state.selectedId) ? state.selectedId : action.payload[0]?.id ?? null;
      return { ...state, authorizations: action.payload, selectedId, hydrated: true };
    }
    case "upsert": {
      const remaining = state.authorizations.filter((item) => item.id !== action.payload.id);
      return { ...state, authorizations: [action.payload, ...remaining], selectedId: action.payload.id };
    }
    case "select":
      return state.authorizations.some((item) => item.id === action.payload) ? { ...state, selectedId: action.payload } : state;
    case "busy":
      return { ...state, busy: action.payload };
    case "error":
      return { ...state, error: action.payload, busy: false, hydrated: true };
    default:
      return state;
  }
}

const DemoAccessContext = createContext<DemoAccessContextValue | null>(null);

export function DemoAccessProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const backend = getDemoBackend();

  useEffect(() => {
    const repository = getAccessRepository();
    let unsubscribe: () => void = () => undefined;
    let active = true;
    repository.initialize()
      .then(() => {
        if (!active) return;
        unsubscribe = repository.subscribeOwnedAuthorizations(
          (authorizations) => dispatch({ type: state.hydrated ? "sync" : "ready", payload: authorizations }),
          () => dispatch({ type: "error", payload: "No fue posible conectar el servicio de demostración. Intente nuevamente." }),
        );
      })
      .catch(() => dispatch({ type: "error", payload: "No fue posible conectar el servicio de demostración. Intente nuevamente." }));
    return () => {
      active = false;
      unsubscribe();
    };
    // Hydration occurs once; subsequent updates arrive through the repository listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.selectedId) return;
    window.localStorage.setItem(SELECTED_KEY, state.selectedId);
  }, [state.selectedId]);

  const createAccess = useCallback(async (input: AuthorizationInput) => {
    dispatch({ type: "busy", payload: true });
    dispatch({ type: "error", payload: "" });
    try {
      const authorization = await getAccessRepository().createAuthorization(input);
      dispatch({ type: "upsert", payload: authorization });
      return authorization;
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Access repository create failed", error);
      dispatch({ type: "error", payload: "No fue posible generar el acceso. Intente nuevamente." });
      throw error;
    } finally {
      dispatch({ type: "busy", payload: false });
    }
  }, []);

  const selectAuthorization = useCallback((id: string) => dispatch({ type: "select", payload: id }), []);

  const cancelById = useCallback(async (id: string) => {
    const authorization = state.authorizations.find((item) => item.id === id);
    if (!authorization) return;
    dispatch({ type: "busy", payload: true });
    try {
      await getAccessRepository().cancelAuthorization(authorization.code);
      const now = new Date().toISOString();
      dispatch({ type: "upsert", payload: { ...authorization, status: "cancelled", cancelledAt: now, updatedAt: now } });
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Access repository cancel failed", error);
      dispatch({ type: "error", payload: "No fue posible cancelar el permiso. Intente nuevamente." });
    } finally {
      dispatch({ type: "busy", payload: false });
    }
  }, [state.authorizations]);

  const resetDemo = useCallback(async () => {
    dispatch({ type: "busy", payload: true });
    try {
      const authorizations = await getAccessRepository().resetDemoScenarios();
      dispatch({ type: "ready", payload: authorizations });
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Demo reset failed", error);
      dispatch({ type: "error", payload: "No fue posible restablecer los escenarios. Intente nuevamente." });
      return false;
    } finally {
      dispatch({ type: "busy", payload: false });
    }
  }, []);

  const clearError = useCallback(() => dispatch({ type: "error", payload: "" }), []);
  const value = useMemo<DemoAccessContextValue>(() => ({
    ...state,
    backend,
    selectedAuthorization: state.authorizations.find((item) => item.id === state.selectedId) ?? null,
    createAccess,
    selectAuthorization,
    cancelById,
    resetDemo,
    clearError,
  }), [backend, cancelById, clearError, createAccess, resetDemo, selectAuthorization, state]);

  return <DemoAccessContext.Provider value={value}>{children}</DemoAccessContext.Provider>;
}

export function useDemoAccess(): DemoAccessContextValue {
  const context = useContext(DemoAccessContext);
  if (!context) throw new Error("useDemoAccess must be used inside DemoAccessProvider");
  return context;
}
