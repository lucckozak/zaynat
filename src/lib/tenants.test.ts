import { beforeEach, describe, expect, it } from "vitest";
import {
  createTenant,
  getTenantMeta,
  listTenants,
  reactivateTenant,
  suspendTenant,
} from "./tenants";
import { loadDatabase } from "./data/seed";

describe("tenants", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("createTenant never touches another tenant's data", () => {
    const a = createTenant({
      label: "Salon A",
      emirate: "Dubai",
      city: "Dubai",
      area: "Marina",
      presetId: "maison",
      subscriptionPlan: "starter",
    });
    const b = createTenant({
      label: "Salon B",
      emirate: "Abu Dhabi",
      city: "Abu Dhabi",
      area: "Corniche",
      presetId: "maison",
      subscriptionPlan: "starter",
    });

    expect(a.id).not.toBe(b.id);
    expect(listTenants().map((t) => t.id).sort()).toEqual([a.id, b.id].sort());
    expect(loadDatabase(a.id)?.settings.name).toBe("Salon A");
    expect(loadDatabase(b.id)?.settings.name).toBe("Salon B");
  });

  it("gives two tenants with the same name distinct slugs", () => {
    const a = createTenant({
      label: "Glow Studio",
      emirate: "Dubai",
      city: "Dubai",
      area: "Marina",
      presetId: "maison",
      subscriptionPlan: "starter",
    });
    const b = createTenant({
      label: "Glow Studio",
      emirate: "Dubai",
      city: "Dubai",
      area: "Marina",
      presetId: "maison",
      subscriptionPlan: "starter",
    });
    expect(a.slug).not.toBe(b.slug);
  });

  it("names the seeded Database after what the owner typed, not the preset's demo name", () => {
    const meta = createTenant({
      label: "Bloom Salon",
      emirate: "Dubai",
      city: "Dubai",
      area: "Jumeirah",
      presetId: "maison", // preset's own demo name is "Maison Lumière"
      subscriptionPlan: "starter",
    });
    expect(loadDatabase(meta.id)?.settings.name).toBe("Bloom Salon");
  });

  it("starts on trial by default, and skips it when asked", () => {
    const trial = createTenant({
      label: "Trial Salon",
      emirate: "Dubai",
      city: "Dubai",
      area: "—",
      presetId: "maison",
      subscriptionPlan: "starter",
    });
    expect(trial.subscriptionStatus).toBe("trial");
    expect(trial.trialEndsAt).toBeDefined();

    const active = createTenant({
      label: "Active Salon",
      emirate: "Dubai",
      city: "Dubai",
      area: "—",
      presetId: "maison",
      subscriptionPlan: "starter",
      skipTrial: true,
    });
    expect(active.subscriptionStatus).toBe("active");
    expect(active.trialEndsAt).toBeUndefined();
  });

  it("suspendTenant sets the operator lock; reactivateTenant clears it", () => {
    const meta = createTenant({
      label: "Salon",
      emirate: "Dubai",
      city: "Dubai",
      area: "—",
      presetId: "maison",
      subscriptionPlan: "starter",
      skipTrial: true,
    });

    const suspended = suspendTenant(meta.id, "Payment overdue");
    expect(suspended?.subscriptionStatus).toBe("suspended");
    expect(suspended?.suspension).toEqual(
      expect.objectContaining({ suspended: true, reason: "Payment overdue" }),
    );

    const reactivated = reactivateTenant(meta.id);
    expect(reactivated?.subscriptionStatus).toBe("active");
    expect(reactivated?.suspension.suspended).toBe(false);

    expect(getTenantMeta(meta.id)?.subscriptionStatus).toBe("active");
  });

  it("suspendTenant/reactivateTenant on an unknown id return null and touch nothing", () => {
    expect(suspendTenant("nonexistent", "reason")).toBeNull();
    expect(reactivateTenant("nonexistent")).toBeNull();
    expect(listTenants()).toEqual([]);
  });
});
