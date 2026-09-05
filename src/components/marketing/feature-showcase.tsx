"use client";

import { useState } from "react";
import {
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  UserCog,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/misc";

const TABS = [
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarClock,
    title: "One calendar, every specialist",
    body: "Day, week or month view, filtered by staff or service — new bookings, reschedules and no-shows all update it live.",
  },
  {
    id: "booking",
    label: "Online booking",
    icon: LayoutDashboard,
    title: "A booking site that's actually yours",
    body: "Customers pick a service, a specialist and a time that's genuinely free — no phone tag, no double-booking.",
  },
  {
    id: "clients",
    label: "Clients",
    icon: UsersRound,
    title: "Every client, their whole history",
    body: "Notes, preferred specialist, past visits and birthdays — searchable in seconds from any device.",
  },
  {
    id: "staff",
    label: "Staff",
    icon: UserCog,
    title: "Every specialist has their own dashboard",
    body: "Staff sign in to see just their own schedule, appointments and profile — no admin access, no clutter.",
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    title: "Deposits or full payment — your account",
    body: "Take a deposit or the full price online; the money settles to your own connected account, never ours.",
  },
] as const;

export function FeatureShowcase() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("calendar");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:border-primary/40",
              )}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      <Card className="mt-5 overflow-hidden">
        <CardBody className="grid gap-8 sm:grid-cols-2 sm:items-center">
          <div>
            <Badge tone="primary" className="mb-3">
              <tab.icon size={13} /> {tab.label}
            </Badge>
            <h3 className="font-brand text-xl font-semibold text-foreground sm:text-2xl">
              {tab.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{tab.body}</p>
          </div>

          {/* Illustrative mockup built from the app's own UI, not a claimed product screenshot */}
          <div className="rounded-2xl border border-border bg-surface-muted p-4">
            {tab.id === "calendar" ? (
              <div className="space-y-2">
                {["09:00", "10:30", "13:00"].map((t, i) => (
                  <div
                    key={t}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
                  >
                    <span className="text-xs font-medium text-muted">{t}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">
                      {["Balayage · Sara", "Manicure · Emma", "Facial · Maria"][i]}
                    </span>
                  </div>
                ))}
              </div>
            ) : tab.id === "booking" ? (
              <div className="grid grid-cols-3 gap-2">
                {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"].map((t, i) => (
                  <div
                    key={t}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-center text-xs font-medium",
                      i === 2
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface text-foreground",
                    )}
                  >
                    {t}
                  </div>
                ))}
              </div>
            ) : tab.id === "clients" ? (
              <div className="space-y-2">
                {["Hana Suzuki", "Sofia Laurent", "Julia Meyer"].map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5"
                  >
                    <span className="text-sm text-foreground">{name}</span>
                    <Badge tone="neutral">12 visits</Badge>
                  </div>
                ))}
              </div>
            ) : tab.id === "staff" ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
                  <p className="text-sm font-medium text-foreground">Sara Ahmed</p>
                  <p className="text-xs text-muted">Senior Stylist · works 09:00–18:00</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Today" value="5 bookings" tone="primary" compact />
                  <Stat label="This week" value="AED 3,200" tone="accent" compact />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Deposit" value="AED 100" tone="primary" compact />
                <Stat label="Balance due" value="AED 400" tone="accent" compact />
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
