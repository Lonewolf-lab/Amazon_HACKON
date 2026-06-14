"use client";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import {
  TrendingDown,
  IndianRupee,
  PackageCheck,
  Award,
  Leaf,
  Users,
  ChevronRight,
  Wrench,
  X,
  RefreshCw,
  ImageIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  getJourneyList,
  getJourneyDetail,
  completeRefurbishment,
  type JourneyRecord,
} from "@/lib/api";
import { savePublishedListing } from "@/lib/published";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

/* ------------------------------ mock data --------------------------------- */

const KPIS = [
  { label: "Return Rate", value: "11.2%", sub: "↓ from 18%", tint: "#067D62", icon: TrendingDown },
  { label: "Revenue Recovered", value: "₹14,52,840", sub: "this quarter", tint: "#FF9900", icon: IndianRupee },
  { label: "Items Graded", value: "1,247", sub: "AI graded", tint: "#007185", icon: PackageCheck },
  { label: "Avg Grade", value: "B+", sub: "resale ready", tint: "#067D62", icon: Award },
  { label: "CO₂ Diverted", value: "840 kg", sub: "from landfill", tint: "#067D62", icon: Leaf },
  { label: "Active Users", value: "10,284", sub: "+12% MoM", tint: "#007185", icon: Users },
];

// Deterministic 30-day labels (no Date.now → stable SSR/CSR render).
const START = new Date(2026, 4, 15); // May 15, 2026
const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(START.getTime() + i * 86400000);
  return `${d.getDate()}/${d.getMonth() + 1}`;
});
const AFTER = DAYS.map((_, i) =>
  Number((18 - (7 * i) / 29).toFixed(1))
); // 18% → 11%
const BEFORE = DAYS.map(() => 18);

const returnTrend = {
  labels: DAYS,
  datasets: [
    {
      label: "Before ReLife",
      data: BEFORE,
      borderColor: "#979aa0",
      backgroundColor: "transparent",
      borderDash: [6, 4],
      pointRadius: 0,
      tension: 0.1,
    },
    {
      label: "After ReLife",
      data: AFTER,
      borderColor: "#FF9900",
      backgroundColor: "rgba(255,153,0,0.12)",
      fill: true,
      pointRadius: 0,
      tension: 0.35,
    },
  ],
};

const gradeDist = {
  labels: ["A — Like New", "B — Good", "C — Fair", "R — Recycle"],
  datasets: [
    {
      data: [30, 40, 20, 10],
      backgroundColor: ["#067D62", "#007185", "#F0C14B", "#CC0C39"],
      borderWidth: 0,
    },
  ],
};

const RISK = [
  { asin: "ASIN014", name: "Generic Cotton T-Shirt", cat: "Apparel", rate: 32, keep: 41 },
  { asin: "ASIN027", name: "Wireless Mouse X200", cat: "Electronics", rate: 29, keep: 48 },
  { asin: "ASIN006", name: "Slim Fit Chinos", cat: "Apparel", rate: 27, keep: 52 },
  { asin: "ASIN033", name: "LED Desk Lamp", cat: "Home", rate: 24, keep: 58 },
  { asin: "ASIN019", name: "Running Shoes Pro", cat: "Footwear", rate: 21, keep: 61 },
  { asin: "ASIN041", name: "Bluetooth Speaker Mini", cat: "Electronics", rate: 18, keep: 66 },
  { asin: "ASIN008", name: "Stainless Water Bottle", cat: "Home", rate: 12, keep: 78 },
  { asin: "ASIN001", name: "boAt Rockerz 450", cat: "Electronics", rate: 9, keep: 81 },
];

const RECOVERY = [
  { path: "Resell", value: "₹8,40,000", pct: 58, color: "#067D62" },
  { path: "Refurbish", value: "₹3,20,000", pct: 22, color: "#007185" },
  { path: "Exchange", value: "₹1,80,000", pct: 12, color: "#FF9900" },
  { path: "Donate", value: "₹80,000", pct: 5, color: "#F0C14B" },
  { path: "Recycle", value: "₹40,000", pct: 3, color: "#CC0C39" },
];

const ACTIVITY = [
  { ret: "RET248", grade: "A", path: "Amazon Renewed", time: "2 min ago" },
  { ret: "RET247", grade: "B", path: "P2P Resale", time: "8 min ago" },
  { ret: "RET246", grade: "R", path: "Recycle", time: "15 min ago" },
  { ret: "RET245", grade: "C", path: "Donate to NGO", time: "23 min ago" },
  { ret: "RET244", grade: "B", path: "Exchange", time: "31 min ago" },
];

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: { position: "bottom" as const, labels: { boxWidth: 12, font: { size: 11 } } },
    tooltip: { callbacks: { label: (c: { dataset: { label?: string }; parsed: { y: number | null } }) => `${c.dataset.label}: ${c.parsed.y ?? 0}%` } },
  },
  scales: {
    y: { min: 0, max: 22, ticks: { callback: (v: string | number) => `${v}%` }, grid: { color: "#EAEDED" } },
    x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 10 } } },
  },
};

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "bottom" as const, labels: { boxWidth: 12, font: { size: 11 } } } },
};

/* -------------------------------- page ------------------------------------ */

/* ---- status presentation for journey records (real data) ---- */
const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  in_refurbishment: { label: "In Refurbishment", bg: "bg-[#FEF3E0]", text: "text-[#B45309]" },
  completed: { label: "Completed", bg: "bg-[#F0FAF7]", text: "text-[#067D62]" },
  refurbished_listed: { label: "Refurbished · Listed", bg: "bg-[#EEF6FB]", text: "text-[#007185]" },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? {
    label: status,
    bg: "bg-[#F0F2F2]",
    text: "text-[#565959]",
  };
  return (
    <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
}

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("en-IN");
};

export default function AdminPage() {
  const [journeys, setJourneys] = useState<JourneyRecord[]>([]);
  const [loadingJ, setLoadingJ] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  async function refresh() {
    setLoadingJ(true);
    try {
      setJourneys(await getJourneyList());
    } catch {
      setJourneys([]);
    } finally {
      setLoadingJ(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  const refurbQueue = journeys.filter((j) => j.status === "in_refurbishment");

  return (
    <div>
      {/* AWS console-style header */}
      <div className="bg-[#232F3E] text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <h1 className="text-base font-bold">Amazon ReLife AI — Admin Console</h1>
          <span className="rounded-sm bg-[#161E2D] px-2 py-1 text-xs text-gray-300">
            Region: ap-south-1 (Mumbai)
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5">
        <nav className="mb-3 flex items-center gap-1 text-xs text-[#565959]">
          <span className="text-[#007185]">CloudWatch</span>
          <ChevronRight className="h-3 w-3" />
          <span>Analytics Dashboard</span>
        </nav>

        {/* KPI cards */}
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {KPIS.map((k) => (
            <div
              key={k.label}
              className="rounded-md border border-[#D5D9D9] bg-white p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide text-[#565959]">
                  {k.label}
                </span>
                <k.icon className="h-4 w-4" style={{ color: k.tint }} />
              </div>
              <p className="text-xl font-bold text-[#0F1111]">{k.value}</p>
              <p className="text-[11px]" style={{ color: k.tint }}>
                {k.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ===== Refurbishment Queue (REAL, DynamoDB-backed) ===== */}
        <div className="mb-5 rounded-md border border-[#D5D9D9] bg-white">
          <div className="flex items-center justify-between border-b border-[#D5D9D9] px-4 py-2.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#0F1111]">
              <Wrench className="h-4 w-4 text-[#007185]" />
              Refurbishment Queue
              <span className="rounded-sm bg-[#FEF3E0] px-1.5 py-0.5 text-[10px] font-bold text-[#B45309]">
                {refurbQueue.length} pending
              </span>
            </h2>
            <button
              onClick={refresh}
              className="flex items-center gap-1 text-xs text-[#007185] hover:underline"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
          {refurbQueue.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[#565959]">
              {loadingJ
                ? "Loading…"
                : "No items awaiting refurbishment. Grade-C returns sent to the warehouse will appear here."}
            </p>
          ) : (
            <ul className="divide-y divide-[#EAEDED]">
              {refurbQueue.map((j) => (
                <li
                  key={j.return_id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
                >
                  <Wrench className="h-5 w-5 shrink-0 text-[#B45309]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#0F1111]">
                      {j.product_name}
                    </p>
                    <p className="text-xs text-[#565959]">
                      {j.return_id} • Grade {j.grade} • {j.condition_score}/100 •{" "}
                      {(j.detected_issues || []).length} issue(s)
                    </p>
                  </div>
                  <StatusBadge status={j.status} />
                  <button
                    onClick={() => setSelected(j.return_id)}
                    className="rounded-full border border-[#FF8F00] bg-[#FFA41C] px-4 py-1.5 text-xs font-bold text-[#0F1111] hover:bg-[#FA8900]"
                  >
                    Manage
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ===== AI Decisions table (REAL, DynamoDB-backed) ===== */}
        <div className="mb-5 rounded-md border border-[#D5D9D9] bg-white">
          <div className="flex items-center justify-between border-b border-[#D5D9D9] px-4 py-2.5">
            <h2 className="text-sm font-bold text-[#0F1111]">
              ReLife Journey — AI Decisions{" "}
              <span className="font-normal text-[#565959]">
                ({journeys.length} live records)
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D5D9D9] bg-[#F7F8F8] text-left text-xs uppercase text-[#565959]">
                  <th className="px-3 py-2 font-medium">Return ID</th>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Reason</th>
                  <th className="px-3 py-2 font-medium">Grade</th>
                  <th className="px-3 py-2 font-medium">Decision</th>
                  <th className="px-3 py-2 font-medium">Recovery</th>
                  <th className="px-3 py-2 font-medium">Credits</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {journeys.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-6 text-center text-[#565959]"
                    >
                      {loadingJ
                        ? "Loading live decisions…"
                        : "No decisions yet. Complete a ReLife Journey to populate this table."}
                    </td>
                  </tr>
                ) : (
                  journeys.map((j) => (
                    <tr
                      key={j.return_id}
                      className="border-b border-[#EAEDED] last:border-0"
                    >
                      <td className="px-3 py-2 text-[#007185]">{j.return_id}</td>
                      <td className="px-3 py-2 text-[#0F1111]">
                        {j.product_name}
                      </td>
                      <td className="px-3 py-2 text-[#565959]">{j.reason}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-sm border border-[#D5D9D9] px-1.5 py-0.5 text-xs font-bold">
                          {j.grade}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[#0F1111]">
                        {j.disposition || j.chosen_path}
                      </td>
                      <td className="px-3 py-2 text-[#0F1111]">
                        ₹{(j.recovery_value || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2 font-medium text-[#067D62]">
                        +{j.green_credits || 0}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={j.status} />
                      </td>
                      <td className="px-3 py-2 text-xs text-[#565959]">
                        {fmtDate(j.created_at)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setSelected(j.return_id)}
                          className="rounded-sm border border-[#888C8C] bg-white px-2.5 py-1 text-xs font-medium text-[#007185] hover:bg-[#F7FAFA]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <Panel title="Return Rate Trend (Last 30 Days)">
            <div className="h-[280px]">
              <Line data={returnTrend} options={lineOpts} />
            </div>
          </Panel>
          <Panel title="Grade Distribution">
            <div className="mx-auto h-[280px] max-w-[280px]">
              <Doughnut data={gradeDist} options={doughnutOpts} />
            </div>
          </Panel>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          {/* Risk table */}
          <Panel title="High Return Risk Products">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D9] bg-[#F7F8F8] text-left text-xs uppercase text-[#565959]">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">ASIN</th>
                    <th className="px-3 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Return %</th>
                    <th className="px-3 py-2 font-medium">Keep</th>
                    <th className="px-3 py-2 font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {RISK.map((r, i) => (
                    <tr key={r.asin} className="border-b border-[#EAEDED] last:border-0">
                      <td className="px-3 py-2 text-[#565959]">{i + 1}</td>
                      <td className="px-3 py-2 text-[#007185]">{r.asin}</td>
                      <td className="px-3 py-2 text-[#0F1111]">{r.name}</td>
                      <td className="px-3 py-2 text-[#565959]">{r.cat}</td>
                      <td className="px-3 py-2 font-medium text-[#0F1111]">{r.rate}%</td>
                      <td className="px-3 py-2 text-[#565959]">{r.keep}</td>
                      <td className="px-3 py-2">
                        <RiskBadge rate={r.rate} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Right column */}
          <div className="space-y-5">
            <Panel title="Revenue Recovery by Path">
              <ul className="space-y-3">
                {RECOVERY.map((r) => (
                  <li key={r.path}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-[#0F1111]">{r.path}</span>
                      <span className="font-medium text-[#0F1111]">
                        {r.value}{" "}
                        <span className="text-[#565959]">({r.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7E9EC]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Recent Activity">
              <ul className="space-y-2.5">
                {ACTIVITY.map((a) => (
                  <li
                    key={a.ret}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#067D62]" />
                    <span className="text-[#007185]">{a.ret}</span>
                    <span className="rounded-sm border border-[#D5D9D9] px-1 text-xs font-bold">
                      {a.grade}
                    </span>
                    <span className="flex-1 truncate text-[#0F1111]">{a.path}</span>
                    <span className="text-xs text-[#979aa0]">{a.time}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
      {selected && (
        <DecisionModal
          returnId={selected}
          onClose={() => setSelected(null)}
          onRefurbished={() => {
            setSelected(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function DecisionModal({
  returnId,
  onClose,
  onRefurbished,
}: {
  returnId: string;
  onClose: () => void;
  onRefurbished: () => void;
}) {
  const [rec, setRec] = useState<JourneyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getJourneyDetail(returnId)
      .then((r) => active && setRec(r && r.return_id ? r : null))
      .catch(() => active && setRec(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [returnId]);

  async function markComplete() {
    if (!rec) return;
    setBusy(true);
    try {
      await completeRefurbishment(rec.return_id);
      // Graduate the repaired item to the Marketplace as "Refurbished".
      const g = (rec.grade || "C").toUpperCase();
      const price =
        rec.recovery_value ||
        Math.max(1, Math.round((rec.condition_score / 100) * 1499));
      savePublishedListing({
        id: rec.return_id,
        name: rec.product_name,
        category: "Electronics",
        grade: (["A", "B", "C"].includes(g) ? g : "C") as "A" | "B" | "C",
        original: Math.max(price + 1, Math.round(price / 0.6)),
        price,
        condition_score: rec.condition_score,
        disposition: "Refurbished",
        certificate_id: rec.return_id,
        publishedAt: Date.now(),
      });
      onRefurbished();
    } catch {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#D5D9D9] px-4 py-3">
          <h3 className="text-base font-bold text-[#0F1111]">
            Return Details {rec ? `— ${rec.return_id}` : ""}
          </h3>
          <button
            onClick={onClose}
            className="rounded-sm p-1 text-[#565959] hover:bg-[#F0F2F2]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-[#565959]">
            <Loader2 className="h-5 w-5 animate-spin text-[#FF9900]" /> Loading…
          </div>
        ) : !rec ? (
          <p className="px-4 py-16 text-center text-sm text-[#565959]">
            Record not found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[200px_1fr]">
            {/* Photo */}
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-[#D5D9D9] bg-[#F7F8F8]">
              {rec.image_base64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/${rec.image_format || "jpeg"};base64,${rec.image_base64}`}
                  alt="Returned product"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center text-[#979aa0]">
                  <ImageIcon className="h-10 w-10" />
                  <span className="mt-1 text-xs">No photo</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div>
                <p className="text-base font-bold text-[#0F1111]">
                  {rec.product_name}
                </p>
                <p className="text-xs text-[#565959]">
                  ASIN {rec.asin} • {fmtDate(rec.created_at)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                <Field label="Grade" value={rec.grade} />
                <Field label="Condition" value={`${rec.condition_score}/100`} />
                <Field label="AI Confidence" value={`${rec.confidence}%`} />
                <Field label="Decision" value={rec.disposition || rec.chosen_path} />
                <Field
                  label="Recovery"
                  value={`₹${(rec.recovery_value || 0).toLocaleString("en-IN")}`}
                />
                <Field label="Credits" value={`+${rec.green_credits || 0}`} />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#565959]">
                  Return reason
                </p>
                <p className="text-sm text-[#0F1111]">{rec.reason}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#565959]">
                  Problems detected by AI
                </p>
                {(rec.detected_issues || []).length === 0 ? (
                  <p className="text-sm text-[#565959]">None reported.</p>
                ) : (
                  <ul className="mt-1 space-y-0.5">
                    {rec.detected_issues.map((iss, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-1.5 text-sm text-[#0F1111]"
                      >
                        <span className="h-3 w-3 shrink-0 rounded-[3px] border border-[#888C8C]" />
                        {iss}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#565959]">
                  Status
                </span>
                <StatusBadge status={rec.status} />
              </div>

              {rec.status === "in_refurbishment" ? (
                <button
                  onClick={markComplete}
                  disabled={busy}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-[#FF8F00] bg-[#FFA41C] py-2.5 text-sm font-bold text-[#0F1111] hover:bg-[#FA8900] disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Listing…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Mark refurbishment
                      complete &amp; list as Renewed
                    </>
                  )}
                </button>
              ) : rec.status === "refurbished_listed" ? (
                <p className="mt-2 flex items-center gap-1.5 rounded-sm bg-[#EEF6FB] px-3 py-2 text-sm font-medium text-[#007185]">
                  <CheckCircle2 className="h-4 w-4" /> Refurbished and listed in
                  the Marketplace.
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#D5D9D9] bg-[#FAFAFA] p-2">
      <p className="text-sm font-bold text-[#0F1111]">{value}</p>
      <p className="text-[10px] text-[#565959]">{label}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-[#D5D9D9] bg-white">
      <div className="border-b border-[#D5D9D9] px-4 py-2.5">
        <h2 className="text-sm font-bold text-[#0F1111]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function RiskBadge({ rate }: { rate: number }) {
  const cfg =
    rate > 25
      ? { label: "HIGH", bg: "bg-[#FCE9EC]", text: "text-[#CC0C39]" }
      : rate >= 15
      ? { label: "MEDIUM", bg: "bg-[#FEF8E7]", text: "text-[#8A6D1A]" }
      : { label: "LOW", bg: "bg-[#F0FAF7]", text: "text-[#067D62]" };
  return (
    <span
      className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}
