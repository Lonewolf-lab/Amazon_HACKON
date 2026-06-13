"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  Loader2,
  ImageIcon,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { getPreventScore, type PreventScore } from "@/lib/api";

const PRICE = 1499;
const MRP = 2999;

export default function ProductPage() {
  const [score, setScore] = useState<PreventScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPreventScore({ asin: "ASIN001", user_id: "USER001" })
      .then(setScore)
      .catch(() => setError("Could not reach the ReLoop intelligence service."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4">
      {/* Breadcrumb */}
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-[#565959]">
        <span className="text-[#007185]">Electronics</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#007185]">Headphones &amp; Earbuds</span>
        <ChevronRight className="h-3 w-3" />
        <span>Over-Ear</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT — title + images */}
        <div className="min-w-0">
          <h1 className="text-2xl font-medium leading-snug text-[#0F1111]">
            boAt Rockerz 450 Bluetooth On-Ear Headphones with 15 Hours Playback,
            40mm Drivers, Padded Ear Cushions (Luscious Black)
          </h1>
          <Link href="#" className="mt-1 inline-block text-sm text-[#007185] hover:text-[#C7511F] hover:underline">
            Visit the boAt Store
          </Link>

          {/* Ratings row */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-[#0F1111]">4.2</span>
            <Stars value={4.2} />
            <Link href="#" className="text-[#007185] hover:underline">
              (2,847 ratings)
            </Link>
            <span className="text-[#565959]">|</span>
            <span className="font-semibold text-[#CC0C39]">
              1,200+ bought in last month
            </span>
          </div>

          <hr className="my-3 border-[#D5D9D9]" />

          {/* Main image */}
          <div className="flex aspect-square w-full max-w-[440px] items-center justify-center rounded-sm border border-[#D5D9D9] bg-white">
            <div className="flex flex-col items-center text-[#565959]">
              <ImageIcon className="h-20 w-20" />
              <span className="mt-2 text-sm">Product Image</span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-3 flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex h-16 w-16 items-center justify-center rounded-sm border bg-white ${
                  i === 0 ? "border-[#E77600] ring-1 ring-[#E77600]" : "border-[#D5D9D9]"
                }`}
              >
                <ImageIcon className="h-6 w-6 text-[#979aa0]" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — buy box */}
        <aside className="h-fit rounded-md border border-[#D5D9D9] bg-white p-4">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-[#CC0C39]">-50%</span>
            <span className="text-3xl font-medium text-[#0F1111]">
              <span className="align-super text-base">₹</span>
              {PRICE.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-xs text-[#565959]">
            M.R.P.:{" "}
            <span className="line-through">₹{MRP.toLocaleString("en-IN")}</span>
          </p>
          <p className="mt-1 text-xs text-[#565959]">Inclusive of all taxes</p>

          <p className="mt-3 text-sm">
            <span className="font-bold">FREE delivery Tomorrow</span> by 10 PM
          </p>
          <p className="text-xs text-[#565959]">
            Order within 6 hrs 12 mins
          </p>

          <p className="mt-3 text-lg font-medium text-[#067D62]">In Stock</p>

          {/* ReLoop Purchase Intelligence */}
          <div className="mt-4 rounded-md border border-[#D5D9D9] bg-[#FAFAFA] p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#565959]">
              <Sparkles className="h-3.5 w-3.5 text-[#FF9900]" />
              ReLoop Purchase Intelligence
            </p>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-[#565959]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing return signals…
              </div>
            )}
            {error && <p className="text-sm text-[#CC0C39]">{error}</p>}

            {score && <KeepRate score={score} />}
          </div>

          {/* Quantity */}
          <div className="mt-4">
            <label className="text-sm text-[#0F1111]">
              Qty:{" "}
              <select className="rounded-md border border-[#D5D9D9] bg-[#F0F2F2] px-2 py-1 text-sm shadow-sm">
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>

          {/* CTAs */}
          <button className="mt-3 w-full rounded-full border border-[#FCD200] bg-[#FFD814] py-2 text-sm font-medium text-[#0F1111] hover:bg-[#F7CA00]">
            Add to Cart
          </button>
          <button className="mt-2 w-full rounded-full border border-[#FF8F00] bg-[#FFA41C] py-2 text-sm font-medium text-[#0F1111] hover:bg-[#FA8900]">
            Buy Now
          </button>

          <hr className="my-3 border-[#D5D9D9]" />

          <dl className="space-y-1 text-xs text-[#565959]">
            <div className="flex justify-between">
              <dt>Sold by</dt>
              <dd className="text-[#007185]">TechStore India</dd>
            </div>
            <div className="flex justify-between">
              <dt>Returns</dt>
              <dd className="text-right">Eligible within 30 days</dd>
            </div>
          </dl>

          <div className="mt-3 rounded-sm bg-[#F0FAF7] p-2 text-[11px] text-[#067D62]">
            ♻ This product is ReLoop eligible — returns earn Green Credits
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ----------------------------- Keep-rate UI ------------------------------- */

function KeepRate({ score }: { score: PreventScore }) {
  const color = (score.badge_color || "").toLowerCase();
  const showRenewed = score.keep_rate < 70;

  const pill =
    color === "red"
      ? { bg: "bg-[#CC0C39]", text: "text-white", Icon: XCircle }
      : color === "yellow"
      ? { bg: "bg-[#F0C14B]", text: "text-[#0F1111]", Icon: AlertTriangle }
      : { bg: "bg-[#067D62]", text: "text-white", Icon: CheckCircle2 };

  const { Icon } = pill;

  return (
    <div>
      <div
        className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-sm font-bold ${pill.bg} ${pill.text}`}
      >
        <Icon className="h-4 w-4" />
        {score.keep_rate}% buyers keep this item
      </div>

      {score.top_reason && (
        <p className="mt-2 text-xs italic text-[#565959]">
          Most common return reason: {score.top_reason}
        </p>
      )}

      {/* Amazon-style "frequently returned" alert */}
      <div className="mt-2 rounded-sm border border-[#F0C14B] bg-[#FEF8E7] p-2 text-xs text-[#0F1111]">
        💡 {score.recommendation}
      </div>

      {showRenewed && (
        <div className="mt-2 rounded-sm border border-[#007185]/30 bg-[#F1F8FB] p-3">
          <p className="text-sm font-bold text-[#0F1111]">
            Amazon Renewed Alternative Available
          </p>
          <p className="mt-0.5 text-xs text-[#565959]">
            Certified refurbished • 40% off • Same warranty
          </p>
          <Link
            href="#"
            className="mt-1 inline-block text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            See Renewed Options →
          </Link>
        </div>
      )}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block h-4 w-4">
            <Star className="absolute h-4 w-4 text-[#FF9900]" />
            <span
              className="absolute overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className="h-4 w-4 fill-[#FF9900] text-[#FF9900]" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
