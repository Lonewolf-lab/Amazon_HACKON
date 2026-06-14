/**
 * Lightweight client-side bridge: a completed ReLife Journey publishes the
 * returned item here, and the Marketplace reads it back. Uses localStorage so
 * the demo persists across the portal → marketplace navigation without a
 * backend listings table.
 */

export type ListingCategory =
  | "Electronics"
  | "Fashion"
  | "Appliances"
  | "Books"
  | "Sports";

export type PublishedListing = {
  id: string;
  name: string;
  category: ListingCategory;
  grade: "A" | "B" | "C";
  original: number;
  price: number;
  condition_score: number;
  disposition: string; // "Refurbished" | "Pre-owned" | "Open Box"
  certificate_id: string;
  publishedAt: number;
};

const KEY = "relife_published_listings";

// Resale-type paths become marketplace listings; donate/recycle do not.
const DISPOSITION: Record<string, string> = {
  refurbish: "Refurbished",
  resell: "Pre-owned",
  exchange: "Open Box",
};

export function isResalePath(path: string | null | undefined): boolean {
  return !!path && path in DISPOSITION;
}

export function dispositionFor(path: string): string {
  return DISPOSITION[path] ?? "Pre-owned";
}

export function getPublishedListings(): PublishedListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as PublishedListing[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function savePublishedListing(item: PublishedListing): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getPublishedListings().filter((l) => l.id !== item.id);
    const next = [item, ...existing].slice(0, 12); // cap to keep it tidy
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / serialization errors — listing is best-effort */
  }
}
