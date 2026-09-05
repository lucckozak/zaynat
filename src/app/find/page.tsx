import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  // plain string — the root layout's template appends "· Zaynat"
  title: "Find a Salon",
  description: "Discover salons across the UAE — coming in a later phase.",
};

export default function FindSalonPage() {
  return (
    <div className="zaynat-page flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <Card className="w-full">
          <CardBody className="flex flex-col items-center gap-4 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <MapPin size={26} />
            </div>
            <h1 className="text-2xl font-medium text-foreground">
              The UAE salon marketplace is coming
            </h1>
            <p className="max-w-md text-sm text-muted">
              Search, filters, an interactive map and salon profiles across
              every emirate — this is a later phase of the platform, not built
              yet. For now, explore what a single salon's booking site looks
              like.
            </p>
            <LinkButton href="/site" size="lg" className="mt-2">
              Explore the demo salon
            </LinkButton>
          </CardBody>
        </Card>
      </main>
      <MarketingFooter />
    </div>
  );
}
