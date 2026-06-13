"use client";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { IndianRupee, PackageCheck, Recycle, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const stats = [
  { label: "Recovery Value", value: "₹4.2L", icon: IndianRupee },
  { label: "Items Re-looped", value: "1,284", icon: PackageCheck },
  { label: "Resale Rate", value: "68%", icon: Recycle },
  { label: "CO₂ Saved", value: "920 kg", icon: Leaf },
];

const dispositionData = {
  labels: ["Resell", "Refurbish", "Donate", "Recycle", "Exchange"],
  datasets: [
    {
      data: [52, 21, 12, 8, 7],
      backgroundColor: [
        "#16a34a",
        "#65a30d",
        "#ca8a04",
        "#ea580c",
        "#0ea5e9",
      ],
      borderWidth: 0,
    },
  ],
};

const recoveryByMonth = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Recovery Value (₹K)",
      data: [180, 220, 260, 310, 380, 420],
      backgroundColor: "#16a34a",
      borderRadius: 6,
    },
  ],
};

const creditsTrend = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Green Credits Issued",
      data: [4200, 5100, 6300, 7400, 9100, 11200],
      borderColor: "#16a34a",
      backgroundColor: "rgba(22,163,74,0.15)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: "bottom" as const } },
};

export default function AdminPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Returns intelligence across grading, routing, and sustainability.
        </p>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disposition Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={dispositionData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recovery Value by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={recoveryByMonth} options={chartOptions} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Green Credits Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={creditsTrend} options={chartOptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
