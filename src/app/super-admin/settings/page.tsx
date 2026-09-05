"use client";

import { useState } from "react";
import type { SubscriptionPlanConfig } from "@/lib/types";
import { listSubscriptionPlans, saveSubscriptionPlans } from "@/lib/subscription-plans";
import { PageHeading } from "@/components/layout/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Switch } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function SuperAdminSettingsPage() {
  const toast = useToast();
  const [plans, setPlans] = useState<SubscriptionPlanConfig[]>(() => listSubscriptionPlans());

  function set(id: string, patch: Partial<SubscriptionPlanConfig>) {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function save() {
    saveSubscriptionPlans(plans);
    toast.success("Plan configuration saved");
  }

  return (
    <div>
      <PageHeading
        title="Settings"
        description="Subscription plan configuration — applies to newly-created salons; existing salons keep their assigned plan until changed."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id}>
            <CardBody className="space-y-3">
              <h3 className="font-serif text-lg font-medium text-foreground">{p.label}</h3>
              <Field label="Monthly price (AED)">
                <Input
                  type="number"
                  min={0}
                  value={p.monthlyPriceAed}
                  onChange={(e) => set(p.id, { monthlyPriceAed: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Employee limit">
                <Input
                  type="number"
                  min={1}
                  value={p.employeeLimit}
                  onChange={(e) => set(p.id, { employeeLimit: Number(e.target.value) || 1 })}
                />
              </Field>
              <Switch
                checked={p.marketplaceVisibility}
                onChange={(v) => set(p.id, { marketplaceVisibility: v })}
                label="Marketplace visibility"
              />
              <Switch
                checked={p.customDomain}
                onChange={(v) => set(p.id, { customDomain: v })}
                label="Custom domain"
              />
            </CardBody>
          </Card>
        ))}
      </div>

      <Button className="mt-5" onClick={save}>
        Save all plans
      </Button>
    </div>
  );
}
