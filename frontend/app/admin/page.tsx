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
import {
  TrendingDown,
  IndianRupee,
  PackageCheck,
  Award,
  Leaf,
  Users,
  ChevronRight,
} from "lucide-react";

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

export default function AdminPage() {
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
