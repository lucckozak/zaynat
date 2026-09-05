import type { Metadata } from "next";
import { Globe2, Percent, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Card, CardBody, SectionTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${BRAND_NAME} exists, and how it's built for UAE salons.`,
};

const VALUES = [
  {
    icon: Globe2,
    title: "Your own digital presence",
    body: "A salon's booking site should belong to the salon — its own name, its own branding, its own web address. Not a listing buried in someone else's app.",
  },
  {
    icon: Percent,
    title: "No commission, ever",
    body: "A flat monthly subscription, never a cut of your bookings. We're not planning to sit between a salon and its revenue.",
  },
  {
    icon: ShieldCheck,
    title: "No lock-in",
    body: "Your data is yours. Export it, move it, or leave — a booking platform should earn a salon's business every month, not trap it.",
  },
];

export default function AboutPage() {
  return (
    <div className="zaynat-page flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <Sparkles className="mx-auto mb-4 text-primary" size={28} />
          <h1 className="font-brand text-3xl font-bold text-foreground sm:text-4xl">
            Built for salons, not the other way around
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg">
            {BRAND_NAME} started from a simple observation: independent
            salons across the UAE were being asked to choose between a
            generic booking widget, a marketplace listing they didn&apos;t
            control, or expensive custom software. We think a salon should be
            able to get a real, branded booking presence online in minutes —
            and keep everything it earns.
          </p>
        </section>

        <section className="border-y border-border bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <SectionTitle eyebrow="What we believe" title="Three things we won't compromise on" align="center" />
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {VALUES.map((v) => (
                <Card key={v.title}>
                  <CardBody>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <v.icon size={18} />
                    </div>
                    <h3 className="text-[15px] font-medium text-foreground">{v.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.body}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionTitle eyebrow="Where we are" title="An early, working product" align="center" />
          <p className="mt-6 text-center text-[15px] leading-relaxed text-muted">
            {BRAND_NAME} is a young platform, built and improved in the open.
            Today it covers booking, calendar, staff and client management,
            and branding across UAE salons. Online payments, marketplace
            discovery, deeper analytics and more integrations are actively on
            the roadmap — see the{" "}
            <a href="/legal" className="font-medium text-primary hover:text-primary-hover">
              Legal
            </a>{" "}
            page for exactly what&apos;s live today versus what&apos;s coming.
          </p>
          <div className="mt-8 flex justify-center">
            <LinkButton href="/register-salon" size="lg">
              Get started free
            </LinkButton>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
