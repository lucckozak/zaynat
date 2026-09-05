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
    default: "UAE Salon Platform",
    template: "%s · UAE Salon Platform",
  },
  description:
    "A multi-tenant booking platform for UAE salons — branded booking sites, appointment management, and a Super Admin console, in one prototype.",
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
