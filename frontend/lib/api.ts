import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/* ----------------------------- Response types ----------------------------- */

export interface PreventScore {
  keep_rate: number;
  top_reason: string;
  badge_color: "green" | "yellow" | "red" | string;
  recommendation: string;
}

export interface GradeResult {
  grade: string;
  reason: string;
  resale_pct: number;
  confidence: number;
}

export interface RedirectPath {
  path: "resell" | "refurbish" | "donate" | "recycle" | "exchange" | string;
  recommended: boolean;
  confidence: number;
  reason: string;
  estimated_recovery_value: number;
  green_credits_to_issue: number;
}

export interface CreditsResult {
  new_balance: number;
  message: string;
}

/* ------------------------------- API calls -------------------------------- */

/** Predictive return prevention — keep-rate score for a product. */
export async function getPreventScore(
  payload: Record<string, unknown> = {}
): Promise<PreventScore> {
  const { data } = await api.post<PreventScore>("/api/prevent/score", payload);
  return data;
}

/** Smart quality grading — grade a returned item from uploaded photos. */
export async function gradeItem(
  payload: FormData | Record<string, unknown> = {}
): Promise<GradeResult> {
  const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
  const { data } = await api.post<GradeResult>("/api/grade", payload, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
}

/** Return routing — ranked disposition paths for a returned item. */
export async function getRedirectPaths(
  payload: Record<string, unknown> = {}
): Promise<RedirectPath[]> {
  const { data } = await api.post<RedirectPath[]>("/api/redirect", payload);
  return data;
}

/** Green credits — issue rewards and fetch the updated balance. */
export async function issueCredits(
  payload: Record<string, unknown> = {}
): Promise<CreditsResult> {
  const { data } = await api.post<CreditsResult>("/api/credits/issue", payload);
  return data;
}
