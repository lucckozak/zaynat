import type { OwnerAccount, OwnerLocation } from "./types";
import { uid } from "./utils";

/**
 * Platform-level record linking one real owner's identity to however many
 * salon "locations" they run — see the `OwnerAccount` doc comment in
 * types.ts for why this is separate from `TenantMeta`/`Database`. Stored
 * the same way as the tenant index: one JSON array under one localStorage
 * key, keyed by email for lookup (this is a single-origin prototype, so
 * "does this email exist" has nowhere else to be checked — see the same
 * note on `findOwnerAccount` in tenants.ts).
 */
const KEY = "platform:ownerAccounts";

function readAll(): OwnerAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OwnerAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAll(accounts: OwnerAccount[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(accounts));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function findOwnerAccountByEmail(email: string): OwnerAccount | null {
  const target = email.trim().toLowerCase();
  return readAll().find((o) => o.email.toLowerCase() === target) ?? null;
}

export function getOwnerAccount(id: string): OwnerAccount | null {
  return readAll().find((o) => o.id === id) ?? null;
}

export function authenticateOwner(email: string, password: string): OwnerAccount | null {
  const match = findOwnerAccountByEmail(email);
  return match && match.password === password ? match : null;
}

/**
 * Creates a brand-new owner identity with a single starting location.
 * Called once, from `registerSalon` — every location added after that
 * goes through `addLocationToOwner` instead, reusing this same identity
 * (same login) rather than minting a new one.
 */
export function createOwnerAccount(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  location: OwnerLocation;
}): OwnerAccount {
  const account: OwnerAccount = {
    id: uid("owner"),
    email: input.email.trim(),
    password: input.password,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    createdAt: new Date().toISOString(),
    locations: [input.location],
  };
  const accounts = readAll();
  accounts.push(account);
  writeAll(accounts);
  return account;
}

export function addLocationToOwner(ownerId: string, location: OwnerLocation): OwnerAccount | null {
  const accounts = readAll();
  const idx = accounts.findIndex((o) => o.id === ownerId);
  if (idx === -1) return null;
  const next = { ...accounts[idx], locations: [...accounts[idx].locations, location] };
  accounts[idx] = next;
  writeAll(accounts);
  return next;
}

/**
 * Self-heals tenants created before this feature existed (via Super
 * Admin, or self-registered before an OwnerAccount was recorded for
 * them): the first time a logged-in admin's own Locations view is opened,
 * this either finds their existing owner identity or mints one on the
 * spot seeded with exactly the one location they're already looking at —
 * so "add another location" works for every admin, not just ones who
 * registered after this shipped.
 */
export function ensureOwnerAccount(input: {
  salonId: string;
  adminUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): OwnerAccount {
  const existing = findOwnerAccountByEmail(input.email);
  if (existing) {
    if (existing.locations.some((l) => l.salonId === input.salonId)) return existing;
    return (
      addLocationToOwner(existing.id, { salonId: input.salonId, adminUserId: input.adminUserId }) ??
      existing
    );
  }
  return createOwnerAccount({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,
    location: { salonId: input.salonId, adminUserId: input.adminUserId },
  });
}
