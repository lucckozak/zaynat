import { beforeEach, describe, expect, it } from "vitest";
import { getSubscriptionPlan, listSubscriptionPlans, saveSubscriptionPlans } from "./subscription-plans";
import { DEFAULT_SUBSCRIPTION_PLANS } from "./types";

const KEY = "platform:subscriptionPlans";

/** Simulates a plan cached before `salonLimit` existed on the type. */
function plansWithoutSalonLimit() {
  return DEFAULT_SUBSCRIPTION_PLANS.map((p) => {
    const copy: Record<string, unknown> = { ...p };
    delete copy.salonLimit;
    return copy;
  });
}

describe("listSubscriptionPlans", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("seeds and returns the defaults on first read", () => {
    const plans = listSubscriptionPlans();
    expect(plans).toEqual(DEFAULT_SUBSCRIPTION_PLANS);
    expect(localStorage.getItem(KEY)).not.toBeNull();
  });

  it("preserves a real customization on top of the defaults", () => {
    saveSubscriptionPlans(
      DEFAULT_SUBSCRIPTION_PLANS.map((p) => (p.id === "starter" ? { ...p, monthlyPriceAed: 249 } : p)),
    );
    const plans = listSubscriptionPlans();
    expect(plans.find((p) => p.id === "starter")?.monthlyPriceAed).toBe(249);
  });

  // Regression test for a real bug: a browser that cached plans before a
  // field (e.g. salonLimit) existed on SubscriptionPlanConfig used to read
  // that field back as `undefined` forever, since the cache was only ever
  // seeded once and never re-merged with new defaults.
  it("backfills a field missing from an old cached shape instead of returning undefined", () => {
    localStorage.setItem(KEY, JSON.stringify(plansWithoutSalonLimit()));

    const plans = listSubscriptionPlans();
    for (const plan of plans) {
      expect(plan.salonLimit).toBeDefined();
      expect(typeof plan.salonLimit).toBe("number");
    }
  });

  it("getSubscriptionPlan finds a plan by id even from a stale cache", () => {
    localStorage.setItem(KEY, JSON.stringify(plansWithoutSalonLimit()));

    expect(getSubscriptionPlan("premium")?.salonLimit).toBe(999);
  });
});
