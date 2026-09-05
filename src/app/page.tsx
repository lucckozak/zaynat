import type { Metadata } from "next";
import {
  BarChart3,
  CalendarCheck2,
  CreditCard,
  FileDown,
  Globe2,
  Link2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  UserCog,
  UsersRound,
} from "lucide-react";
import { DEFAULT_SUBSCRIPTION_PLANS } from "@/lib/types";
import { BRAND_NAME } from "@/lib/brand";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { PricingToggle } from "@/components/marketing/pricing-toggle";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { Card, CardBody, SectionTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s · Zaynat" template — this
  // title already reads fine standalone, unlike a plain string (which the
  // template would append the name to a second time).
  title: { absolute: `${BRAND_NAME} — booking software for UAE salons` },
  description:
    "Zaynat is booking software for UAE salons: your own branded booking site, a real calendar, client management and direct-to-you payments — no commission, ever.",
};

const FEATURES = [
  {
    icon: Globe2,
    title: "Your own salon website",
    body: "A branded booking site generated for every salon — logo, colours, gallery, services and team, live in minutes.",
  },
  {
    icon: CalendarCheck2,
    title: "A calendar that can't double-book",
    body: "Genuine per-specialist availability online; day/week/month view with buffers and working hours built in.",
  },
  {
    icon: UsersRound,
    title: "Staff & client management",
    body: "Working hours, days off and commission for staff; history, notes and birthdays for clients.",
  },
  {
    icon: UserCog,
    title: "Employee dashboard",
    body: "Every specialist gets their own login — just their schedule, their appointments, their working hours and profile.",
  },
  {
    icon: CreditCard,
    title: "Payments go to you, not us",
    body: "Deposits or full payment via your own connected account — Zaynat never takes a cut and never touches the money.",
  },
  {
    icon: Tag,
    title: "Marketing tools built in",
    body: "Coupons, gift cards and automatic birthday greetings — no separate marketing app to pay for.",
  },
  {
    icon: BarChart3,
    title: "Revenue & commission reports",
    body: "Revenue, no-shows and popular services at the salon level; per-specialist commission payouts underneath.",
  },
  {
    icon: Link2,
    title: "Custom domains",
    body: "Start on a Zaynat address the same day; connect www.yoursalon.ae whenever you're ready.",
  },
  {
    icon: ShieldAlert,
    title: "No-show protection",
    body: "Blacklist repeat no-shows, require deposits, and enforce your own cancellation window automatically.",
  },
  {
    icon: FileDown,
    title: "Your data, exportable",
    body: "Export customers and bookings to CSV whenever you want — nothing is locked inside Zaynat.",
  },
  {
    icon: Store,
    title: "Marketplace exposure",
    body: "Opt in and get discovered by customers searching for salons near them across the UAE.",
  },
  {
    icon: ShieldCheck,
    title: "You're always in control",
    body: "Your data, your branding, your customers — export or leave any time, no lock-in.",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="zaynat-page flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden border-b border-border"
          style={{
            background:
              "radial-gradient(120% 100% at 50% -10%, var(--primary-soft) 0%, var(--background) 60%)",
          }}
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Badge tone="primary" className="mx-auto mb-5">
                <Sparkles size={13} /> Built for salons across the UAE
              </Badge>
              <h1 className="font-brand text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                Booking software for UAE salons
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg">
                Keep bookings, staff, clients and payments together in one
                place — so you spend less time on admin and more time with
                clients.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <LinkButton href="/register-salon" size="lg">
                  Get started free
                </LinkButton>
                <LinkButton href="/site" variant="outline" size="lg">
                  Explore demo
                </LinkButton>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-strong">
                <span>14-day free trial</span>
                <span className="hidden sm:inline">·</span>
                <span>No card required</span>
                <span className="hidden sm:inline">·</span>
                <span>Zero booking commission</span>
                <span className="hidden sm:inline">·</span>
                <span>Payments go straight to you</span>
              </div>
            </div>
          </div>
        </section>

        {/* Product showcase */}
        <section id="features" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionTitle
            eyebrow="See it in action"
            title="Everything runs from one dashboard"
            description="Switch between what your calendar, booking site, client list and payments actually look like."
            align="center"
          />
          <div className="mt-10">
            <FeatureShowcase />
          </div>
        </section>

        {/* Feature grid */}
        <section className="border-y border-border bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <SectionTitle
              eyebrow="Features"
              title="Everything a salon needs to run online"
              description="One platform covering the booking site, the back office, and the payments — nothing bolted on."
              align="center"
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <Card key={f.title}>
                  <CardBody>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <f.icon size={18} />
                    </div>
                    <h3 className="text-[15px] font-medium text-foreground">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Demo */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Card className="overflow-hidden">
            <CardBody className="flex flex-col items-center gap-4 py-12 text-center sm:py-16">
              <Badge tone="accent">Interactive demo</Badge>
              <h2 className="max-w-xl font-brand text-2xl font-semibold text-foreground sm:text-3xl">
                This is exactly what your customers experience on your own
                branded booking site.
              </h2>
              <p className="max-w-lg text-sm text-muted sm:text-[15px]">
                Try the full customer journey — choose a service, a
                specialist, a time, and see the confirmation. Clearly labelled
                as a demonstration; no real payment is processed.
              </p>
              <LinkButton href="/site" size="lg" className="mt-2">
                Explore the demo salon
              </LinkButton>
            </CardBody>
          </Card>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 border-y border-border bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <SectionTitle
              eyebrow="Pricing"
              title="Simple, transparent plans"
              description="No booking commission on any plan — ever."
              align="center"
            />
            <div className="mt-10">
              <PricingToggle plans={DEFAULT_SUBSCRIPTION_PLANS} />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionTitle eyebrow="FAQ" title="Common questions" align="center" />
          <div className="mt-10">
            <FaqAccordion />
          </div>
        </section>

        {/* Get started */}
        <section id="get-started" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Card>
            <CardBody className="flex flex-col items-center gap-4 py-12 text-center sm:py-16">
              <ShieldCheck className="text-primary" size={28} />
              <h2 className="font-brand text-2xl font-semibold text-foreground sm:text-3xl">
                Ready to bring your salon online?
              </h2>
              <p className="max-w-lg text-sm text-muted sm:text-[15px]">
                Create your salon, pick a starting look, and publish — start
                your 14-day free trial, no card required.
              </p>
              <LinkButton href="/register-salon" size="lg" className="mt-2">
                Get started free
              </LinkButton>
            </CardBody>
          </Card>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
