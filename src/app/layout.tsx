import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Self-hosted alongside the default so a salon can switch its heading font
// at runtime without a network request — see src/lib/fonts.ts.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // Most pages in this app are client components (App Router metadata only
  // applies from server components), so this default title/description is
  // what actually shows for almost every route — the marketing homepage and
  // /find override it since those two are server components.
  title: {
    default: "Zaynat",
    template: "%s · Zaynat",
  },
  description:
    "Zaynat is booking software for UAE salons — your own branded booking site, appointment management, and direct-to-you payments, all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${poppins.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
