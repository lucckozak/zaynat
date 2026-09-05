import type { Emirate, SubscriptionPlanId, TenantMeta } from "./types";
import { generateSeedDatabase, loadDatabase, resetDatabase, saveDatabase } from "./data/seed";
import { getPreset } from "./data/presets";
import { uid } from "./utils";

const INDEX_KEY = "platform:tenants";
const ACTIVE_KEY = "platform:activeSalon";
const CONTRACT_VERSION = "v1.0";
const TRIAL_DAYS = 14;

function readIndex(): TenantMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as TenantMeta[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(tenants: TenantMeta[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(tenants));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function listTenants(): TenantMeta[] {
  return readIndex();
}

export function getTenantMeta(salonId: string): TenantMeta | null {
  return readIndex().find((t) => t.id === salonId) ?? null;
}

export function findTenantBySlug(slug: string): TenantMeta | null {
  return readIndex().find((t) => t.slug === slug) ?? null;
}

export function updateTenantMeta(
  salonId: string,
  patch: Partial<Omit<TenantMeta, "id">>,
): TenantMeta | null {
  const tenants = readIndex();
  const idx = tenants.findIndex((t) => t.id === salonId);
  if (idx === -1) return null;
  const next = { ...tenants[idx], ...patch };
  tenants[idx] = next;
  writeIndex(tenants);
  return next;
}

function slugify(label: string): string {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const existing = new Set(readIndex().map((t) => t.slug));
  if (!existing.has(base)) return base || `salon-${uid("")}`;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export interface CreateTenantInput {
  label: string;
  emirate: Emirate;
  city: string;
  area: string;
  presetId: string;
  subscriptionPlan: SubscriptionPlanId;
  /** true = start active immediately (skips trial); default false (trial) */
  skipTrial?: boolean;
}

/**
 * Creates a brand-new tenant: a fresh TenantMeta row + a freshly-seeded
 * Database under its own localStorage key. Never touches any other tenant's
 * data — this is the non-destructive replacement for the old, single-slot
 * `applyPreset()` reseed-in-place behavior.
 */
export function createTenant(input: CreateTenantInput): TenantMeta {
  const id = uid("salon");
  const preset = getPreset(input.presetId);
  const now = new Date();

  const meta: TenantMeta = {
    id,
    slug: slugify(input.label),
    label: input.label,
    emirate: input.emirate,
    city: input.city,
    area: input.area,
    presetId: preset.id,
    createdAt: now.toISOString(),
    subscriptionPlan: input.subscriptionPlan,
    subscriptionStatus: input.skipTrial ? "active" : "trial",
    trialEndsAt: input.skipTrial
      ? undefined
      : new Date(now.getTime() + TRIAL_DAYS * 86_400_000).toISOString(),
    suspension: { suspended: false },
    domain: { status: "not_configured" },
    marketplace: { visible: false, featured: false },
    contract: { status: "unsigned", version: CONTRACT_VERSION },
  };

  const tenants = readIndex();
  tenants.push(meta);
  writeIndex(tenants);

  // The preset only supplies a starting catalog/team/branding — the actual
  // salon name the owner typed must win over whatever demo name the preset
  // shipped with (e.g. "Maison Lumière"), or every new salon displays the
  // wrong name everywhere (header, dashboard, login) until someone notices
  // and fixes it by hand in Settings.
  const db = generateSeedDatabase(now, preset.id);
  db.settings.name = input.label;
  saveDatabase(id, db);

  return meta;
}

export interface RegisterSalonInput extends CreateTenantInput {
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPassword: string;
}

/**
 * Self-service salon signup: creates a tenant exactly like `createTenant`,
 * then replaces the seeded demo admin account with the owner's own login —
 * the whole reason this is a separate function rather than something a
 * caller bolts on afterwards is that patching the admin user must happen
 * before anyone can sign in with the credentials they just typed.
 */
export function registerSalon(input: RegisterSalonInput): {
  meta: TenantMeta;
  adminUserId: string | null;
} {
  const { ownerFirstName, ownerLastName, ownerEmail, ownerPhone, ownerPassword, ...tenantInput } =
    input;
  const meta = createTenant(tenantInput);

  const db = loadDatabase(meta.id);
  let adminUserId: string | null = null;
  if (db) {
    const admin = db.users.find((u) => u.role === "ADMIN");
    if (admin) {
      admin.firstName = ownerFirstName;
      admin.lastName = ownerLastName;
      admin.email = ownerEmail;
      admin.phone = ownerPhone;
      admin.password = ownerPassword;
      adminUserId = admin.id;
      saveDatabase(meta.id, db);
    }
  }

  return { meta, adminUserId };
}

export function suspendTenant(salonId: string, reason: string): TenantMeta | null {
  return updateTenantMeta(salonId, {
    subscriptionStatus: "suspended",
    suspension: { suspended: true, reason, suspendedAt: new Date().toISOString() },
  });
}

export function reactivateTenant(salonId: string): TenantMeta | null {
  return updateTenantMeta(salonId, {
    subscriptionStatus: "active",
    suspension: { suspended: false },
  });
}

/** Wipes and reseeds ONLY this tenant's demo data (keeps its TenantMeta row). */
export function reseedTenant(salonId: string): void {
  const meta = getTenantMeta(salonId);
  if (!meta) return;
  resetDatabase(salonId);
  const db = generateSeedDatabase(new Date(), meta.presetId);
  db.settings.name = meta.label; // same fix as createTenant — don't revert to the preset's demo name
  saveDatabase(salonId, db);
}

export function getActiveSalonId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function setActiveSalonId(salonId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_KEY, salonId);
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

/**
 * Ensures at least one tenant exists (fresh install) so the app works out of
 * the box, matching the previous single-salon demo. Returns the id to make
 * active.
 */
export function ensureDefaultTenant(): string {
  const existing = readIndex();
  if (existing.length > 0) return existing[0].id;
  const meta = createTenant({
    label: "Maison Lumière",
    emirate: "Dubai",
    city: "Dubai",
    area: "Jumeirah",
    presetId: "maison",
    subscriptionPlan: "professional",
    skipTrial: true,
  });
  return meta.id;
}
