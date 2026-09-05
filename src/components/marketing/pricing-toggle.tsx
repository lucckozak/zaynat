"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { SubscriptionPlanConfig } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/misc";

/** Discount shown for annual billing — display-only, there is no real billing in this prototype. */
const ANNUAL_DISCOUNT = 0.2;

export function PricingToggle({ plans }: { plans: SubscriptionPlanConfig[] }) {
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Annual — save 20%" },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((p) => {
          const shown =
            period === "annual"
              ? Math.round(p.monthlyPriceAed * (1 - ANNUAL_DISCOUNT))
              : p.monthlyPriceAed;
          return (
            <Card key={p.id} className={p.id === "professional" ? "border-primary" : undefined}>
              <CardBody>
                {p.id === "professional" ? (
                  <Badge tone="primary" className="mb-3">
                    Most popular
                  </Badge>
                ) : null}
                <h3 className="font-brand text-xl font-semibold text-foreground">
                  {p.label}
                </h3>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  AED {shown}
                  <span className="text-sm font-normal text-muted">/mo</span>
                </p>
                {period === "annual" ? (
                  <p className="text-xs text-muted">billed annually</p>
                ) : null}
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  <li className="flex items-center gap-2">
                    <Check size={15} className="shrink-0 text-success" />
                    Up to {p.employeeLimit >= 999 ? "unlimited" : p.employeeLimit} employees
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={15} className="shrink-0 text-success" />
                    Online booking & calendar
                  </li>
                  <li className="flex items-center gap-2">
                    {p.marketplaceVisibility ? (
                      <Check size={15} className="shrink-0 text-success" />
                    ) : (
                      <span className="h-[15px] w-[15px] shrink-0" />
                    )}
                    Marketplace visibility
                  </li>
                  <li className="flex items-center gap-2">
                    {p.customDomain ? (
                      <Check size={15} className="shrink-0 text-success" />
                    ) : (
                      <span className="h-[15px] w-[15px] shrink-0" />
                    )}
                    Custom domain
                  </li>
                </ul>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
