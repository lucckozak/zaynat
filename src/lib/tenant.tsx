"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { TenantMeta } from "./types";
import {
  ensureDefaultTenant,
  findTenantBySlug,
  getActiveSalonId,
  getTenantMeta,
  listTenants,
  setActiveSalonId as persistActiveSalonId,
} from "./tenants";

/* ------------------------------------------------------------------ *
 * Tenant resolution — determines which salon is "active" in this browser
 * tab before anything salon-scoped (StoreProvider, AuthProvider, theming)
 * mounts. This app is a fully static export (see next.config.ts) so there
 * is no server-side host/path routing available: resolution happens
 * entirely client-side, via (in priority order) the `?salon=` query param,
 * the last-active tenant remembered in localStorage, or — on a fresh
 * install with no tenants yet — a newly-seeded default tenant.
 * ------------------------------------------------------------------ */

interface TenantValue {
  salonId: string | null;
  tenant: TenantMeta | null;
  tenants: TenantMeta[];
  ready: boolean;
  /** switch which tenant is active in this tab — never destructive to other tenants */
  switchActiveSalon: (salonId: string) => void;
  /** re-read the tenant index after an out-of-band change (e.g. Super Admin edited another tenant) */
  refreshTenants: () => void;
}

const TenantContext = createContext<TenantValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [tenants, setTenants] = useState<TenantMeta[]>([]);
  const [ready, setReady] = useState(false);

  const refreshTenants = useCallback(() => {
    setTenants(listTenants());
  }, []);

  useEffect(() => {
    let salonParam: string | null = null;
    try {
      salonParam = new URLSearchParams(window.location.search).get("salon");
    } catch {
      /* ignore */
    }

    let resolved: string | null = null;
    if (salonParam) {
      resolved = (findTenantBySlug(salonParam) ?? getTenantMeta(salonParam))?.id ?? null;
    }
    if (!resolved) resolved = getActiveSalonId();
    if (!resolved || !getTenantMeta(resolved)) resolved = ensureDefaultTenant();

    persistActiveSalonId(resolved);
    setSalonId(resolved);
    setTenants(listTenants());
    setReady(true);
  }, []);

  const switchActiveSalon = useCallback((id: string) => {
    if (!getTenantMeta(id)) return;
    persistActiveSalonId(id);
    setSalonId(id);
  }, []);

  const tenant = useMemo(
    () => tenants.find((t) => t.id === salonId) ?? null,
    [tenants, salonId],
  );

  const value = useMemo<TenantValue>(
    () => ({ salonId, tenant, tenants, ready, switchActiveSalon, refreshTenants }),
    [salonId, tenant, tenants, ready, switchActiveSalon, refreshTenants],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within <TenantProvider>");
  return ctx;
}
