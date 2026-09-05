/**
 * Single source of truth for the app's deployed base path — "/zaynat" on
 * GitHub Pages (matches `next.config.ts`'s production `basePath`), "" for
 * local dev. Anything in client code that writes an absolute "/..." URL by
 * hand (i.e. not through next/link, next/image or the router, which
 * rewrite it automatically) must prefix it with this constant or it 404s
 * once deployed there.
 */
export const BASE_PATH = process.env.NODE_ENV === "production" ? "/zaynat" : "";
