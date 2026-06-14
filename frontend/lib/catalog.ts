/* Shared marketplace catalog helpers — product imagery + detail enrichment.
   The backend marketplace endpoint returns the core listing fields (name,
   grade, price, condition_score, disposition). For the Amazon-style product
   page we enrich each listing client-side into "About", "Specifications" and
   a deterministic rating, so every product has a full PDP without extra
   backend work. */

import type { MarketplaceListing } from "./api";
import { productImage as productImageByName } from "./productImages";

/* Known product photos shipped under /public/products. Anything not listed
   here falls back to the /products/{asin}.jpg convention, then a category
   icon (handled by <ProductThumb>). */
export const PRODUCT_IMAGE: Record<string, string> = {
  ASIN004: "/products/sony wh-1000xm5.jpg",
  ASIN005: "/products/fire tv stick 4k with alexa remote.jpg",
  ASIN006: "/products/realme buds air 5 tws earbuds.jpg",
  ASIN007: "/products/logitech mx master 3s wireless mouse.jpg",
  ASIN011: "/products/jbl charge 5 portable bluetooth speaker.jpg",
  ASIN016: "/products/levis 511 slim fit stretch jeans.jpg",
  ASIN019: "/products/puma men's running shoes.jpg",
  ASIN022: "/products/woodland genuine leather causal shoes.jpg",
  ASIN051: "/products/ASIN051.jpg",
  ASIN052: "/products/ASIN052.jpg",
};

/** Best-effort image src for a listing; null → caller shows an icon. */
export function productImage(
  asin?: string,
  id?: string,
  name?: string
): string | null {
  // 1. curated asin → file map (highest confidence)
  if (asin && PRODUCT_IMAGE[asin]) return PRODUCT_IMAGE[asin];
  // 2. name-based resolver — covers the full 50-product catalog + demo laptops
  if (name) {
    const byName = productImageByName(name);
    if (byName) return byName;
  }
  // 3. /products/{asin}.jpg convention (e.g. ASIN051/052); else icon fallback
  if (asin && asin.startsWith("ASIN")) return `/products/${asin}.jpg`;
  return null;
}

export type Grade = "A" | "B" | "C" | string;

/** Human label for a second-life grade. */
export function gradeLabel(grade: Grade): string {
  switch ((grade || "").toUpperCase()) {
    case "A":
      return "Like New";
    case "B":
      return "Very Good";
    case "C":
      return "Good";
    default:
      return "Inspected";
  }
}

export function gradeBlurb(grade: Grade): string {
  switch ((grade || "").toUpperCase()) {
    case "A":
      return "No visible wear. Inspected and certified as good as new.";
    case "B":
      return "Minor cosmetic wear only. Fully functional and tested.";
    case "C":
      return "Visible wear, professionally refurbished and verified working.";
    default:
      return "Inspected and certified by Amazon ReLife AI.";
  }
}

const DISPOSITION_BLURB: Record<string, string> = {
  "Open Box": "Returned unused — original packaging, full functionality.",
  "Pre-owned": "Gently used, inspected, and quality-graded for resale.",
  Refurbished: "Restored to working condition and quality-checked.",
};

export function warrantyFor(grade: Grade): string {
  return (grade || "").toUpperCase() === "C"
    ? "3-month ReLife warranty"
    : "6-month ReLife warranty";
}

/** Deterministic rating + review count derived from the listing id (so it is
    stable across renders and never causes a hydration mismatch). */
export function ratingFor(id: string): { rating: number; count: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const rating = Math.round((38 + (h % 12)) ) / 10; // 3.8 – 4.9
  const count = 80 + (h % 1400);
  return { rating, count };
}

/** "About this item" bullets for the PDP. */
export function buildAbout(l: MarketplaceListing): string[] {
  const cat = l.category.toLowerCase();
  return [
    `Certified second-life ${cat} — professionally inspected and graded ${l.grade} by Amazon ReLife AI.`,
    `Condition score ${l.condition_score}/100 — ${gradeLabel(l.grade)}. ${gradeBlurb(
      l.grade
    )}`,
    `${l.disposition}: ${
      DISPOSITION_BLURB[l.disposition] ??
      "Inspected and quality-graded for resale."
    }`,
    `Backed by a ReLife Trust Certificate and a ${warrantyFor(l.grade)}.`,
    `Every purchase earns Green Credits and keeps usable products out of landfill.`,
  ];
}

/** Specifications table rows for the PDP. */
export function buildSpecs(l: MarketplaceListing): { label: string; value: string }[] {
  const brand = l.name.split(" ")[0];
  return [
    { label: "Brand", value: brand },
    { label: "Category", value: l.category },
    { label: "Condition", value: `${gradeLabel(l.grade)} (Grade ${l.grade})` },
    { label: "Condition Score", value: `${l.condition_score}/100` },
    { label: "Listing Type", value: l.disposition },
    { label: "Inspection", value: "AI-graded · ReLife Certified" },
    { label: "Warranty", value: warrantyFor(l.grade) },
    { label: "Item Code", value: l.asin ?? l.id },
  ];
}

/** Rough CO₂ avoided by buying second-life instead of new (demo heuristic). */
export function co2SavedKg(original: number): number {
  return Math.max(1, Math.round((original * 0.016) / 10) * 10) / 10 + 2;
}
