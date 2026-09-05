import { beforeEach, describe, expect, it } from "vitest";
import { generateSeedDatabase, loadDatabase, saveDatabase } from "./seed";

describe("loadDatabase / saveDatabase versioning", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Regression test for a real bug: the schema version used to be tracked
  // in one localStorage key shared by every tenant. Saving tenant A (which
  // stamps the current version) used to make tenant B's still-stale blob
  // pass the version check too, so loadDatabase(B) returned old,
  // now-incomplete JSON instead of null (which would trigger a reseed).
  // Found via /find loading more than one tenant's Database at once.
  it("doesn't let saving one tenant's Database validate another tenant's stale blob", () => {
    const dbA = generateSeedDatabase(new Date("2024-01-01"), "maison");
    saveDatabase("salon_a", dbA);

    // Simulate tenant B's blob predating a schema change: same shape minus
    // a field that must exist, written directly (bypassing saveDatabase,
    // which would correctly stamp the current version).
    const staleB = generateSeedDatabase(new Date("2024-01-01"), "maison");
    const staleJson: Record<string, unknown> = { ...staleB };
    delete staleJson.reviews;
    localStorage.setItem("platform:db:salon_b", JSON.stringify(staleJson));
    // No `platform:db:salon_b:version` key at all — this is the stale case.

    // Saving A must not affect whether B's stale blob is considered valid.
    expect(loadDatabase("salon_b")).toBeNull();
  });

  it("a tenant's own save is unaffected by another tenant's version state", () => {
    const dbA = generateSeedDatabase(new Date("2024-01-01"), "maison");
    saveDatabase("salon_a", dbA);
    const dbB = generateSeedDatabase(new Date("2024-01-01"), "maison");
    saveDatabase("salon_b", dbB);

    expect(loadDatabase("salon_a")?.settings.presetId).toBe("maison");
    expect(loadDatabase("salon_b")?.settings.presetId).toBe("maison");
  });
});

describe("generateSeedDatabase admin notifications", () => {
  it("backfills notifications matching real seeded appointments, newest first", () => {
    const db = generateSeedDatabase(new Date("2024-01-01"), "maison");
    expect(db.adminNotifications.length).toBeGreaterThan(0);

    const timestamps = db.adminNotifications.map((n) => +new Date(n.createdAt));
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));

    for (const n of db.adminNotifications) {
      const appt = db.appointments.find((a) => a.id === n.appointmentId);
      expect(appt).toBeDefined();
      expect(n.kind).toBe(appt?.status === "CANCELLED" ? "CANCELLED" : "NEW_BOOKING");
    }

    // A believable inbox: not literally everything is unread.
    expect(db.adminNotifications.some((n) => n.read)).toBe(true);
    expect(db.adminNotifications.some((n) => !n.read)).toBe(true);
  });
});
