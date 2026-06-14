"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Star,
  StarHalf,
  Leaf,
  Truck,
  RotateCcw,
  Lock,
  Headphones,
  Shirt,
  Cpu,
  BookOpen,
  Dumbbell,
  Package,
  CheckCircle2,
  Award,
} from "lucide-react";
import { getMarketplace, type MarketplaceListing } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { ProductThumb } from "@/components/ProductThumb";
import {
  buildAbout,
  buildSpecs,
  ratingFor,
  gradeLabel,
  gradeBlurb,
  warrantyFor,
  co2SavedKg,
} from "@/lib/catalog";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const CAT_ICON: Record<string, typeof Cpu> = {
  Electronics: Headphones,
  Fashion: Shirt,
  Appliances: Cpu,
  Books: BookOpen,
  Sports: Dumbbell,
};

const GRADE_TONE: Record<string, string> = {
  A: "bg-[#067D62]",
  B: "bg-[#007185]",
  C: "bg-[#F0C14B] !text-[#0F1111]",
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center text-[#FF9900]">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full)
          return <Star key={i} className="h-4 w-4 fill-[#FF9900]" />;
        if (i === full && half)
          return <StarHalf key={i} className="h-4 w-4 fill-[#FF9900]" />;
        return <Star key={i} className="h-4 w-4 text-[#D5D9D9]" />;
      })}
    </span>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = decodeURIComponent(
    Array.isArray(params.id) ? params.id[0] : (params.id ?? "")
  );

  const { addItem } = useCart();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await getMarketplace();
        const found = all.find((m) => m.id === id) ?? null;
        if (active) setListing(found);
      } catch {
        if (active) setListing(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const enriched = useMemo(() => {
    if (!listing) return null;
    return {
      about: buildAbout(listing),
      specs: buildSpecs(listing),
      rating: ratingFor(listing.id),
      discount: Math.round((1 - listing.price / listing.original) * 100),
      co2: co2SavedKg(listing.original),
    };
  }, [listing]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 text-center text-sm text-[#565959]">
        Loading product…
      </div>
    );
  }

  if (!listing || !enriched) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 text-center">
        <p className="mb-3 text-lg font-medium text-[#0F1111]">
          Product not found
        </p>
        <Link
          href="/marketplace"
          className="text-sm font-medium text-[#007185] hover:underline"
        >
          ← Back to ReLife Marketplace
        </Link>
      </div>
    );
  }

  const Icon = CAT_ICON[listing.category] ?? Package;
  const addToCart = () =>
    addItem(
      {
        id: listing.id,
        name: listing.name,
        price: listing.price,
        original: listing.original,
        grade: listing.grade,
        category: listing.category,
        asin: listing.asin,
      },
      qty
    );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-1 text-xs text-[#565959]">
        <Link href="/marketplace" className="text-[#007185] hover:underline">
          ReLife Marketplace
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{listing.category}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 text-[#0F1111]">{listing.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)_320px]">
        {/* ---------------- Image column ---------------- */}
        <div className="lg:sticky lg:top-[140px] lg:self-start">
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-[#E7E7E7] bg-white">
            <ProductThumb
              asin={listing.asin}
              id={listing.id}
              name={listing.name}
              className="h-full w-full object-contain p-8"
              fallback={
                <Icon className="h-32 w-32 text-[#979aa0]" strokeWidth={1.1} />
              }
            />
            <span
              className={`absolute left-3 top-3 rounded-sm px-2 py-1 text-xs font-bold text-white ${
                GRADE_TONE[listing.grade] ?? "bg-[#007185]"
              }`}
            >
              Grade {listing.grade}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 rounded-md border border-[#067D62]/30 bg-[#F0FAF7] px-3 py-2 text-xs font-medium text-[#067D62]">
            <ShieldCheck className="h-4 w-4" /> Inspected &amp; certified by
            Amazon ReLife AI
          </div>
        </div>

        {/* ---------------- Details column ---------------- */}
        <div className="min-w-0">
          <h1 className="text-2xl font-medium leading-snug text-[#0F1111]">
            {listing.name}
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold text-[#0F1111]">
              {enriched.rating.rating.toFixed(1)}
            </span>
            <Stars rating={enriched.rating.rating} />
            <span className="text-[#007185]">
              {enriched.rating.count.toLocaleString("en-IN")} ratings
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-sm bg-[#EEF6FB] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#007185]">
              {listing.disposition}
            </span>
            <span className="flex items-center gap-1 rounded-sm bg-[#F0FAF7] px-2 py-0.5 text-xs font-bold text-[#067D62]">
              <Award className="h-3.5 w-3.5" /> {gradeLabel(listing.grade)}
            </span>
          </div>

          <hr className="my-3 border-[#E7E7E7]" />

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[#CC0C39]">-{enriched.discount}%</span>
            <span className="text-3xl font-medium text-[#0F1111]">
              {inr(listing.price)}
            </span>
          </div>
          <p className="text-xs text-[#565959]">
            M.R.P.:{" "}
            <span className="line-through">{inr(listing.original)}</span> ·
            Inclusive of all taxes
          </p>

          {/* About */}
          <div className="mt-4">
            <h2 className="mb-1.5 text-base font-bold text-[#0F1111]">
              About this item
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-[#333]">
              {enriched.about.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          {/* Condition report */}
          <div className="mt-4 rounded-md border border-[#E7E7E7] bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-[#0F1111]">
              <ShieldCheck className="h-4 w-4 text-[#067D62]" /> ReLife Condition
              Report
            </h2>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-[#565959]">Condition score</span>
              <span className="font-bold text-[#0F1111]">
                {listing.condition_score}/100
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#EAEDED]">
              <div
                className="h-full rounded-full bg-[#067D62]"
                style={{ width: `${listing.condition_score}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[#333]">
              {gradeBlurb(listing.grade)}
            </p>
            <p className="mt-1 text-xs text-[#565959]">
              Backed by a {warrantyFor(listing.grade)} and a ReLife Trust
              Certificate.
            </p>
          </div>

          {/* Specifications */}
          <div className="mt-4">
            <h2 className="mb-1.5 text-base font-bold text-[#0F1111]">
              Product specifications
            </h2>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {enriched.specs.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-[#F7F8F8]" : ""}>
                    <td className="w-1/3 border border-[#E7E7E7] px-3 py-1.5 font-medium text-[#565959]">
                      {row.label}
                    </td>
                    <td className="border border-[#E7E7E7] px-3 py-1.5 text-[#0F1111]">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------- Buy box column ---------------- */}
        <div className="lg:sticky lg:top-[140px] lg:self-start">
          <div className="rounded-md border border-[#D5D9D9] bg-white p-4">
            <p className="text-2xl font-medium text-[#0F1111]">
              {inr(listing.price)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-[#067D62]">
              <Leaf className="h-4 w-4" /> Saves ~{enriched.co2.toFixed(1)} kg
              CO₂ vs. new
            </p>

            <div className="mt-3 flex items-center gap-1 text-sm text-[#565959]">
              <Truck className="h-4 w-4" /> FREE delivery by{" "}
              <span className="font-medium text-[#0F1111]">tomorrow</span>
            </div>
            <p className="mt-1 text-lg font-medium text-[#067D62]">In stock</p>

            {/* Quantity selector */}
            <div className="mt-3 flex items-center gap-2">
              <label htmlFor="qty" className="text-sm text-[#565959]">
                Qty:
              </label>
              <select
                id="qty"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="rounded-md border border-[#D5D9D9] bg-[#F0F2F2] px-2 py-1 text-sm"
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={addToCart}
              className="mt-3 w-full rounded-full border border-[#FCD200] bg-[#FFD814] py-2 text-sm font-medium text-[#0F1111] hover:bg-[#F7CA00]"
            >
              Add to Cart
            </button>
            <button
              onClick={addToCart}
              className="mt-2 w-full rounded-full border border-[#FF9900] bg-[#FFA41C] py-2 text-sm font-medium text-[#0F1111] hover:bg-[#FA8900]"
            >
              Buy Now
            </button>

            <div className="mt-3 space-y-1.5 border-t border-[#E7E7E7] pt-3 text-xs text-[#565959]">
              <p className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#067D62]" /> Secure
                transaction
              </p>
              <p className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-[#067D62]" /> 7-day
                replacement
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#067D62]" /> ReLife
                Certified · {warrantyFor(listing.grade)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
