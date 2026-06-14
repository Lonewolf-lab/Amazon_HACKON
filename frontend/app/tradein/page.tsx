"use client";

import { useRef, useState } from "react";
import {
  UploadCloud,
  ChevronRight,
  Loader2,
  X,
  Repeat2,
  ArrowUpRight,
  IndianRupee,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { tradeIn, type TradeInResult } from "@/lib/api";

const CATEGORIES = ["electronics", "appliances", "clothing", "sports", "books"];

const GRADE_LABEL: Record<string, string> = {
  A: "Like New",
  B: "Good",
  C: "Fair",
  R: "For Recycling",
};

export default function TradeInPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState<{ base64: string; format: string } | null>(
    null
  );
  const [category, setCategory] = useState("electronics");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TradeInResult | null>(null);
  const [applied, setApplied] = useState(false);

  async function onFile(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    setImage({ base64: await fileToBase64(f), format: fileFormat(f) });
  }

  async function evaluate() {
    setLoading(true);
    setApplied(false);
    try {
      const r = await tradeIn({
        category,
        image_base64: image?.base64,
        image_format: image?.format,
        model_hint: hint || undefined,
      });
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-5">
      <nav className="mb-2 flex items-center gap-1 text-xs text-[#565959]">
        <span className="text-[#007185]">Amazon ReLife</span>
        <ChevronRight className="h-3 w-3" />
        <span>Smart Trade-In</span>
      </nav>

      <h1 className="flex items-center gap-2 text-2xl font-medium text-[#0F1111]">
        <Repeat2 className="h-6 w-6 text-[#FF9900]" /> Smart Trade-In
      </h1>
      <p className="mb-5 text-sm text-[#565959]">
        Upload your old gadget. ReLife AI grades it, estimates a fair trade-in
        value, and suggests an upgrade you can apply at checkout.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Input */}
        <div className="rounded-md border border-[#D5D9D9] bg-white">
          <div className="border-b border-[#D5D9D9] px-4 py-2.5">
            <h2 className="text-base font-bold text-[#0F1111]">Your Item</h2>
          </div>
          <div className="space-y-4 p-4">
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFile(e.dataTransfer.files);
              }}
              className="relative flex h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-sm border-2 border-dashed border-[#D5D9D9] bg-[#FAFAFA] text-center hover:border-[#FF9900]"
            >
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Your item"
                    className="h-full w-full object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setImage(null);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <UploadCloud className="mb-2 h-9 w-9 text-[#565959]" />
                  <p className="text-sm font-bold text-[#0F1111]">
                    Drop a photo of your gadget
                  </p>
                  <p className="mt-1 text-[11px] text-[#565959]">
                    JPG / PNG — the AI grades the real photo
                  </p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-[#0F1111]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-sm border border-[#888C8C] bg-[#F0F2F2] px-3 py-2 text-sm capitalize shadow-sm outline-none focus:border-[#FF9900]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-[#0F1111]">
                What is it? <span className="font-normal text-[#565959]">(optional)</span>
              </label>
              <input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="e.g. 2-year-old iPhone 13, 128GB"
                className="w-full rounded-sm border border-[#888C8C] bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#FF9900]"
              />
            </div>

            <button
              onClick={evaluate}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#FF8F00] bg-[#FFA41C] py-2.5 text-sm font-bold text-[#0F1111] hover:bg-[#FA8900] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Evaluating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Get Trade-In Value
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="rounded-md border border-[#D5D9D9] bg-white">
          <div className="border-b border-[#D5D9D9] px-4 py-2.5">
            <h2 className="text-base font-bold text-[#0F1111]">
              Trade-In Offer
            </h2>
          </div>
          {!result ? (
            <div className="flex h-[300px] items-center justify-center px-6 text-center text-sm text-[#565959]">
              Your AI trade-in offer will appear here.
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <div className="rounded-md bg-gradient-to-br from-[#FF9900] to-[#F0820A] p-5 text-center text-white">
                <p className="text-xs uppercase tracking-wide opacity-90">
                  Estimated Trade-In Value
                </p>
                <p className="flex items-center justify-center text-4xl font-bold">
                  <IndianRupee className="h-7 w-7" />
                  {result.trade_in_value_inr.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs opacity-90">
                  Condition: Grade {result.condition_grade} —{" "}
                  {GRADE_LABEL[result.condition_grade?.toUpperCase()] ?? "Assessed"}
                </p>
              </div>

              <div className="rounded-md border border-[#D5D9D9] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#565959]">
                  Suggested Upgrade
                </p>
                <p className="mt-1 flex items-center gap-1 text-base font-bold text-[#0F1111]">
                  <ArrowUpRight className="h-4 w-4 text-[#067D62]" />
                  {result.upgrade_name}
                </p>
                <p className="mt-0.5 text-sm text-[#565959]">
                  {result.upgrade_reason}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-md bg-[#F0FAF7] px-3 py-2.5 text-sm">
                <span className="flex items-center gap-1.5 text-[#067D62]">
                  <Sparkles className="h-4 w-4" /> Instant bonus credit
                </span>
                <span className="font-bold text-[#067D62]">
                  +₹{result.instant_credit.toLocaleString("en-IN")}
                </span>
              </div>

              {applied ? (
                <div className="flex items-center gap-2 rounded-sm border border-[#067D62]/30 bg-[#F0FAF7] px-4 py-3 text-sm font-bold text-[#067D62]">
                  <CheckCircle2 className="h-5 w-5" />
                  Credit applied — use it toward {result.upgrade_name}.
                </div>
              ) : (
                <button
                  onClick={() => setApplied(true)}
                  className="w-full rounded-full border border-[#FCD200] bg-[#FFD814] py-2.5 text-sm font-bold text-[#0F1111] hover:bg-[#F7CA00]"
                >
                  Apply ₹
                  {(result.trade_in_value_inr + result.instant_credit).toLocaleString(
                    "en-IN"
                  )}{" "}
                  toward upgrade
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fileFormat(file: File): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpeg";
}
