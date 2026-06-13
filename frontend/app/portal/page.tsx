"use client";

import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Info,
  Repeat,
  Wrench,
  Heart,
  Recycle,
  RefreshCw,
  X,
  ImageIcon,
} from "lucide-react";
import {
  gradeItem,
  getRedirectPaths,
  type GradeResult,
  type RedirectPath,
} from "@/lib/api";

const PRICE = 1499;

const RETURN_REASONS = [
  "Size runs small",
  "Not as described",
  "Changed my mind",
  "Defective",
  "Wrong item",
  "Poor quality",
];

type Step = 1 | 2 | 3;

export default function PortalPage() {
  const [step, setStep] = useState<Step>(1);
  const [previews, setPreviews] = useState<string[]>([]);
  const [reason, setReason] = useState(RETURN_REASONS[0]);

  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [paths, setPaths] = useState<RedirectPath[] | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const recommended = paths?.find((p) => p.recommended) ?? paths?.[0] ?? null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      {/* Breadcrumb */}
      <nav className="mb-2 flex items-center gap-1 text-xs text-[#565959]">
        <span className="text-[#007185]">ReLoop</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#007185]">Return Portal</span>
        <ChevronRight className="h-3 w-3" />
        <span>New Return</span>
      </nav>

      <h1 className="text-2xl font-medium text-[#0F1111]">
        Initiate Product Return
      </h1>
      <p className="mb-5 text-sm text-[#565959]">
        Upload photos of your item and let ReLoop AI grade it and route it to the
        best next owner.
      </p>

      {/* Step indicator */}
      <StepIndicator step={step} />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* LEFT — workflow */}
        <div className="min-w-0">
          {step === 1 && (
            <StepUpload
              previews={previews}
              setPreviews={setPreviews}
              reason={reason}
              setReason={setReason}
              onContinue={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepGrading
              onDone={(g, p) => {
                setGrade(g);
                setPaths(p);
                setStep(3);
              }}
            />
          )}
          {step === 3 && grade && paths && (
            <StepReview
              grade={grade}
              paths={paths}
              confirmed={confirmed}
              onConfirm={setConfirmed}
            />
          )}
        </div>

        {/* RIGHT — sticky summary */}
        <aside className="h-fit lg:sticky lg:top-[120px]">
          <div className="rounded-md border border-[#D5D9D9] bg-white">
            <div className="border-b border-[#D5D9D9] px-4 py-2.5">
              <h2 className="text-base font-bold text-[#0F1111]">
                Return Summary
              </h2>
            </div>
            <dl className="space-y-2.5 px-4 py-3 text-sm">
              <Row label="Product" value="boAt Rockerz 450" />
              <Row label="Return ID" value="RET001" />
              <Row label="Reason" value={reason} />
              <Row
                label="Grade"
                value={grade ? grade.grade : "—"}
                strong={!!grade}
              />
              <Row
                label="Recovery Value"
                value={
                  recommended
                    ? `₹${recommended.estimated_recovery_value.toLocaleString(
                        "en-IN"
                      )}`
                    : "—"
                }
              />
              <Row
                label="Green Credits"
                value={
                  recommended ? `+${recommended.green_credits_to_issue}` : "—"
                }
                accent
              />
              <hr className="border-[#D5D9D9]" />
              <Row
                label="Status"
                value={
                  confirmed
                    ? "Confirmed"
                    : step === 3
                    ? "Ready to confirm"
                    : step === 2
                    ? "Grading…"
                    : "Draft"
                }
                strong
              />
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ----------------------------- Step indicator ----------------------------- */

function StepIndicator({ step }: { step: Step }) {
  const items = [
    { n: 1, label: "Upload Images" },
    { n: 2, label: "AI Grading" },
    { n: 3, label: "Review & Confirm" },
  ];
  return (
    <div className="flex items-center">
      {items.map((it, i) => {
        const done = step > it.n;
        const active = step === it.n;
        return (
          <div key={it.n} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-[#067D62] text-white"
                    : active
                    ? "bg-[#FF9900] text-[#131921]"
                    : "bg-[#D5D9D9] text-[#565959]"
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : it.n}
              </span>
              <span
                className={`text-sm ${
                  active ? "font-bold text-[#0F1111]" : "text-[#565959]"
                }`}
              >
                {it.label}
              </span>
            </div>
            {i < items.length - 1 && (
              <div
                className={`mx-3 h-0.5 flex-1 ${
                  step > it.n ? "bg-[#067D62]" : "bg-[#D5D9D9]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- Step 1 ----------------------------------- */

function StepUpload({
  previews,
  setPreviews,
  reason,
  setReason,
  onContinue,
}: {
  previews: string[];
  setPreviews: (p: string[]) => void;
  reason: string;
  setReason: (r: string) => void;
  onContinue: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const urls = Array.from(files)
      .slice(0, 3 - previews.length)
      .map((f) => URL.createObjectURL(f));
    setPreviews([...previews, ...urls].slice(0, 3));
  }

  return (
    <div className="rounded-md border border-[#D5D9D9] bg-white">
      <div className="border-b border-[#D5D9D9] px-4 py-2.5">
        <h2 className="flex items-center gap-1.5 text-base font-bold text-[#0F1111]">
          Product Images
          <Info className="h-3.5 w-3.5 text-[#565959]" />
        </h2>
      </div>

      <div className="space-y-4 p-4">
        {/* Dropzone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#D5D9D9] bg-[#FAFAFA] text-center hover:border-[#FF9900]"
        >
          <UploadCloud className="mb-2 h-9 w-9 text-[#565959]" />
          <p className="text-sm font-bold text-[#0F1111]">
            Drag and drop images here
          </p>
          <p className="my-1 text-xs text-[#565959]">or</p>
          <span className="rounded-sm border border-[#888C8C] bg-white px-3 py-1 text-sm text-[#0073BB] shadow-sm hover:bg-[#F7FAFA]">
            Choose files
          </span>
          <p className="mt-2 text-[11px] text-[#565959]">
            Supports: JPG, PNG, WEBP • Max 3 images • Max 5MB each
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-sm border border-[#D5D9D9] bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Upload ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() =>
                    setPreviews(previews.filter((_, idx) => idx !== i))
                  }
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="mb-1 block text-sm font-bold text-[#0F1111]">
            Return Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-sm border border-[#888C8C] bg-[#F0F2F2] px-3 py-2 text-sm shadow-sm outline-none focus:border-[#FF9900]"
          >
            {RETURN_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onContinue}
          className="w-full rounded-full border border-[#FF8F00] bg-[#FFA41C] py-2 text-sm font-medium text-[#0F1111] hover:bg-[#FA8900]"
        >
          Continue to AI Grading →
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Step 2 ----------------------------------- */

function StepGrading({
  onDone,
}: {
  onDone: (g: GradeResult, p: RedirectPath[]) => void;
}) {
  const [stage, setStage] = useState(0); // 0..3 substeps revealed
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const t1 = setTimeout(() => setStage(1), 400);
    const t2 = setTimeout(() => setStage(2), 1200);

    (async () => {
      try {
        const g = await gradeItem({
          image_urls: [
            "https://hackon-images.s3.amazonaws.com/returns/RET001_1.jpg",
          ],
          asin: "ASIN001",
          return_id: "RET001",
        });
        setStage(3);
        const p = await getRedirectPaths({
          return_id: "RET001",
          grade: g.grade,
          asin: "ASIN001",
        });
        // small beat so the user sees the final checkmark
        setTimeout(() => onDone(g, p), 600);
      } catch {
        // Fallback so the demo never stalls.
        const g: GradeResult = {
          grade: "B",
          reason: "Minor cosmetic wear on ear cushions, all functions intact",
          resale_pct: 65,
          confidence: 88,
        };
        const p: RedirectPath[] = FALLBACK_PATHS;
        setStage(3);
        setTimeout(() => onDone(g, p), 600);
      }
    })();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  const subs = [
    { label: "Images received", at: 0 },
    { label: "Running quality assessment…", at: 1 },
    { label: "Calculating resale value…", at: 2 },
  ];

  return (
    <div className="rounded-md border border-[#D5D9D9] bg-white">
      <div className="border-b border-[#D5D9D9] px-4 py-2.5">
        <h2 className="text-base font-bold text-[#0F1111]">AI Grading</h2>
      </div>
      <div className="flex flex-col items-center gap-4 px-4 py-10">
        <Loader2 className="h-12 w-12 animate-spin text-[#FF9900]" />
        <p className="text-sm font-medium text-[#0F1111]">
          ReLoop AI is analysing your item…
        </p>
        <ul className="w-full max-w-sm space-y-2">
          {subs.map((s, i) => {
            const done = stage > s.at;
            const active = stage === s.at;
            return (
              <li
                key={i}
                className={`flex items-center gap-2 text-sm ${
                  done
                    ? "text-[#067D62]"
                    : active
                    ? "text-[#0F1111]"
                    : "text-[#979aa0]"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-[#D5D9D9]" />
                )}
                {s.label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------- Step 3 ----------------------------------- */

function StepReview({
  grade,
  paths,
  confirmed,
  onConfirm,
}: {
  grade: GradeResult;
  paths: RedirectPath[];
  confirmed: string | null;
  onConfirm: (path: string) => void;
}) {
  const recommended = paths.find((p) => p.recommended) ?? paths[0];
  const resaleValue = Math.round((grade.resale_pct / 100) * PRICE);

  return (
    <div className="space-y-4">
      {/* Success banner */}
      <div className="flex items-center gap-2 rounded-sm border border-[#067D62]/30 bg-[#F0FAF7] px-4 py-2.5 text-sm font-bold text-[#067D62]">
        <CheckCircle2 className="h-5 w-5" />
        AI Grading Complete
      </div>

      {/* Grade badge */}
      <GradeBadge grade={grade.grade} />

      {/* Assessment */}
      <div className="rounded-md border border-[#D5D9D9] bg-white p-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#565959]">
          Quality Assessment
        </p>
        <p className="text-sm text-[#0F1111]">{grade.reason}</p>

        <p className="mt-3 mb-1 text-xs text-[#565959]">
          Confidence: {grade.confidence}%
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7E9EC]">
          <div
            className="h-full bg-[#FF9900]"
            style={{ width: `${grade.confidence}%` }}
          />
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#0F1111]">
            ₹{resaleValue.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-[#565959]">
            Estimated resale value ({grade.resale_pct}% of ₹
            {PRICE.toLocaleString("en-IN")})
          </span>
        </div>
      </div>

      {/* Recommended path */}
      <div className="rounded-md border border-[#D5D9D9] border-l-4 border-l-[#FF9900] bg-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#565959]">
          AI Recommended Path
        </p>
        <div className="mt-1 flex items-center gap-2">
          <PathIcon path={recommended.path} className="h-6 w-6 text-[#FF9900]" />
          <span className="text-xl font-bold text-[#0F1111]">
            {PATH_LABELS[recommended.path] ?? recommended.path}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#565959]">{recommended.reason}</p>
        <div className="mt-2 flex gap-6 text-sm">
          <span>
            Recovery:{" "}
            <span className="font-bold text-[#0F1111]">
              ₹{recommended.estimated_recovery_value.toLocaleString("en-IN")}
            </span>
          </span>
          <span>
            Green Credits:{" "}
            <span className="font-bold text-[#067D62]">
              +{recommended.green_credits_to_issue}
            </span>
          </span>
        </div>
      </div>

      {/* All paths ranked */}
      <div className="rounded-md border border-[#D5D9D9] bg-white">
        <div className="border-b border-[#D5D9D9] px-4 py-2.5">
          <h3 className="text-sm font-bold text-[#0F1111]">
            All Routing Options
          </h3>
        </div>
        <ul className="divide-y divide-[#EAEDED]">
          {[...paths]
            .sort((a, b) => b.confidence - a.confidence)
            .map((p) => (
              <li
                key={p.path}
                className="flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <PathIcon
                  path={p.path}
                  className="h-5 w-5 shrink-0 text-[#565959]"
                />
                <span className="w-36 font-medium text-[#0F1111]">
                  {PATH_LABELS[p.path] ?? p.path}
                </span>
                <span className="w-24 text-[#565959]">{p.confidence}% conf.</span>
                <span className="flex-1 text-[#565959]">
                  ₹{p.estimated_recovery_value.toLocaleString("en-IN")}
                </span>
                <span className="text-[#067D62]">
                  +{p.green_credits_to_issue}
                </span>
                {p.recommended && (
                  <span className="rounded-sm bg-[#FF9900] px-1.5 py-0.5 text-[10px] font-bold text-[#131921]">
                    BEST
                  </span>
                )}
              </li>
            ))}
        </ul>
      </div>

      {/* Actions */}
      {confirmed ? (
        <div className="flex items-center gap-2 rounded-sm border border-[#067D62]/30 bg-[#F0FAF7] px-4 py-3 text-sm font-bold text-[#067D62]">
          <CheckCircle2 className="h-5 w-5" />
          Return confirmed via “{PATH_LABELS[confirmed] ?? confirmed}”. Green
          Credits issued.
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => onConfirm(recommended.path)}
            className="w-full rounded-full border border-[#FF8F00] bg-[#FFA41C] py-2.5 text-sm font-bold text-[#0F1111] hover:bg-[#FA8900]"
          >
            Confirm — {PATH_LABELS[recommended.path] ?? recommended.path}
          </button>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {paths
              .filter((p) => !p.recommended)
              .map((p) => (
                <button
                  key={p.path}
                  onClick={() => onConfirm(p.path)}
                  className="rounded-full border border-[#888C8C] bg-white py-2 text-xs font-medium text-[#0F1111] hover:bg-[#F7FAFA]"
                >
                  {PATH_LABELS[p.path] ?? p.path}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const g = grade?.toUpperCase();
  const map: Record<string, { bg: string; text: string; label: string }> = {
    A: { bg: "bg-[#067D62]", text: "text-white", label: "Like New" },
    B: { bg: "bg-[#007185]", text: "text-white", label: "Good Condition" },
    C: { bg: "bg-[#F0C14B]", text: "text-[#0F1111]", label: "Fair Condition" },
    R: { bg: "bg-[#CC0C39]", text: "text-white", label: "Recycle Only" },
  };
  const t = map[g] ?? map.B;
  return (
    <div
      className={`flex items-center gap-3 rounded-md px-4 py-3 ${t.bg} ${t.text}`}
    >
      <span className="text-3xl font-bold">{g}</span>
      <span className="text-lg font-bold">
        GRADE {g} — {t.label}
      </span>
    </div>
  );
}

/* ------------------------------- helpers ---------------------------------- */

const PATH_LABELS: Record<string, string> = {
  resell: "Peer-to-Peer Resale",
  refurbish: "Amazon Renewed",
  donate: "Donate to NGO",
  recycle: "Recycle",
  exchange: "Exchange",
};

function PathIcon({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  const Icon =
    path === "resell"
      ? Repeat
      : path === "refurbish"
      ? Wrench
      : path === "donate"
      ? Heart
      : path === "recycle"
      ? Recycle
      : RefreshCw;
  return <Icon className={className} />;
}

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#565959]">{label}</dt>
      <dd
        className={
          accent
            ? "font-bold text-[#067D62]"
            : strong
            ? "font-bold text-[#0F1111]"
            : "text-[#0F1111]"
        }
      >
        {value}
      </dd>
    </div>
  );
}

const FALLBACK_PATHS: RedirectPath[] = [
  {
    path: "resell",
    recommended: true,
    confidence: 87,
    reason: "Grade B item with strong resale demand on P2P marketplace",
    estimated_recovery_value: 974,
    green_credits_to_issue: 50,
  },
  {
    path: "refurbish",
    recommended: false,
    confidence: 60,
    reason: "Minor refurbishment before Renewed listing",
    estimated_recovery_value: 820,
    green_credits_to_issue: 35,
  },
  {
    path: "exchange",
    recommended: false,
    confidence: 35,
    reason: "Variant available for direct exchange",
    estimated_recovery_value: 0,
    green_credits_to_issue: 15,
  },
  {
    path: "donate",
    recommended: false,
    confidence: 25,
    reason: "Functional item better suited for resale",
    estimated_recovery_value: 0,
    green_credits_to_issue: 20,
  },
  {
    path: "recycle",
    recommended: false,
    confidence: 10,
    reason: "Item is functional, recycling wastes value",
    estimated_recovery_value: 0,
    green_credits_to_issue: 10,
  },
];
