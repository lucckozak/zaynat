import type { Metadata } from "next";
import { FindSalonsClient } from "./find-client";

export const metadata: Metadata = {
  // plain string — the root layout's template appends "· Zaynat"
  title: "Find a Salon",
  description: "Search UAE salons on Zaynat by name, emirate, rating or distance.",
};

export default function FindSalonPage() {
  return <FindSalonsClient />;
}
