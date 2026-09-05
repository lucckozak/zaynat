"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

const FAQS: { q: string; a: string }[] = [
  {
    q: `How much does ${BRAND_NAME} cost?`,
    a: "Starter, Professional and Premium plans are priced per month, with a discount for annual billing. Every plan includes online booking and a full calendar — higher tiers add more staff seats, marketplace visibility and a custom domain.",
  },
  {
    q: "Does it take a cut of my bookings?",
    a: "No. There's no commission on bookings, ever — you pay the monthly subscription and keep 100% of what your salon earns.",
  },
  {
    q: "Where does customer payment money go?",
    a: "Directly to your own connected payment account. It never passes through a platform account — see the Legal page for the full breakdown of what's separated and why.",
  },
  {
    q: "How long does setup take?",
    a: "Most salons are live within minutes: pick a starting template, add your services and team, and publish. You can fine-tune branding, hours and booking rules any time from your dashboard.",
  },
  {
    q: "Can I use my own domain?",
    a: `Yes, on the Premium plan. Every salon also gets a ${BRAND_NAME} address immediately, so you can start taking bookings before a custom domain is connected.`,
  },
  {
    q: "Is there a free trial?",
    a: "Every new salon starts on a 14-day trial with no card required, so you can try the whole dashboard before choosing a plan.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {FAQS.map((f, i) => {
        const open = openIndex === i;
        return (
          <div key={f.q}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[15px] font-medium text-foreground">{f.q}</span>
              <ChevronDown
                size={18}
                className={cn(
                  "shrink-0 text-muted transition-transform",
                  open && "rotate-180 text-primary",
                )}
              />
            </button>
            {open ? (
              <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{f.a}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
