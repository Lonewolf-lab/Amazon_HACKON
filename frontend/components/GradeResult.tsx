"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GradeResult as GradeResultType } from "@/lib/api";

const gradeTone: Record<string, string> = {
  A: "bg-green-600",
  B: "bg-lime-600",
  C: "bg-yellow-600",
  D: "bg-orange-600",
  F: "bg-red-600",
};

export function GradeResult({ result }: { result: GradeResultType }) {
  const tone = gradeTone[result.grade?.toUpperCase()] ?? "bg-slate-600";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quality Grade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-xl text-3xl font-bold text-white",
              tone
            )}
          >
            {result.grade}
          </div>
          <p className="text-sm text-muted-foreground">{result.reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric label="Resale value" value={`${result.resale_pct}%`} />
          <Metric label="Confidence" value={`${result.confidence}%`} />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default GradeResult;
