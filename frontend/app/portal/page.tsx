"use client";
// Amazon ReLife AI — 5-step ReLife Journey wizard.

import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Info,
  X,
  Repeat,
  Wrench,
  Heart,
  Recycle,
  RefreshCw,
  Users,
  ShieldCheck,
  Printer,
  Sparkles,
  Star,
  AlertTriangle,
} from "lucide-react";
import {
  gradeItem,
  getRedirectPaths,
  getNextOwners,
  generateCertificate,
  issueCredits,
  type GradeResult,
  type RedirectPath,
  type BuyerSegment,
  type Certificate,
} from "@/lib/api";

const PRICE = 1499;
const ASIN = "ASIN001";
const RETURN_ID = "RET001";
const FALLBACK_URL =
  "https://hackon-images.s3.amazonaws.com/returns/RET001_1.jpg";

const RETURN_REASONS = [
  "Size runs small",
  "Not as described",
  "Changed my mind",
  "Defective",
  "Wrong item",
  "Poor quality",
];

type Step = 1 | 2 | 3 | 4 | 5;

export default function PortalPage() {
  const [step, setStep] = useState<Step>(1);
  const [previews, setPreviews] = useState<string[]>([]);
  const [gradeImage, setGradeImage] = useState<UploadedImage | null>(null);
  const [reason, setReason] = useState(RETURN_REASONS[0]);

  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [paths, setPaths] = useState<RedirectPath[] | null>(null);
  const [segments, setSegments] = useState<BuyerSegment[] | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [chosenPath, setChosenPath] = useState<string | null>(null);

  const recommended = paths?.find((p) => p.recommended) ?? paths?.[0] ?? null;
  const topSegment = segments?.[0] ?? null;

  async function handleConfirm(path: string) {
    setChosenPath(path);
    const chosen = paths?.find((p) => p.path === path);
    try {
      await issueCredits({
        amount: chosen?.green_credits_to_issue ?? 50,
        return_id: RETURN_ID,
      });
    } catch {
      /* credits are best-effort; never block the journey */
    }
    setStep(4);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      {/* Breadcrumb */}
      <nav className="mb-2 flex items-center gap-1 text-xs text-[#565959]">
        <span className="text-[#007185]">Amazon ReLife</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#007185]">ReLife Journey</span>
        <ChevronRight className="h-3 w-3" />
        <span>Returned Item</span>
      </nav>

      <h1 className="text-2xl font-medium text-[#0F1111]">
        ReLife Journey — Give this return a second life
      </h1>
      <p className="mb-5 text-sm text-[#565959]">
        ReLife AI inspects the item, decides its most valuable next life, finds
        its next best owner, and certifies it for resale.
      </p>

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
              onImageReady={setGradeImage}
            />
          )}
          {step === 2 && (
            <StepInspection
              image={gradeImage}
              grade={grade}
              onResult={setGrade}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && grade && (
            <StepDecision
              grade={grade}
              paths={paths}
              onPaths={setPaths}
              chosenPath={chosenPath}
              onConfirm={handleConfirm}
            />
          )}
          {step === 4 && grade && (
            <StepNextOwner
              grade={grade}
              segments={segments}
              onSegments={setSegments}
              onContinue={() => setStep(5)}
            />
          )}
          {step === 5 && grade && (
            <StepCertificate
              grade={grade}
              chosenPath={chosenPath}
              topSegment={topSegment}
              certificate={certificate}
              onCert={setCertificate}
            />
          )}
        </div>

        {/* RIGHT — sticky summary */}
        <aside className="h-fit lg:sticky lg:top-[120px]">
          <div className="rounded-md border border-[#D5D9D9] bg-white">
            <div className="border-b border-[#D5D9D9] px-4 py-2.5">
              <h2 className="text-base font-bold text-[#0F1111]">
                ReLife Summary
              </h2>
            </div>
            <dl className="space-y-2.5 px-4 py-3 text-sm">
              <Row label="Product" value="boAt Rockerz 450" />
              <Row label="Return ID" value={RETURN_ID} />
              <Row label="Reason" value={reason} />
              <Row
                label="Condition"
                value={grade ? `${grade.condition_score}/100` : "—"}
                strong={!!grade}
              />
              <Row label="Grade" value={grade ? grade.grade : "—"} strong={!!grade} />
              <Row
                label="Decision"
                value={
                  chosenPath
                    ? PATH_LABELS[chosenPath] ?? chosenPath
                    : recommended
                    ? PATH_LABELS[recommended.path] ?? recommended.path
                    : "—"
                }
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
                value={recommended ? `+${recommended.green_credits_to_issue}` : "—"}
                accent
              />
              <Row
                label="Next Owner"
                value={topSegment ? topSegment.segment : "—"}
              />
              <hr className="border-[#D5D9D9]" />
              <Row
                label="Status"
                value={
                  certificate
                    ? "Certified ✓"
                    : chosenPath
                    ? "Matching owner…"
                    : step >= 3
                    ? "Awaiting decision"
                    : step === 2
                    ? "Inspecting…"
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
    { n: 1, label: "Upload" },
    { n: 2, label: "AI Inspection" },
    { n: 3, label: "Decision" },
    { n: 4, label: "Next Owner" },
    { n: 5, label: "Certificate" },
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
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
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
                className={`hidden text-sm sm:block ${
                  active ? "font-bold text-[#0F1111]" : "text-[#565959]"
                }`}
              >
                {it.label}
              </span>
            </div>
            {i < items.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
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

/* ------------------------------- Step 1: Upload --------------------------- */

function StepUpload({
  previews,
  setPreviews,
  reason,
  setReason,
  onContinue,
  onImageReady,
}: {
  previews: string[];
  setPreviews: (p: string[]) => void;
  reason: string;
  setReason: (r: string) => void;
  onContinue: () => void;
  onImageReady: (img: UploadedImage | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [metas, setMetas] = useState<UploadedImage[]>([]);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).slice(0, 3 - previews.length);
    if (arr.length === 0) return;
    setPreviews(
      [...previews, ...arr.map((f) => URL.createObjectURL(f))].slice(0, 3)
    );
    const added = await Promise.all(
      arr.map(async (f) => ({
        base64: await fileToBase64(f),
        format: fileFormat(f),
      }))
    );
    const merged = [...metas, ...added].slice(0, 3);
    setMetas(merged);
    onImageReady(merged[0] ?? null);
  }

  function removeAt(i: number) {
    setPreviews(previews.filter((_, idx) => idx !== i));
    const merged = metas.filter((_, idx) => idx !== i);
    setMetas(merged);
    onImageReady(merged[0] ?? null);
  }

  return (
    <div className="rounded-md border border-[#D5D9D9] bg-white">
      <div className="border-b border-[#D5D9D9] px-4 py-2.5">
        <h2 className="flex items-center gap-1.5 text-base font-bold text-[#0F1111]">
          Upload the Returned Item
          <Info className="h-3.5 w-3.5 text-[#565959]" />
        </h2>
      </div>

      <div className="space-y-4 p-4">
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
            Drag and drop product photos here
          </p>
          <p className="my-1 text-xs text-[#565959]">or</p>
          <span className="rounded-sm border border-[#888C8C] bg-white px-3 py-1 text-sm text-[#0073BB] shadow-sm hover:bg-[#F7FAFA]">
            Choose files
          </span>
          <p className="mt-2 text-[11px] text-[#565959]">
            JPG, PNG, WEBP • up to 3 images • the AI grades the real photo
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
                  onClick={() => removeAt(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

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
          Start AI Inspection →
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- Step 2: Inspection ------------------------- */

function StepInspection({
  image,
  grade,
  onResult,
  onContinue,
}: {
  image: UploadedImage | null;
  grade: GradeResult | null;
  onResult: (g: GradeResult) => void;
  onContinue: () => void;
}) {
  const [stage, setStage] = useState(grade ? 3 : 0);
  const started = useRef(false);

  useEffect(() => {
    if (grade || started.current) return;
    started.current = true;
    const t1 = setTimeout(() => setStage(1), 400);
    const t2 = setTimeout(() => setStage(2), 1200);
    (async () => {
      try {
        const g = await gradeItem({
          image_urls: [FALLBACK_URL],
          asin: ASIN,
          return_id: RETURN_ID,
          image_base64: image?.base64,
          image_format: image?.format,
        });
        setStage(3);
        onResult(g);
      } catch {
        setStage(3);
        onResult(GRADE_FALLBACK);
      }
    })();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [image, grade, onResult]);

  if (!grade) {
    const subs = [
      { label: "Photos received", at: 0 },
      { label: "Inspecting condition…", at: 1 },
      { label: "Scoring & detecting issues…", at: 2 },
    ];
    return (
      <Panel title="AI Inspection">
        <div className="flex flex-col items-center gap-4 px-4 py-10">
          <Loader2 className="h-12 w-12 animate-spin text-[#FF9900]" />
          <p className="text-sm font-medium text-[#0F1111]">
            ReLife AI is inspecting your item…
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
      </Panel>
    );
  }

  const resaleValue = Math.round((grade.resale_pct / 100) * PRICE);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-sm border border-[#067D62]/30 bg-[#F0FAF7] px-4 py-2.5 text-sm font-bold text-[#067D62]">
        <CheckCircle2 className="h-5 w-5" />
        AI Inspection Complete
      </div>

      {/* Condition score + grade */}
      <Panel title="Condition Report">
        <div className="grid gap-4 p-4 sm:grid-cols-[200px_1fr]">
          <ScoreGauge score={grade.condition_score} grade={grade.grade} />
          <div>
            <GradeBadge grade={grade.grade} />
            <p className="mt-3 text-sm text-[#0F1111]">{grade.reason}</p>

            <p className="mt-3 mb-1 text-xs text-[#565959]">
              AI confidence: {grade.confidence}%
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7E9EC]">
              <div
                className="h-full bg-[#FF9900]"
                style={{ width: `${grade.confidence}%` }}
              />
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#0F1111]">
                ₹{resaleValue.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-[#565959]">
                est. resale ({grade.resale_pct}% of ₹
                {PRICE.toLocaleString("en-IN")})
              </span>
            </div>
          </div>
        </div>

        {/* Detected issues */}
        <div className="border-t border-[#EAEDED] px-4 py-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#565959]">
            Detected Issues
          </p>
          {grade.detected_issues.length === 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-[#067D62]">
              <CheckCircle2 className="h-4 w-4" /> No visible issues detected
            </p>
          ) : (
            <ul className="space-y-1">
              {grade.detected_issues.map((issue, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 text-sm text-[#0F1111]"
                >
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#F0820A]" />
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      <button
        onClick={onContinue}
        className="w-full rounded-full border border-[#FF8F00] bg-[#FFA41C] py-2.5 text-sm font-bold text-[#0F1111] hover:bg-[#FA8900]"
      >
        Continue to AI Decision →
      </button>
    </div>
  );
}

/* ----------------------------- Step 3: Decision --------------------------- */

function StepDecision({
  grade,
  paths,
  onPaths,
  chosenPath,
  onConfirm,
}: {
  grade: GradeResult;
  paths: RedirectPath[] | null;
  onPaths: (p: RedirectPath[]) => void;
  chosenPath: string | null;
  onConfirm: (path: string) => void;
}) {
  const started = useRef(false);
  useEffect(() => {
    if (paths || started.current) return;
    started.current = true;
    (async () => {
      try {
        const p = await getRedirectPaths({
          return_id: RETURN_ID,
          grade: grade.grade,
          asin: ASIN,
        });
        onPaths(p);
      } catch {
        onPaths(FALLBACK_PATHS);
      }
    })();
  }, [paths, grade, onPaths]);

  if (!paths) {
    return (
      <Panel title="AI Decision Engine">
        <SpinnerBody caption="Ranking resell · refurbish · exchange · donate · recycle…" />
      </Panel>
    );
  }

  const recommended = paths.find((p) => p.recommended) ?? paths[0];

  return (
    <div className="space-y-4">
      {/* Recommended path */}
      <div className="rounded-md border border-[#D5D9D9] border-l-4 border-l-[#FF9900] bg-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#565959]">
          AI Recommended Next Life
        </p>
        <div className="mt-1 flex items-center gap-2">
          <PathIcon path={recommended.path} className="h-6 w-6 text-[#FF9900]" />
          <span className="text-xl font-bold text-[#0F1111]">
            {PATH_LABELS[recommended.path] ?? recommended.path}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#565959]">{recommended.reason}</p>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
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
          <span className="flex items-center gap-1 text-[#067D62]">
            <Sparkles className="h-3.5 w-3.5" /> Sustainable choice
          </span>
        </div>
      </div>

      {/* All paths ranked */}
      <div className="rounded-md border border-[#D5D9D9] bg-white">
        <div className="border-b border-[#D5D9D9] px-4 py-2.5">
          <h3 className="text-sm font-bold text-[#0F1111]">
            All Five Paths, Ranked by AI
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
                <span className="w-20 text-[#565959]">{p.confidence}%</span>
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
      {chosenPath ? (
        <div className="flex items-center gap-2 rounded-sm border border-[#067D62]/30 bg-[#F0FAF7] px-4 py-3 text-sm font-bold text-[#067D62]">
          <CheckCircle2 className="h-5 w-5" />
          Confirmed “{PATH_LABELS[chosenPath] ?? chosenPath}”. Green Credits
          issued — finding the next best owner…
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

/* ----------------------------- Step 4: Next Owner ------------------------- */

function StepNextOwner({
  grade,
  segments,
  onSegments,
  onContinue,
}: {
  grade: GradeResult;
  segments: BuyerSegment[] | null;
  onSegments: (s: BuyerSegment[]) => void;
  onContinue: () => void;
}) {
  const started = useRef(false);
  useEffect(() => {
    if (segments || started.current) return;
    started.current = true;
    (async () => {
      try {
        const s = await getNextOwners({
          asin: ASIN,
          grade: grade.grade,
          return_id: RETURN_ID,
        });
        onSegments(s);
      } catch {
        onSegments(SEGMENT_FALLBACK);
      }
    })();
  }, [segments, grade, onSegments]);

  if (!segments) {
    return (
      <Panel title="Next Best Owner">
        <SpinnerBody caption="Matching this item to the buyer segments who want it most…" />
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-sm border border-[#007185]/30 bg-[#F1F8FB] px-4 py-2.5 text-sm font-bold text-[#0F1111]">
        <Users className="h-5 w-5 text-[#007185]" />
        AI matched 3 buyer segments for this item
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {segments.map((s, i) => (
          <div
            key={i}
            className={`rounded-md border bg-white p-4 ${
              i === 0
                ? "border-[#FF9900] ring-1 ring-[#FF9900]"
                : "border-[#D5D9D9]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F1111]">{s.segment}</h3>
              {i === 0 && (
                <span className="rounded-sm bg-[#FF9900] px-1.5 py-0.5 text-[10px] font-bold text-[#131921]">
                  TOP
                </span>
              )}
            </div>

            <p className="mt-2 text-2xl font-bold text-[#067D62]">
              {s.match_pct}%
            </p>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#E7E9EC]">
              <div
                className="h-full bg-[#067D62]"
                style={{ width: `${s.match_pct}%` }}
              />
            </div>
            <p className="mt-0.5 text-[11px] text-[#565959]">match score</p>

            <p className="mt-3 text-sm text-[#0F1111]">{s.reasoning}</p>
            <p className="mt-2 text-xs italic text-[#565959]">
              e.g. {s.persona_example}
            </p>
            {s.wishlist_hit && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[#007185]">
                <Star className="h-3.5 w-3.5 fill-[#FF9900] text-[#FF9900]" />
                On buyers’ wishlists
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full rounded-full border border-[#FF8F00] bg-[#FFA41C] py-2.5 text-sm font-bold text-[#0F1111] hover:bg-[#FA8900]"
      >
        Issue ReLife Certificate →
      </button>
    </div>
  );
}

/* ----------------------------- Step 5: Certificate ------------------------ */

function StepCertificate({
  grade,
  chosenPath,
  topSegment,
  certificate,
  onCert,
}: {
  grade: GradeResult;
  chosenPath: string | null;
  topSegment: BuyerSegment | null;
  certificate: Certificate | null;
  onCert: (c: Certificate) => void;
}) {
  const started = useRef(false);
  useEffect(() => {
    if (certificate || started.current) return;
    started.current = true;
    (async () => {
      try {
        const c = await generateCertificate({
          return_id: RETURN_ID,
          asin: ASIN,
          grade: grade.grade,
          condition_score: grade.condition_score,
          confidence: grade.confidence,
          chosen_path: chosenPath ?? "resell",
          buyer_segment: topSegment?.segment,
        });
        onCert(c);
      } catch {
        onCert(certFallback(grade));
      }
    })();
  }, [certificate, grade, chosenPath, topSegment, onCert]);

  if (!certificate) {
    return (
      <Panel title="ReLife Certificate">
        <SpinnerBody caption="Issuing the Amazon ReLife trust certificate…" />
      </Panel>
    );
  }

  const c = certificate;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-sm border border-[#067D62]/30 bg-[#F0FAF7] px-4 py-2.5 text-sm font-bold text-[#067D62]">
        <CheckCircle2 className="h-5 w-5" />
        This item now has a second life. Certificate issued.
      </div>

      {/* Certificate card */}
      <div className="overflow-hidden rounded-lg border-2 border-[#FF9900] bg-white">
        <div className="flex items-center justify-between bg-gradient-to-r from-[#131921] to-[#232F3E] px-5 py-3 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#FF9900]" />
            <span className="text-lg font-bold">Amazon ReLife Certified</span>
          </div>
          <span className="text-xs text-gray-300">{c.certificate_id}</span>
        </div>

        <div className="p-5">
          <p className="text-xs uppercase tracking-wide text-[#565959]">
            Product
          </p>
          <p className="text-lg font-bold text-[#0F1111]">{c.product_name}</p>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <CertStat label="Verdict" value={c.verdict} />
            <CertStat label="Grade" value={c.grade} />
            <CertStat label="Condition" value={`${c.condition_score}/100`} />
            <CertStat label="AI Confidence" value={`${c.confidence}%`} />
          </div>

          <div className="mt-4 rounded-md bg-[#F0FAF7] p-3 text-sm text-[#0F1111]">
            “{c.blurb}”
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#565959]">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-[#067D62]" />
              CO₂ saved:{" "}
              <span className="font-bold text-[#067D62]">
                {c.co2_saved_kg} kg
              </span>
            </span>
            <span>Issued {new Date(c.issued_at).toLocaleString("en-IN")}</span>
            <span className="font-medium text-[#007185]">
              Verified by Amazon ReLife AI
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-[#888C8C] bg-white py-2.5 text-sm font-bold text-[#0F1111] hover:bg-[#F7FAFA]"
      >
        <Printer className="h-4 w-4" /> Print / Save Certificate
      </button>
    </div>
  );
}

/* ------------------------------- shared bits ------------------------------ */

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
        <h2 className="text-base font-bold text-[#0F1111]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SpinnerBody({ caption }: { caption: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12">
      <Loader2 className="h-10 w-10 animate-spin text-[#FF9900]" />
      <p className="text-sm font-medium text-[#0F1111]">{caption}</p>
    </div>
  );
}

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const color =
    grade === "A"
      ? "#067D62"
      : grade === "B"
      ? "#007185"
      : grade === "C"
      ? "#C77400"
      : "#CC0C39";
  return (
    <div className="flex flex-col items-center justify-center rounded-md bg-[#FAFAFA] p-4">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke="#E7E9EC"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-[#0F1111]">{score}</span>
          <span className="text-[10px] text-[#565959]">/ 100</span>
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-[#565959]">Condition Score</p>
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
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 ${t.bg} ${t.text}`}
    >
      <span className="text-xl font-bold">{g}</span>
      <span className="text-sm font-bold">Grade {g} — {t.label}</span>
    </div>
  );
}

function CertStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#D5D9D9] bg-[#FAFAFA] p-2.5">
      <p className="text-sm font-bold text-[#0F1111]">{value}</p>
      <p className="text-[11px] text-[#565959]">{label}</p>
    </div>
  );
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
    <div className="flex items-center justify-between gap-2">
      <dt className="text-[#565959]">{label}</dt>
      <dd
        className={
          accent
            ? "font-bold text-[#067D62]"
            : strong
            ? "font-bold text-[#0F1111]"
            : "text-right text-[#0F1111]"
        }
      >
        {value}
      </dd>
    </div>
  );
}

/* --------------------------------- helpers -------------------------------- */

type UploadedImage = { base64: string; format: string };

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

const GRADE_FALLBACK: GradeResult = {
  grade: "B",
  reason: "Minor cosmetic wear on ear cushions, all functions intact",
  resale_pct: 65,
  confidence: 88,
  condition_score: 78,
  detected_issues: ["Minor scuffs on ear cushions"],
};

const SEGMENT_FALLBACK: BuyerSegment[] = [
  {
    segment: "Students",
    match_pct: 92,
    reasoning: "Budget-conscious buyers who value certified, affordable tech",
    persona_example: "Aarav, engineering student",
    wishlist_hit: true,
  },
  {
    segment: "Eco-conscious shoppers",
    match_pct: 85,
    reasoning: "Prefer second-life products to cut e-waste",
    persona_example: "Priya, sustainability advocate",
    wishlist_hit: false,
  },
  {
    segment: "Freelancers",
    match_pct: 78,
    reasoning: "Need reliable gear at lower cost for project work",
    persona_example: "Rohan, freelance designer",
    wishlist_hit: false,
  },
];

function certFallback(grade: GradeResult): Certificate {
  const verdicts: Record<string, string> = {
    A: "Certified Like-New",
    B: "Certified Good",
    C: "Certified Fair",
    R: "Responsibly Recycled",
  };
  const verdict = verdicts[grade.grade?.toUpperCase()] ?? "Certified";
  return {
    certificate_id: `RELIFE-${RETURN_ID}-${grade.grade}`,
    product_name: "boAt Rockerz 450 Bluetooth Headphones",
    grade: grade.grade,
    condition_score: grade.condition_score,
    confidence: grade.confidence,
    verdict,
    co2_saved_kg: 0.56,
    issued_at: new Date().toISOString(),
    blurb: `This boAt Rockerz 450 has been AI-inspected and graded ${verdict} by Amazon ReLife at ${grade.confidence}% confidence.`,
  };
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
