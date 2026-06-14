"use client";

import { useEffect, useRef, useState } from "react";
import {
  Star,
  Loader2,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
  IndianRupee,
  Laptop,
  Headphones,
  Tv,
  Camera,
  BookOpen,
  Shirt,
  Cpu,
  Package,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";
import { getPreventScore, type PreventScore } from "@/lib/api";
import { usePersona } from "@/lib/persona";

// A few sample products a judge can flip between. Names/prices come from the API.
const SAMPLE_PRODUCTS = [
  { asin: "ASIN051", label: "Gaming Laptop" },
  { asin: "ASIN052", label: "Refurbished Laptop" },
  { asin: "ASIN001", label: "Bluetooth Headphones" },
  { asin: "ASIN003", label: '43" Smart TV' },
  { asin: "ASIN012", label: "Mirrorless Camera" },
  { asin: "ASIN041", label: "Book — Atomic Habits" },
];

/** Best-guess product icon from the name (fallback when no photo is supplied). */
function typeIcon(name: string, category: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("laptop")) return Laptop;
  if (n.includes("headphone") || n.includes("earbud") || n.includes("buds"))
    return Headphones;
  if (n.includes(" tv") || n.includes("television")) return Tv;
  if (n.includes("camera")) return Camera;
  if (
    n.includes("book") ||
    n.includes("habits") ||
    n.includes("psychology") ||
    n.includes("rich dad") ||
    n.includes("deep work") ||
    n.includes("zero to one")
  )
    return BookOpen;
  if (category === "clothing") return Shirt;
  if (category === "electronics") return Cpu;
  return Package;
}

/** Shows /products/{asin}.png if present, else a type-appropriate icon. */
function ProductImage({
  asin,
  name,
  category,
}: {
  asin: string;
  name: string;
  category: string;
}) {
  const [err, setErr] = useState(false);
  const Icon = typeIcon(name, category);
  return (
    <div className="flex aspect-square w-full max-w-[440px] items-center justify-center overflow-hidden rounded-sm border border-[#D5D9D9] bg-white">
      {!err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/products/${asin}.jpg`}
          alt={name}
          onError={() => setErr(true)}
          className="h-full w-full object-contain p-4"
        />
      ) : (
        <Icon className="h-28 w-28 text-[#979aa0]" strokeWidth={1.2} />
      )}
    </div>
  );
}

const inr = (n: number) => n.toLocaleString("en-IN");

export default function ProductPage() {
  const { userId, persona } = usePersona();
  const [asin, setAsin] = useState("ASIN051");
  const [score, setScore] = useState<PreventScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  // Cache responses by (asin|user) so back/forward and re-clicks are instant.
  const cache = useRef<Map<string, PreventScore>>(new Map());

  useEffect(() => {
    const key = `${asin}|${userId}`;
    const cached = cache.current.get(key);
    if (cached) {
      setScore(cached);
      setError(null);
      setLoading(false);
      return;
    }
    let active = true;
    setScore(null);
    setError(null);
    setLoading(true);
    getPreventScore({ asin, user_id: userId })
      .then((s) => {
        if (!active) return;
        cache.current.set(key, s);
        setScore(s);
        // Prefetch the recommended alternative so jumping to it is instant.
        const alt = s.recommended_alternative?.asin;
        if (alt) {
          const altKey = `${alt}|${userId}`;
          if (!cache.current.has(altKey)) {
            getPreventScore({ asin: alt, user_id: userId })
              .then((a) => cache.current.set(altKey, a))
              .catch(() => {});
          }
        }
      })
      .catch(() => active && setError("Could not reach the ReLife intelligence service."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [asin, userId]);

  function scrollTop() {
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goTo(next: string) {
    if (next === asin) return;
    setHistory((h) => [...h, asin]);
    setAsin(next);
    scrollTop();
  }

  function goBack() {
    setHistory((h) => {
      if (h.length === 0) return h;
      setAsin(h[h.length - 1]);
      scrollTop();
      return h.slice(0, -1);
    });
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  const name = score?.product_name || (loading ? "Loading product…" : "Product");
  const price = score?.price_inr || 0;
  const mrp = price ? Math.round(price / 0.6) : 0;
  const discount = price && mrp ? Math.round((1 - price / mrp) * 100) : 0;
  const category = score?.category || "Electronics";

  // Always include the current product (e.g. a recommended alternative the user
  // jumped to) so the picker shows it selected instead of going blank.
  const options = SAMPLE_PRODUCTS.some((p) => p.asin === asin)
    ? SAMPLE_PRODUCTS
    : [{ asin, label: score?.product_name || asin }, ...SAMPLE_PRODUCTS];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-24 z-50 flex items-center gap-2 rounded-md bg-[#067D62] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {/* Back + breadcrumb + product picker */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 rounded-sm border border-[#D5D9D9] bg-white px-2 py-1 text-xs font-medium text-[#0F1111] hover:bg-[#F7FAFA]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
          <nav className="flex flex-wrap items-center gap-1 text-xs capitalize text-[#565959]">
            <span className="text-[#007185]">{category}</span>
            <ChevronRight className="h-3 w-3" />
            <span>Smart Buy</span>
          </nav>
        </div>
        <label className="flex items-center gap-2 text-xs text-[#565959]">
          Demo product:
          <select
            value={asin}
            onChange={(e) => goTo(e.target.value)}
            className="rounded-sm border border-[#888C8C] bg-[#F0F2F2] px-2 py-1 text-sm text-[#0F1111] shadow-sm"
          >
            {options.map((p) => (
              <option key={p.asin} value={p.asin}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT — title + image */}
        <div className="min-w-0">
          <h1 className="text-2xl font-medium leading-snug text-[#0F1111]">
            {name}
          </h1>
          <button
            onClick={() => flash("Brand store — demo only")}
            className="mt-1 inline-block text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            Visit the Brand Store
          </button>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-[#0F1111]">4.2</span>
            <Stars value={4.2} />
            <span className="text-[#007185]">(2,847 ratings)</span>
            <span className="text-[#565959]">|</span>
            <span className="font-semibold text-[#CC0C39]">
              1,200+ bought in last month
            </span>
          </div>

          <hr className="my-3 border-[#D5D9D9]" />

          <ProductImage asin={asin} name={name} category={category} />
        </div>

        {/* RIGHT — buy box */}
        <aside className="h-fit rounded-md border border-[#D5D9D9] bg-white p-4">
          <div className="flex items-baseline gap-2">
            {discount > 0 && (
              <span className="text-sm text-[#CC0C39]">-{discount}%</span>
            )}
            <span className="text-3xl font-medium text-[#0F1111]">
              <span className="align-super text-base">₹</span>
              {inr(price)}
            </span>
          </div>
          {mrp > 0 && (
            <p className="text-xs text-[#565959]">
              M.R.P.: <span className="line-through">₹{inr(mrp)}</span>
            </p>
          )}
          <p className="mt-1 text-xs text-[#565959]">Inclusive of all taxes</p>

          <p className="mt-3 text-sm">
            <span className="font-bold">FREE delivery Tomorrow</span> by 10 PM
          </p>
          <p className="mt-2 text-lg font-medium text-[#067D62]">In Stock</p>

          {/* ReLife Purchase Intelligence (personalized) */}
          <div className="mt-4 rounded-md border border-[#D5D9D9] bg-[#FAFAFA] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#565959]">
                <Sparkles className="h-3.5 w-3.5 text-[#FF9900]" />
                ReLife Purchase Intelligence
              </p>
            </div>
            <p className="mb-2 text-[11px] text-[#565959]">
              Personalized for{" "}
              <span className="font-bold text-[#0F1111]">{persona.label}</span>{" "}
              — switch shoppers in the top bar to see it adapt.
            </p>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-[#565959]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing for this shopper…
              </div>
            )}
            {error && <p className="text-sm text-[#CC0C39]">{error}</p>}
            {score && !loading && <KeepRate score={score} />}
          </div>

          {/* Smarter-choice right-size card */}
          {score && !loading && score.needs_fit === "overkill" &&
            score.recommended_alternative && (
              <SmarterChoice score={score} onView={goTo} />
            )}

          <button
            onClick={() => flash(`Added to cart: ${name}`)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#FCD200] bg-[#FFD814] py-2 text-sm font-medium text-[#0F1111] hover:bg-[#F7CA00]"
          >
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </button>
          <button
            onClick={() => flash(`Order placed (demo): ${name}`)}
            className="mt-2 w-full rounded-full border border-[#FF8F00] bg-[#FFA41C] py-2 text-sm font-medium text-[#0F1111] hover:bg-[#FA8900]"
          >
            Buy Now
          </button>

          <div className="mt-3 rounded-sm bg-[#F0FAF7] p-2 text-[11px] text-[#067D62]">
            ♻ ReLife eligible — returns earn Green Credits
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ----------------------------- Keep-rate UI ------------------------------- */

function KeepRate({ score }: { score: PreventScore }) {
  const color = (score.badge_color || "").toLowerCase();
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
      <div className="mt-2 rounded-sm border border-[#F0C14B] bg-[#FEF8E7] p-2 text-xs text-[#0F1111]">
        💡 {score.recommendation}
      </div>
    </div>
  );
}

/* ------------------------- Right-size / Smarter choice -------------------- */

function SmarterChoice({
  score,
  onView,
}: {
  score: PreventScore;
  onView: (asin: string) => void;
}) {
  const alt = score.recommended_alternative!;
  const savings = score.potential_savings_inr || 0;

  return (
    <div className="mt-3 overflow-hidden rounded-md border border-[#007185]/40 bg-[#F1F8FB]">
      <div className="flex items-center gap-1.5 bg-[#007185] px-3 py-1.5 text-xs font-bold text-white">
        <Sparkles className="h-3.5 w-3.5" /> Smarter choice for you
      </div>
      <div className="space-y-2 p-3">
        {score.usage_profile && score.usage_profile.length > 0 && (
          <p className="text-xs text-[#565959]">
            AI sees you mostly:{" "}
            <span className="font-medium text-[#0F1111]">
              {score.usage_profile.join(" · ")}
            </span>
          </p>
        )}
        {score.right_size_reason && (
          <p className="text-sm text-[#0F1111]">{score.right_size_reason}</p>
        )}

        <div className="rounded-sm border border-[#D5D9D9] bg-white p-2.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#067D62]">
            <ShieldCheck className="h-3.5 w-3.5" /> Amazon ReLife Certified ·{" "}
            {alt.condition}
          </div>
          <p className="mt-0.5 text-sm font-medium text-[#0F1111]">{alt.name}</p>
          <p className="text-lg font-bold text-[#0F1111]">
            ₹{inr(alt.refurbished_price)}
          </p>
        </div>

        {savings > 0 && (
          <div className="flex items-center justify-between rounded-sm bg-[#067D62]/10 px-2.5 py-1.5">
            <span className="flex items-center gap-1 text-sm font-bold text-[#067D62]">
              <IndianRupee className="h-4 w-4" /> Potential savings
            </span>
            <span className="text-lg font-bold text-[#067D62]">
              ₹{inr(savings)}
            </span>
          </div>
        )}

        <p className="text-[11px] text-[#565959]">
          Right-sizing your purchase reduces the chance of a future return.
        </p>
        <button
          onClick={() => onView(alt.asin)}
          className="block w-full rounded-full border border-[#FF8F00] bg-[#FFA41C] py-2 text-center text-sm font-bold text-[#0F1111] hover:bg-[#FA8900]"
        >
          See the Renewed alternative →
        </button>
      </div>
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
