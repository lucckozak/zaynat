import { DEFAULT_SUBSCRIPTION_PLANS, type SubscriptionPlanConfig } from "./types";

const KEY = "platform:subscriptionPlans";

export function listSubscriptionPlans(): SubscriptionPlanConfig[] {
  if (typeof window === "undefined") return DEFAULT_SUBSCRIPTION_PLANS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as SubscriptionPlanConfig[];
    window.localStorage.setItem(KEY, JSON.stringify(DEFAULT_SUBSCRIPTION_PLANS));
    return DEFAULT_SUBSCRIPTION_PLANS;
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
