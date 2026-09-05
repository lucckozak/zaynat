/**
 * Selectable heading/display fonts. Each is self-hosted via next/font/google
 * in the root layout (see `src/app/layout.tsx`) as a CSS variable; picking a
 * font here just repoints the Tailwind `--font-serif` token at runtime (the
 * same trick `src/lib/theme.ts` uses for brand colours), so the body font
 * (Inter) and every existing `font-serif` usage keep working unchanged.
 */
export type FontChoiceId = "cormorant" | "poppins" | "playfair";

export interface FontChoice {
  id: FontChoiceId;
  label: string;
  description: string;
  /** value written to the --font-serif CSS variable */
  stack: string;
}

export const FONT_CHOICES: FontChoice[] = [
  {
    id: "cormorant",
    label: "Classic Serif",
    description: "Warm, editorial — the default look.",
    stack: 'var(--font-cormorant), ui-serif, Georgia, "Times New Roman", serif',
  },
  {
    id: "poppins",
    label: "Modern Sans",
    description: "Clean and contemporary.",
    stack: 'var(--font-poppins), ui-sans-serif, system-ui, "Segoe UI", sans-serif',
  },
  {
    id: "playfair",
    label: "Elegant Display",
    description: "High-contrast, boutique-luxury feel.",
    stack: 'var(--font-playfair), ui-serif, Georgia, "Times New Roman", serif',
  },
];

export const DEFAULT_FONT_ID: FontChoiceId = "cormorant";

export function getFontChoice(id: string | undefined): FontChoice {
  return FONT_CHOICES.find((f) => f.id === id) ?? FONT_CHOICES[0];
}

/**
 * Applies a heading font by overriding --font-serif-active on <html> — NOT
 * --font-serif itself, which Tailwind's `@theme inline` bakes directly into
 * compiled utilities at build time (see the comment in globals.css next to
 * --font-serif-active for why that layer of indirection is needed).
 */
export function applyFont(id: string | undefined) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--font-serif-active", getFontChoice(id).stack);
}
