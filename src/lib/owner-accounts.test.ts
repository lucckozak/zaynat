import { beforeEach, describe, expect, it } from "vitest";
import {
  addLocationToOwner,
  authenticateOwner,
  createOwnerAccount,
  ensureOwnerAccount,
  findOwnerAccountByEmail,
} from "./owner-accounts";

describe("owner-accounts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates an owner with one starting location", () => {
    const owner = createOwnerAccount({
      firstName: "Layla",
      lastName: "Khan",
      email: "layla@rosesalon.ae",
      password: "rose2026",
      location: { salonId: "salon_a", adminUserId: "usr_1" },
    });
    expect(owner.locations).toEqual([{ salonId: "salon_a", adminUserId: "usr_1" }]);
    expect(findOwnerAccountByEmail("layla@rosesalon.ae")?.id).toBe(owner.id);
  });

  it("authenticateOwner only succeeds with the right password", () => {
    createOwnerAccount({
      firstName: "Layla",
      lastName: "Khan",
      email: "layla@rosesalon.ae",
      password: "rose2026",
      location: { salonId: "salon_a", adminUserId: "usr_1" },
    });
    expect(authenticateOwner("layla@rosesalon.ae", "wrong")).toBeNull();
    expect(authenticateOwner("layla@rosesalon.ae", "rose2026")?.email).toBe("layla@rosesalon.ae");
    // case-insensitive email lookup, matching the rest of this app's auth
    expect(authenticateOwner("LAYLA@rosesalon.ae", "rose2026")).not.toBeNull();
  });

  it("addLocationToOwner appends without touching existing locations", () => {
    const owner = createOwnerAccount({
      firstName: "Layla",
      lastName: "Khan",
      email: "layla@rosesalon.ae",
      password: "rose2026",
      location: { salonId: "salon_a", adminUserId: "usr_1" },
    });
    const updated = addLocationToOwner(owner.id, { salonId: "salon_b", adminUserId: "usr_2" });
    expect(updated?.locations).toHaveLength(2);
    expect(updated?.locations.map((l) => l.salonId)).toEqual(["salon_a", "salon_b"]);
  });

  it("addLocationToOwner returns null for an unknown owner id", () => {
    expect(addLocationToOwner("nonexistent", { salonId: "salon_a", adminUserId: "usr_1" })).toBeNull();
  });

  describe("ensureOwnerAccount", () => {
    it("creates a fresh single-location owner the first time it's called", () => {
      const owner = ensureOwnerAccount({
        salonId: "salon_a",
        adminUserId: "usr_1",
        firstName: "Sam",
        lastName: "Admin",
        email: "sam@salon.app",
        password: "password",
      });
      expect(owner.locations).toEqual([{ salonId: "salon_a", adminUserId: "usr_1" }]);
    });

    it("is idempotent for the same salon — never adds a duplicate location", () => {
      const first = ensureOwnerAccount({
        salonId: "salon_a",
        adminUserId: "usr_1",
        firstName: "Sam",
        lastName: "Admin",
        email: "sam@salon.app",
        password: "password",
      });
      const second = ensureOwnerAccount({
        salonId: "salon_a",
        adminUserId: "usr_1",
        firstName: "Sam",
        lastName: "Admin",
        email: "sam@salon.app",
        password: "password",
      });
      expect(second.id).toBe(first.id);
      expect(second.locations).toHaveLength(1);
    });

    it("adds a second location to the same owner found by email", () => {
      ensureOwnerAccount({
        salonId: "salon_a",
        adminUserId: "usr_1",
        firstName: "Sam",
        lastName: "Admin",
        email: "sam@salon.app",
        password: "password",
      });
      const owner = ensureOwnerAccount({
        salonId: "salon_b",
        adminUserId: "usr_2",
        firstName: "Sam",
        lastName: "Admin",
        email: "sam@salon.app",
        password: "password",
      });
      expect(owner.locations.map((l) => l.salonId).sort()).toEqual(["salon_a", "salon_b"]);
    });
  });
});
