/**
 * Client-only image ingestion: no backend/storage exists in this prototype,
 * so an uploaded logo/favicon is downscaled and kept as a data URL inside
 * the salon's own Database blob (localStorage). Raster images are
 * re-encoded as PNG (preserves transparency — "backgroundless" images);
 * SVGs are kept as-is since they're already tiny and lossless at any size.
 */

/** Refuse anything that would bloat the localStorage blob unreasonably. */
const MAX_DATA_URL_LENGTH = 500_000;

const ACCEPTED_TYPES = ["image/png", "image/webp", "image/jpeg", "image/svg+xml"];

export class ImageUploadError extends Error {}

export function isAcceptedImageFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Reads an uploaded image file into a data URL, resizing raster images down to a max dimension. */
async function fileToImageDataUrl(
  file: File,
  maxDimension: number,
  opts: { format?: "png" | "jpeg"; quality?: number } = {},
): Promise<string> {
  if (!isAcceptedImageFile(file)) {
    throw new ImageUploadError("Use a PNG, WebP, JPEG or SVG image.");
  }

  // SVG is already vector + tiny — store it verbatim, no canvas step.
  if (file.type === "image/svg+xml") {
    const dataUrl = await readAsDataUrl(file);
    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      throw new ImageUploadError("That SVG is unusually large — try a simpler file.");
    }
    return dataUrl;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageUploadError("Couldn't process that image in this browser.");
  ctx.clearRect(0, 0, width, height); // keep transparency (only matters for PNG)
  ctx.drawImage(bitmap, 0, 0, width, height);

  const format = opts.format ?? "png";
  const dataUrl =
    format === "jpeg"
      ? canvas.toDataURL("image/jpeg", opts.quality ?? 0.85)
      : canvas.toDataURL("image/png");
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    throw new ImageUploadError("That image is too large even after resizing — try a smaller file.");
  }
  return dataUrl;
}

/** Logos are shown at header/nav scale — keep some room for larger wordmarks. */
export function fileToLogoDataUrl(file: File): Promise<string> {
  return fileToImageDataUrl(file, 480);
}

/** Favicons are only ever shown tiny (browser tab, bookmarks) — a small square is plenty. */
export function fileToFaviconDataUrl(file: File): Promise<string> {
  return fileToImageDataUrl(file, 128);
}

/**
 * Homepage hero photos are shown large (up to ~1200px wide) and are real
 * photography, not flat graphics — JPEG compresses those far better than
 * PNG, leaving more headroom under the shared data-URL size limit.
 */
export function fileToHeroImageDataUrl(file: File): Promise<string> {
  return fileToImageDataUrl(file, 1600, { format: "jpeg", quality: 0.85 });
}
