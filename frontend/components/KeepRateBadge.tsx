"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PreventScore } from "@/lib/api";

const palette: Record<
  string,
  { bg: string; text: string; ring: string; Icon: typeof CheckCircle2 }
> = {
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-600/20",
    Icon: CheckCircle2,
  },
  yellow: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    ring: "ring-yellow-600/20",
    Icon: AlertTriangle,
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-600/20",
    Icon: XCircle,
  },
};

export function KeepRateBadge({ score }: { score: PreventScore }) {
  const tone = palette[score.badge_color] ?? palette.green;
  const { Icon } = tone;

  return (
    <div
      className={cn(
        "rounded-xl p-5 ring-1 ring-inset",
        tone.bg,
        tone.ring
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-8 w-8", tone.text)} />
        <div>
          <p className={cn("text-3xl font-bold leading-none", tone.text)}>
            {score.keep_rate}%
          </p>
          <p className="text-sm text-muted-foreground">predicted keep rate</p>
        </div>
      </div>
      <div className="mt-4 space-y-1 text-sm">
        <p>
          <span className="font-medium">Top return reason:</span>{" "}
          {score.top_reason}
        </p>
        <p className="text-muted-foreground">{score.recommendation}</p>
      </div>
    </div>
  );
}

export default KeepRateBadge;
