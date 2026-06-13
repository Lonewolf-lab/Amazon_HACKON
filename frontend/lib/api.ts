import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/* --------------------------- Demo constants ------------------------------- */
/* The backend is seeded with ASIN001–ASIN050, USER001–USER010, RET001…       */
/* Screens use these defaults so calls match the live DynamoDB data.          */

export const DEMO_ASIN = "ASIN001";
export const DEMO_USER_ID = "USER001";
export const DEMO_RETURN_ID = "RET001";

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

/* ------------------------------ Request types ----------------------------- */

export interface PreventParams {
  asin?: string;
  user_id?: string;
}

export interface GradePayload {
  image_urls: string[];
  asin?: string;
  return_id?: string;
}

export interface RedirectPayload {
  return_id?: string;
  grade: string;
  asin?: string;
}

export interface CreditsPayload {
  user_id?: string;
  amount: number;
  return_id?: string;
}

/* ------------------------------- API calls -------------------------------- */

/**
 * Predictive return prevention — keep-rate score for a product.
 * Backend reads `asin` + `user_id` as query params (GET/POST).
 */
export async function getPreventScore(
  params: PreventParams = {}
): Promise<PreventScore> {
  const { data } = await api.get<PreventScore>("/api/prevent/score", {
    params: {
      asin: params.asin ?? DEMO_ASIN,
      user_id: params.user_id ?? DEMO_USER_ID,
    },
  });
  return data;
}

/**
 * Smart quality grading — grade a returned item.
 * Backend expects JSON `{ image_urls[], asin, return_id }`. There is no S3
 * upload yet, so image URLs are passed through (the model reads them as text).
 */
export async function gradeItem(payload: GradePayload): Promise<GradeResult> {
  const { data } = await api.post<GradeResult>("/api/grade", {
    image_urls: payload.image_urls,
    asin: payload.asin ?? DEMO_ASIN,
    return_id: payload.return_id ?? DEMO_RETURN_ID,
  });
  return data;
}

/**
 * Return routing — ranked disposition paths for a returned item.
 * Backend expects JSON `{ return_id, grade, asin }`; grade comes from gradeItem.
 */
export async function getRedirectPaths(
  payload: RedirectPayload
): Promise<RedirectPath[]> {
  const { data } = await api.post<RedirectPath[]>("/api/redirect", {
    return_id: payload.return_id ?? DEMO_RETURN_ID,
    grade: payload.grade,
    asin: payload.asin ?? DEMO_ASIN,
  });
  return data;
}

/**
 * Green credits — issue rewards and fetch the updated balance.
 * Backend expects JSON `{ user_id, amount, return_id }`.
 */
export async function issueCredits(
  payload: CreditsPayload
): Promise<CreditsResult> {
  const { data } = await api.post<CreditsResult>("/api/credits/issue", {
    user_id: payload.user_id ?? DEMO_USER_ID,
    amount: payload.amount,
    return_id: payload.return_id ?? DEMO_RETURN_ID,
  });
  return data;
}
