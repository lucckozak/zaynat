import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  Check,
  Globe2,
  LayoutDashboard,
  Link2,
  ShieldCheck,
  Sparkles,
  Store,
  UsersRound,
  Wallet,
} from "lucide-react";
import { DEFAULT_SUBSCRIPTION_PLANS } from "@/lib/types";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Card, CardBody, SectionTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s · UAE Salon Platform" template
  // — this title already includes the platform name, unlike a plain string
  // (which the template would append the name to a second time).
  title: { absolute: "UAE Salon Platform — booking software for UAE salons" },
  description:
    "A modern booking platform built for UAE salons: your own branded booking website, employee & appointment management, direct-to-salon payments, custom domains, and marketplace exposure.",
};

const FEATURES = [
  {
    icon: Globe2,
    title: "Your own salon website",
    body: "A branded booking site generated for every salon — logo, colours, gallery, services and team, live in minutes.",
  },
  {
    icon: CalendarClock,
    title: "Real-time booking & calendar",
    body: "Customers see genuine availability per specialist; day/week/month calendar with double-booking protection built in.",
  },
  {
    icon: UsersRound,
    title: "Employee management",
    body: "Staff profiles, working hours, days off, commission and their own logins — all scoped to your salon.",
  },
  {
    icon: LayoutDashboard,
    title: "Customer management",
    body: "Appointment history, notes, preferred specialist, birthdays — search and manage your whole client base.",
  },
  {
    icon: Wallet,
    title: "Payments go to you",
    body: "Deposits or full payment via your own connected merchant account — never through the platform's account.",
  },
  {
    icon: Link2,
    title: "Custom domains",
    body: "Start on a platform subdomain, connect www.yoursalon.ae whenever you're ready.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    body: "Bookings, revenue, no-shows, popular services and specialists — know what's working.",
  },
  {
    icon: Store,
    title: "Marketplace exposure",
    body: "Opt in to the UAE salon marketplace and get discovered by customers searching nearby.",
  },
];

const STEPS = [
  {
    title: "Create your salon",
    body: "Business details, an emirate and area, and a starting template — done in minutes, not days.",
  },
  {
    title: "Configure services & team",
    body: "Add treatments, prices, employees and working hours — or start from a ready-made menu and adjust as you go.",
  },
  {
    title: "Preview & publish",
    body: "Check the desktop and mobile preview, then publish your branded booking site.",
  },
  {
    title: "Get bookings",
    body: "Customers book online, you manage everything from one dashboard — on the web and, soon, in the UAE marketplace.",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Badge tone="primary" className="mx-auto mb-5">
                <Sparkles size={13} /> Built for UAE salons, spas & barbershops
              </Badge>
              <h1 className="font-serif text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
                A modern booking platform, built for UAE salons.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg">
                Your own branded booking website, appointment calendar,
                employee and customer management, direct-to-salon payments,
                a custom domain, and exposure in the UAE salon marketplace —
                one platform, not a dozen tools.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <LinkButton href="#get-started" size="lg">
                  Get Started
                </LinkButton>
                <LinkButton href="/site" variant="outline" size="lg">
                  Explore Demo
                </LinkButton>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
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
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-border bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <SectionTitle
              eyebrow="How it works"
              title="From nothing to a live booking site, fast"
              description="Our team sets your salon up on the platform — most salons are live in 5–10 minutes once the basics are ready."
              align="center"
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <div key={s.title}>
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <h3 className="text-[15px] font-medium text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Card className="overflow-hidden">
            <CardBody className="flex flex-col items-center gap-4 py-12 text-center sm:py-16">
              <Badge tone="accent">Interactive demo</Badge>
              <h2 className="max-w-xl font-serif text-2xl font-medium text-foreground sm:text-3xl">
                This is exactly what your customers experience on your own
                branded booking website.
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
        <section id="pricing" className="border-y border-border bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <SectionTitle
              eyebrow="Pricing"
              title="Simple, transparent plans"
              description="Configurable by the platform operator — shown here at today's rates."
              align="center"
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {DEFAULT_SUBSCRIPTION_PLANS.map((p) => (
                <Card key={p.id} className={p.id === "professional" ? "border-primary" : undefined}>
                  <CardBody>
                    {p.id === "professional" ? (
                      <Badge tone="primary" className="mb-3">
                        Most popular
                      </Badge>
                    ) : null}
                    <h3 className="font-serif text-xl font-medium text-foreground">{p.label}</h3>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      AED {p.monthlyPriceAed}
                      <span className="text-sm font-normal text-muted">/mo</span>
                    </p>
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
              ))}
            </div>
          </div>
        </section>

        {/* Get started */}
        <section id="get-started" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Card>
            <CardBody className="flex flex-col items-center gap-4 py-12 text-center sm:py-16">
              <ShieldCheck className="text-primary" size={28} />
              <h2 className="font-serif text-2xl font-medium text-foreground sm:text-3xl">
                Ready to bring your salon online?
              </h2>
              <p className="max-w-lg text-sm text-muted sm:text-[15px]">
                In this prototype, new salons are onboarded through our
                operator console rather than a self-serve signup — sign in
                below to see exactly how a salon gets created, configured and
                published.
              </p>
              <LinkButton href="/super-admin/login" size="lg" className="mt-2">
                Try the operator console
              </LinkButton>
              <Link href="/find" className="text-sm font-medium text-primary hover:text-primary-hover">
                Looking to book a salon instead? Find one →
              </Link>
            </CardBody>
          </Card>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
