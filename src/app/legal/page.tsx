import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Legal",
  description: `${BRAND_NAME}'s Terms of Service and Privacy Policy.`,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 sm:py-20">
        <h1 className="font-brand text-3xl font-bold text-foreground">
          Legal
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}.</p>

        <Card className="mt-6 border-warning/40 bg-warning-soft/40">
          <CardBody className="flex gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
            <p className="text-sm text-foreground">
              <strong>Placeholder content.</strong> {BRAND_NAME} is an early-stage
              product. The terms below describe how the product actually
              behaves today, but have not been reviewed by a lawyer and are
              not a substitute for proper legal advice before commercial use.
            </p>
          </CardBody>
        </Card>

        <div className="mt-10 space-y-8">
          <div>
            <h2 className="mb-4 font-brand text-xl font-semibold text-foreground">
              Terms of Service
            </h2>
            <div className="space-y-5">
              <Section title="1. The service">
                <p>
                  {BRAND_NAME} provides software that lets a salon create a
                  branded booking website, manage staff, services, customers
                  and appointments, and accept online payments through its
                  own connected payment account.
                </p>
              </Section>
              <Section title="2. Accounts and roles">
                <p>
                  A salon owner registers an account and, in doing so,
                  creates their salon on the platform. The owner controls
                  which staff have access and to what. {BRAND_NAME} maintains
                  a separate platform-operator account used only to manage
                  subscriptions and platform-wide settings — it does not
                  grant access to a salon&apos;s customer data beyond what is
                  needed to operate the subscription.
                </p>
              </Section>
              <Section title="3. Payments">
                <p>
                  Subscription fees are billed by {BRAND_NAME} to the salon.
                  Customer payments for bookings (deposits or full payment)
                  are processed through the salon&apos;s own connected payment
                  account and are not held or taken as commission by{" "}
                  {BRAND_NAME}.
                </p>
              </Section>
              <Section title="4. Suspension">
                <p>
                  A subscription that falls past due may be suspended: the
                  salon&apos;s public booking site becomes unavailable and new
                  bookings are disabled until the subscription is brought
                  current. Suspension never deletes a salon&apos;s data —
                  employees, customers, appointment history and settings
                  remain intact and are restored on reactivation.
                </p>
              </Section>
              <Section title="5. Cancellation">
                <p>
                  A salon owner may stop using {BRAND_NAME} at any time. We
                  intend to support exporting salon data on request before an
                  account is closed.
                </p>
              </Section>
              <Section title="6. Limitation of liability">
                <p>
                  The service is provided as-is, without warranty of any
                  kind, to the fullest extent permitted by law. {BRAND_NAME}
                  is not liable for indirect or consequential losses arising
                  from use of the platform.
                </p>
              </Section>
              <Section title="7. Governing law">
                <p>
                  These terms are intended to be governed by the laws of the
                  United Arab Emirates, subject to a full legal review before
                  the platform handles real customer data or payments.
                </p>
              </Section>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-brand text-xl font-semibold text-foreground">
              Privacy Policy
            </h2>
            <div className="space-y-5">
              <Section title="What we collect">
                <p>
                  Salon owners provide business and contact details when
                  registering; customers provide contact details when
                  booking. Employee and customer records are entered by the
                  salon itself.
                </p>
              </Section>
              <Section title="Where it's stored">
                <p>
                  In the current build, all of this data — every salon&apos;s
                  services, staff, customers and bookings — lives only in
                  your own browser&apos;s local storage. Nothing is transmitted
                  to a {BRAND_NAME} server or any third party, because there
                  is no server yet: this is a client-side prototype. A
                  production deployment would move this to a proper database
                  with encryption in transit and at rest, and this policy
                  would be updated accordingly.
                </p>
              </Section>
              <Section title="Tenant isolation">
                <p>
                  Each salon&apos;s data is kept in its own isolated storage
                  slot. Staff and customers of one salon cannot see another
                  salon&apos;s data through normal use of the product.
                </p>
              </Section>
              <Section title="Cookies & local storage">
                <p>
                  {BRAND_NAME} uses browser local storage to remember your
                  session, your salon&apos;s data, and preferences like which
                  salon is currently active in this tab. No advertising or
                  analytics trackers are used in this build.
                </p>
              </Section>
              <Section title="Your rights">
                <p>
                  You can request a copy of, or deletion of, your data by
                  contacting the salon (for customer data) or {BRAND_NAME}{" "}
                  directly (for salon account data). Because storage is
                  local to your browser today, clearing your browser&apos;s
                  site data will also remove it.
                </p>
              </Section>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
