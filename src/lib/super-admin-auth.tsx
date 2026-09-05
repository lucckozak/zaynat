"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Platform-level operator identity — deliberately SEPARATE from any
 * tenant's `User`/auth (see spec's "platform-owned vs salon-owned data"
 * split). A Super Admin is not a row in any salon's Database.
 */

const SUPERADMINS_KEY = "platform:superadmins";
const SESSION_KEY = "platform:superadmin:session";

interface SuperAdminAccount {
  id: string;
  name: string;
  email: string;
  password: string;
}

const DEFAULT_SUPERADMINS: SuperAdminAccount[] = [
  {
    id: "sa_1",
    name: "Platform Operator",
    email: "platform@admin.app",
    password: "password",
  },
];

function readAccounts(): SuperAdminAccount[] {
  if (typeof window === "undefined") return DEFAULT_SUPERADMINS;
  try {
    const raw = window.localStorage.getItem(SUPERADMINS_KEY);
    if (raw) return JSON.parse(raw) as SuperAdminAccount[];
    window.localStorage.setItem(SUPERADMINS_KEY, JSON.stringify(DEFAULT_SUPERADMINS));
    return DEFAULT_SUPERADMINS;
  } catch {
    return DEFAULT_SUPERADMINS;
  }
}

interface SuperAdminValue {
  account: SuperAdminAccount | null;
  ready: boolean;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;
}

const SuperAdminContext = createContext<SuperAdminValue | null>(null);

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setAccountId(window.localStorage.getItem(SESSION_KEY));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((id: string | null) => {
    setAccountId(id);
    try {
      if (id) window.localStorage.setItem(SESSION_KEY, id);
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<SuperAdminValue>(() => {
    const account = accountId
      ? readAccounts().find((a) => a.id === accountId) ?? null
      : null;
    return {
      account,
      ready,
      signIn: (email, password) => {
        const match = readAccounts().find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (!match) return { ok: false, error: "No platform account found for that email." };
        if (match.password !== password)
          return { ok: false, error: "Incorrect password." };
        persist(match.id);
        return { ok: true };
      },
      signOut: () => persist(null),
    };
  }, [accountId, ready, persist]);

  return (
    <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error("useSuperAdmin must be used within <SuperAdminProvider>");
  return ctx;
}
