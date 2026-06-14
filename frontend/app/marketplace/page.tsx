"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  ShieldCheck,
  Star,
  Leaf,
  Headphones,
  Shirt,
  Cpu,
  BookOpen,
  Dumbbell,
  Package,
  Sparkles,
} from "lucide-react";
import { getPublishedListings } from "@/lib/published";

/* Listings simulated from the seeded product catalog (real product names),
   priced as a % of original by grade. In production this is a returns×products
   scan behind GET /api/marketplace. */
type Grade = "A" | "B" | "C";
const RESALE_PCT: Record<Grade, number> = { A: 85, B: 65, C: 35 };
const SCORE: Record<Grade, number> = { A: 94, B: 78, C: 55 };

type Listing = {
  id: string;
  name: string;
  category: "Electronics" | "Fashion" | "Appliances" | "Books" | "Sports";
  grade: Grade;
  original: number;
};

const LISTINGS: Listing[] = [
  { id: "RL-2041", name: "boAt Rockerz 450 Bluetooth Headphones", category: "Electronics", grade: "B", original: 1499 },
  { id: "RL-2042", name: "Sony WH-1000XM5 Noise Cancelling Headphones", category: "Electronics", grade: "A", original: 29990 },
  { id: "RL-2043", name: "Fire TV Stick 4K with Alexa Remote", category: "Electronics", grade: "B", original: 5999 },
  { id: "RL-2044", name: "Logitech MX Master 3S Wireless Mouse", category: "Electronics", grade: "A", original: 8495 },
  { id: "RL-2045", name: "JBL Charge 5 Portable Bluetooth Speaker", category: "Electronics", grade: "B", original: 14999 },
  { id: "RL-2046", name: "realme Buds Air 5 TWS Earbuds", category: "Electronics", grade: "C", original: 3499 },
  { id: "RL-2047", name: "Levi's 511 Slim Fit Stretch Jeans", category: "Fashion", grade: "A", original: 2999 },
  { id: "RL-2048", name: "Puma Men's Running Shoes", category: "Fashion", grade: "B", original: 3499 },
  { id: "RL-2049", name: "Woodland Genuine Leather Casual Shoes", category: "Fashion", grade: "C", original: 4999 },
  { id: "RL-2050", name: "Havells Cista 1200W Air Fryer", category: "Appliances", grade: "A", original: 6999 },
  { id: "RL-2051", name: "Philips HL7707 750W Mixer Grinder", category: "Appliances", grade: "B", original: 3499 },
  { id: "RL-2052", name: "Prestige PKPW 500W Induction Cooktop", category: "Appliances", grade: "C", original: 2299 },
  { id: "RL-2053", name: "Atomic Habits by James Clear", category: "Books", grade: "A", original: 399 },
  { id: "RL-2054", name: "Yonex Muscle Power 2 Badminton Racquet", category: "Sports", grade: "B", original: 1299 },
  { id: "RL-2055", name: "Strauss Yoga Mat 6mm with Carry Strap", category: "Sports", grade: "A", original: 699 },
];

const CATEGORIES = ["All", "Electronics", "Fashion", "Appliances", "Books", "Sports"] as const;

const CAT_ICON: Record<string, typeof Cpu> = {
  Electronics: Headphones,
  Fashion: Shirt,
  Appliances: Cpu,
  Books: BookOpen,
  Sports: Dumbbell,
};

const GRADE_TONE: Record<Grade, string> = {
  A: "bg-[#067D62]",
  B: "bg-[#007185]",
  C: "bg-[#F0C14B] !text-[#0F1111]",
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// Unified card model — static catalog + user-published returns render the same.
type Display = Listing & {
  price: number;
  score: number;
  disposition?: string;
  justListed?: boolean;
};

export default function MarketplacePage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");

  // Items the user just sent through the ReLife Journey (from localStorage).
  const [published, setPublished] = useState<Display[]>([]);
  useEffect(() => {
    setPublished(
      getPublishedListings().map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        grade: p.grade,
        original: p.original,
        price: p.price,
        score: p.condition_score,
        disposition: p.disposition,
        justListed: true,
      }))
    );
  }, []);

  const fromStatic: Display[] = LISTINGS.map((l) => ({
    ...l,
    price: Math.round((l.original * RESALE_PCT[l.grade]) / 100),
    score: SCORE[l.grade],
  }));

  const all: Display[] = [...published, ...fromStatic];
  const listings = cat === "All" ? all : all.filter((l) => l.category === cat);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      <nav className="mb-2 flex items-center gap-1 text-xs text-[#565959]">
        <span className="text-[#007185]">Amazon ReLife</span>
        <ChevronRight className="h-3 w-3" />
        <span>ReLife Marketplace</span>
      </nav>

      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-2xl font-medium text-[#0F1111]">ReLife Marketplace</h1>
        <span className="flex items-center gap-1 rounded-sm bg-[#F0FAF7] px-2 py-0.5 text-xs font-bold text-[#067D62]">
          <ShieldCheck className="h-3.5 w-3.5" /> Every item AI-certified
        </span>
      </div>
      <p className="mb-4 text-sm text-[#565959]">
        Certified second-life products — inspected, graded, and trust-certified by
        Amazon ReLife AI. Great prices, lower footprint.
      </p>

      {/* Category filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              cat === c
                ? "border-[#FF9900] bg-[#FF9900]/10 text-[#0F1111]"
                : "border-[#D5D9D9] bg-white text-[#565959] hover:bg-[#F7FAFA]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {listings.map((l) => {
          const discount = Math.round((1 - l.price / l.original) * 100);
          const Icon = CAT_ICON[l.category] ?? Package;
          return (
            <div
              key={l.id}
              className={`flex flex-col overflow-hidden rounded-md border bg-white transition-shadow hover:shadow-md ${
                l.justListed
                  ? "border-[#FF9900] ring-1 ring-[#FF9900]"
                  : "border-[#D5D9D9]"
              }`}
            >
              {/* Image area */}
              <div className="relative flex h-32 items-center justify-center bg-[#F7F8F8]">
                <Icon className="h-12 w-12 text-[#979aa0]" />
                <span
                  className={`absolute left-2 top-2 rounded-sm px-1.5 py-0.5 text-[11px] font-bold text-white ${GRADE_TONE[l.grade]}`}
                >
                  Grade {l.grade}
                </span>
                <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-sm bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-[#067D62]">
                  <ShieldCheck className="h-3 w-3" /> Certified
                </span>
                {l.justListed && (
                  <span className="absolute bottom-2 left-2 flex items-center gap-0.5 rounded-sm bg-[#FF9900] px-1.5 py-0.5 text-[10px] font-bold text-[#131921]">
                    <Sparkles className="h-3 w-3" /> Just listed
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-3">
                {l.disposition && (
                  <span className="mb-1 w-fit rounded-sm bg-[#EEF6FB] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#007185]">
                    {l.disposition}
                  </span>
                )}
                <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-[#0F1111]">
                  {l.name}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs text-[#565959]">
                  <Star className="h-3 w-3 fill-[#FF9900] text-[#FF9900]" />
                  Condition {l.score}/100
                </div>

                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-[#0F1111]">
                    {inr(l.price)}
                  </span>
                  <span className="text-xs text-[#CC0C39]">-{discount}%</span>
                </div>
                <p className="text-xs text-[#565959]">
                  M.R.P.: <span className="line-through">{inr(l.original)}</span>
                </p>

                <p className="mt-1 flex items-center gap-1 text-xs text-[#067D62]">
                  <Leaf className="h-3 w-3" /> Earns green credits
                </p>

                <button className="mt-2 w-full rounded-full border border-[#FCD200] bg-[#FFD814] py-1.5 text-xs font-medium text-[#0F1111] hover:bg-[#F7CA00]">
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
