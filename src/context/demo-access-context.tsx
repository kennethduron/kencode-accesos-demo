"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { cancelAuthorization, createInitialAuthorizations, hydrateStoredDemoState, STORAGE_KEY } from "@/lib/access";
import type { Authorization } from "@/types/demo";

interface DemoState {
  authorizations: Authorization[];
  selectedId: string | null;
  hydrated: boolean;
}

type DemoAction =
  | { type: "hydrate"; payload: { authorizations: Authorization[]; selectedId: string | null } }
  | { type: "create"; payload: Authorization }
  | { type: "select"; payload: string }
  | { type: "cancel"; payload: string }
  | { type: "reset"; payload: Authorization[] };

interface DemoAccessContextValue extends DemoState {
  selectedAuthorization: Authorization | null;
  addAuthorization: (authorization: Authorization) => void;
  selectAuthorization: (id: string) => void;
  cancelById: (id: string) => void;
  resetDemo: () => void;
}

const initialState: DemoState = { authorizations: [], selectedId: null, hydrated: false };

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "hydrate":
      return { ...action.payload, hydrated: true };
    case "create":
      return { ...state, authorizations: [action.payload, ...state.authorizations], selectedId: action.payload.id };
    case "select":
      return state.authorizations.some((item) => item.id === action.payload) ? { ...state, selectedId: action.payload } : state;
    case "cancel":
      return { ...state, authorizations: cancelAuthorization(state.authorizations, action.payload) };
    case "reset":
      return { authorizations: action.payload, selectedId: "seed-family", hydrated: true };
    default:
      return state;
  }
}

const DemoAccessContext = createContext<DemoAccessContextValue | null>(null);

export function DemoAccessProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const stored = hydrateStoredDemoState(window.localStorage.getItem(STORAGE_KEY));
      dispatch({ type: "hydrate", payload: stored });
    } catch {
      dispatch({ type: "hydrate", payload: hydrateStoredDemoState(null) });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, authorizations: state.authorizations, selectedId: state.selectedId }));
    } catch {
      // The demo remains fully usable in memory when browser storage is unavailable.
    }
  }, [state.authorizations, state.hydrated, state.selectedId]);

  const addAuthorization = useCallback((authorization: Authorization) => dispatch({ type: "create", payload: authorization }), []);
  const selectAuthorization = useCallback((id: string) => dispatch({ type: "select", payload: id }), []);
  const cancelById = useCallback((id: string) => dispatch({ type: "cancel", payload: id }), []);
  const resetDemo = useCallback(() => dispatch({ type: "reset", payload: createInitialAuthorizations() }), []);

  const value = useMemo<DemoAccessContextValue>(() => ({
    ...state,
    selectedAuthorization: state.authorizations.find((item) => item.id === state.selectedId) ?? null,
    addAuthorization,
    selectAuthorization,
    cancelById,
    resetDemo,
  }), [addAuthorization, cancelById, resetDemo, selectAuthorization, state]);

  return <DemoAccessContext.Provider value={value}>{children}</DemoAccessContext.Provider>;
}

export function useDemoAccess(): DemoAccessContextValue {
  const context = useContext(DemoAccessContext);
  if (!context) throw new Error("useDemoAccess must be used inside DemoAccessProvider");
  return context;
}
