import Link from "next/link";
import {
  Recycle,
  ShoppingBag,
  Leaf,
  ShieldCheck,
  BarChart3,
  Repeat2,
  ArrowRight,
  Sparkles,
  IndianRupee,
  PackageCheck,
  Cpu,
} from "lucide-react";

const STATS = [
  { label: "Items Given a Second Life", value: "1,284", icon: PackageCheck, tint: "#067D62" },
  { label: "CO₂ Diverted from Landfill", value: "920 kg", icon: Leaf, tint: "#067D62" },
  { label: "Value Recovered", value: "₹14.5L", icon: IndianRupee, tint: "#FF9900" },
  { label: "Green Credits Issued", value: "48,200", icon: Sparkles, tint: "#007185" },
];

const TILES = [
  {
    href: "/portal",
    title: "ReLife Journey",
    desc: "Inspect a returned item, decide its best next life, find its next owner, and certify it — all with AI.",
    icon: Recycle,
    cta: "Start a return",
    primary: true,
  },
  {
    href: "/marketplace",
    title: "ReLife Marketplace",
    desc: "Shop AI-certified second-life products at a discount, each with a trust certificate.",
    icon: ShoppingBag,
    cta: "Browse marketplace",
  },
  {
    href: "/credits",
    title: "Impact Dashboard",
    desc: "Track your green credits, CO₂ saved, and sustainability tier.",
    icon: Leaf,
    cta: "View impact",
  },
  {
    href: "/product",
    title: "Smart Buy",
    desc: "Predictive return prevention — switch shoppers to get personalized, right-size suggestions before you buy.",
    icon: ShieldCheck,
    cta: "See a product",
  },
  {
    href: "/admin",
    title: "Admin Console",
    desc: "Returns analytics: recovery value, grade mix, and risk products.",
    icon: BarChart3,
    cta: "Open console",
  },
];

const PILLARS = [
  "Smart quality grading",
  "5-way AI decision engine",
  "Next best owner matching",
  "Trust certification",
  "Green credits",
  "Predictive return prevention",
];

export default function Home() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-lg border border-[#D5D9D9] bg-gradient-to-br from-[#131921] to-[#232F3E] text-white">
        <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF9900]/15 px-3 py-1 text-xs font-medium text-[#FF9900]">
              <Cpu className="h-3.5 w-3.5" /> Powered by AWS Bedrock — Amazon Nova
            </span>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              Amazon ReLife AI
            </h1>
            <p className="mt-1 text-xl font-medium text-[#FF9900]">
              Every Product Deserves a Second Life.
            </p>
            <p className="mt-3 max-w-xl text-sm text-gray-300">
              An intelligent ecosystem where returned and unused products
              automatically find their most valuable, sustainable next life — and
              their next best owner.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 rounded-full bg-[#FFA41C] px-5 py-2.5 text-sm font-bold text-[#0F1111] hover:bg-[#FA8900]"
              >
                Start a ReLife Journey <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-2 gap-2">
            {PILLARS.map((p) => (
              <div
                key={p}
                className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2.5 text-sm ring-1 ring-white/10"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-[#FF9900]" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-md border border-[#D5D9D9] bg-white p-4"
          >
            <div
              className="rounded-md p-2.5"
              style={{ backgroundColor: `${s.tint}1A` }}
            >
              <s.icon className="h-6 w-6" style={{ color: s.tint }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0F1111]">{s.value}</p>
              <p className="text-xs text-[#565959]">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Judge tip — self-guided demo signpost */}
      <div className="mt-5 flex items-center gap-2 rounded-md border border-[#FF9900]/40 bg-[#FFF7E6] px-4 py-2.5 text-sm text-[#0F1111]">
        <Sparkles className="h-4 w-4 shrink-0 text-[#FF9900]" />
        <span>
          <span className="font-bold">Try it:</span> open{" "}
          <Link href="/product" className="font-medium text-[#007185] hover:underline">
            Smart Buy
          </Link>{" "}
          and switch the shopper in the top bar — the AI&apos;s recommendation
          personalizes to each shopper&apos;s real usage.
        </span>
      </div>

      {/* Entry tiles */}
      <h2 className="mb-3 mt-7 text-lg font-bold text-[#0F1111]">
        Explore the ecosystem
      </h2>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`group flex flex-col rounded-lg border bg-white p-5 transition-shadow hover:shadow-md ${
              t.primary ? "border-[#FF9900] ring-1 ring-[#FF9900]" : "border-[#D5D9D9]"
            }`}
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-[#FF9900]/10">
              <t.icon className="h-6 w-6 text-[#FF9900]" />
            </div>
            <h3 className="text-base font-bold text-[#0F1111]">{t.title}</h3>
            <p className="mt-1 flex-1 text-sm text-[#565959]">{t.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#007185] group-hover:underline">
              {t.cta} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}

        {/* Trade-In */}
        <Link
          href="/tradein"
          className="group flex flex-col rounded-lg border border-[#D5D9D9] bg-white p-5 transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-[#FF9900]/10">
            <Repeat2 className="h-6 w-6 text-[#FF9900]" />
          </div>
          <h3 className="text-base font-bold text-[#0F1111]">Smart Trade-In</h3>
          <p className="mt-1 flex-1 text-sm text-[#565959]">
            Upload your old gadget → instant AI trade-in value + an upgrade
            suggestion you can apply at checkout.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#007185] group-hover:underline">
            Trade in an item <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </section>
    </div>
  );
}
