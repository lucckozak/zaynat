import type { Metadata } from "next";
import {
  BarChart3,
  CalendarClock,
  Globe2,
  MapPin,
  Sparkles,
  Tag,
  UserCog,
} from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/misc";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Product tour",
  description: `A closer look at ${BRAND_NAME} — the booking site, calendar, staff dashboards, marketing tools and reports, with screenshots.`,
};

function TourSection({
  eyebrowIcon: EyebrowIcon,
  eyebrow,
  title,
  body,
  reverse,
  children,
}: {
  eyebrowIcon: typeof Globe2;
  eyebrow: string;
  title: string;
  body: string;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={cn(
            "grid items-center gap-10 sm:grid-cols-2",
            reverse && "sm:[&>*:first-child]:order-2",
          )}
        >
          <div>
            <Badge tone="primary" className="mb-3">
              <EyebrowIcon size={13} /> {eyebrow}
            </Badge>
            <h2 className="font-brand text-2xl font-semibold text-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{body}</p>
          </div>
          <Card className="overflow-hidden">
            <CardBody className="bg-surface-muted">{children}</CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default function TourPage() {
  return (
    <div className="zaynat-page flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="flex-1">
        <section className="border-b border-border px-4 py-14 text-center sm:px-6 sm:py-20">
          <Sparkles className="mx-auto mb-4 text-primary" size={28} />
          <h1 className="font-brand text-3xl font-bold text-foreground sm:text-5xl">
            A closer look at {BRAND_NAME}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg">
            Every screen below is a real part of the product — illustrative
            mockups, not staged photography, walking through what a salon
            actually gets.
          </p>
        </section>

        <TourSection
          eyebrowIcon={Globe2}
          eyebrow="Booking site"
          title="A booking website that's genuinely yours"
          body="Every salon gets a branded site generated from its own name, logo, colours and services — live in minutes, on a Zaynat address to start and your own domain whenever you're ready."
        >
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles size={14} />
                </span>
                <span className="text-sm font-semibold text-foreground">Bloom Salon</span>
              </div>
              <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                Book appointment
              </span>
            </div>
            <div className="space-y-2 p-4">
              {[
                ["Signature Facial", "AED 250"],
                ["Gel Manicure", "AED 160"],
                ["Balayage", "AED 650"],
              ].map(([name, price]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-3 py-2"
                >
                  <span className="text-sm text-foreground">{name}</span>
                  <span className="text-xs font-medium text-muted">{price}</span>
                </div>
              ))}
            </div>
          </div>
        </TourSection>

        <TourSection
          eyebrowIcon={CalendarClock}
          eyebrow="Calendar"
          title="Real availability, not a guessing game"
          body="Day, week or month view, filtered by staff or service. Working hours, breaks, vacations and buffer time are all accounted for automatically, so double-bookings simply can't happen."
          reverse
        >
          <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
            {[
              ["09:00", "Balayage · Sara", true],
              ["10:30", "Manicure · Emma", true],
              ["12:00", "— free —", false],
              ["13:00", "Facial · Maria", true],
              ["14:30", "— free —", false],
            ].map(([time, label, booked]) => (
              <div
                key={time as string}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2",
                  booked ? "border-border bg-surface-muted" : "border-dashed border-border-strong",
                )}
              >
                <span className="w-12 text-xs font-medium text-muted">{time}</span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    booked ? "bg-primary" : "bg-border-strong",
                  )}
                />
                <span className={cn("text-sm", booked ? "text-foreground" : "text-muted")}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </TourSection>

        <TourSection
          eyebrowIcon={UserCog}
          eyebrow="Employee dashboard"
          title="Staff see only what's theirs"
          body="Every specialist signs in to their own dashboard — their schedule, their appointments, their working hours and their profile. No admin access, no clutter, no seeing another salon's data."
        >
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Sara Ahmed</p>
                <p className="text-xs text-muted">Senior Stylist</p>
              </div>
              <Badge tone="success">On shift</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Today" value="5 bookings" tone="primary" compact />
              <Stat label="This week" value="AED 3,200" tone="accent" compact />
            </div>
          </div>
        </TourSection>

        <TourSection
          eyebrowIcon={Tag}
          eyebrow="Marketing tools"
          title="Coupons, gift cards and birthdays — included"
          body="Run a promo code, sell a gift card, or send an automatic birthday greeting — no separate marketing subscription to bolt on."
          reverse
        >
          <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-3 py-2.5">
              <span className="text-sm text-foreground">WELCOME10</span>
              <Badge tone="primary">10% off</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-3 py-2.5">
              <span className="text-sm text-foreground">Gift card · GLOW-200</span>
              <Badge tone="accent">AED 200</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-3 py-2.5">
              <span className="text-sm text-foreground">Julia Meyer 🎂 today</span>
              <Badge tone="neutral">Send greeting</Badge>
            </div>
          </div>
        </TourSection>

        <TourSection
          eyebrowIcon={BarChart3}
          eyebrow="Reports"
          title="Know what's actually working"
          body="Revenue, no-shows and your most popular services at the salon level; per-specialist commission payouts underneath — no spreadsheet required."
        >
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="This week" value="AED 12,400" tone="primary" compact />
              <Stat label="Top service" value="Balayage" tone="accent" compact />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-3 py-2.5">
              <span className="text-sm text-foreground">Sara Ahmed · commission</span>
              <Badge tone="success">AED 1,120</Badge>
            </div>
          </div>
        </TourSection>

        <TourSection
          eyebrowIcon={MapPin}
          eyebrow="Marketplace"
          title="Get discovered across the UAE"
          body="Opt in and your salon becomes searchable by customers nearby. This is on our roadmap and not live yet — the toggle exists in Super Admin today, ready for when it ships."
          reverse
        >
          <div className="relative overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface p-4">
            <span className="absolute right-3 top-3 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning">
              Coming soon
            </span>
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-3 py-2.5 opacity-70">
              <div>
                <p className="text-sm font-medium text-foreground">Bloom Salon</p>
                <p className="text-xs text-muted">Jumeirah, Dubai</p>
              </div>
              <Badge tone="neutral">★ 4.9</Badge>
            </div>
          </div>
        </TourSection>

        <section className="px-4 py-16 text-center sm:px-6 sm:py-24">
          <h2 className="font-brand text-2xl font-semibold text-foreground sm:text-3xl">
            Ready to see it on your own salon?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
            Start a free trial, or explore the fully interactive demo salon first.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/register-salon" size="lg">
              Get started free
            </LinkButton>
            <LinkButton href="/site" variant="outline" size="lg">
              Explore live demo
            </LinkButton>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
