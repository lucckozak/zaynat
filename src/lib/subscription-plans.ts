import { DEFAULT_SUBSCRIPTION_PLANS, type SubscriptionPlanConfig } from "./types";

const KEY = "platform:subscriptionPlans";

export function listSubscriptionPlans(): SubscriptionPlanConfig[] {
  if (typeof window === "undefined") return DEFAULT_SUBSCRIPTION_PLANS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(DEFAULT_SUBSCRIPTION_PLANS));
      return DEFAULT_SUBSCRIPTION_PLANS;
    }
    const cached = JSON.parse(raw) as Partial<SubscriptionPlanConfig>[];
    // Merge onto the current defaults rather than trusting the cached
    // shape outright: a browser that cached this before a field existed
    // (e.g. `salonLimit`, added after `employeeLimit`) would otherwise
    // read that field back as `undefined` forever, since this only ever
    // wrote the defaults once, on first load. Any real customization
    // (e.g. a price edited in Super Admin → Settings) still wins, since
    // it's spread on top of the default.
    return DEFAULT_SUBSCRIPTION_PLANS.map((def) => {
      const found = cached.find((c) => c.id === def.id);
      return found ? { ...def, ...found } : def;
    });
  } catch {
    return DEFAULT_SUBSCRIPTION_PLANS;
  }
}

export function saveSubscriptionPlans(plans: SubscriptionPlanConfig[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(plans));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function getSubscriptionPlan(id: string): SubscriptionPlanConfig | undefined {
  return listSubscriptionPlans().find((p) => p.id === id);
}
