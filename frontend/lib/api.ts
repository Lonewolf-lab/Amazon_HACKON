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
  condition_score: number;
  detected_issues: string[];
}

export interface BuyerSegment {
  segment: string;
  match_pct: number;
  reasoning: string;
  persona_example: string;
  wishlist_hit: boolean;
}

export interface Certificate {
  certificate_id: string;
  product_name: string;
  grade: string;
  condition_score: number;
  confidence: number;
  verdict: string;
  co2_saved_kg: number;
  issued_at: string;
  blurb: string;
}

export interface TradeInResult {
  condition_grade: string;
  trade_in_value_inr: number;
  upgrade_name: string;
  upgrade_reason: string;
  instant_credit: number;
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
  /** Base64 of the uploaded photo (no data: prefix) → real multimodal grading. */
  image_base64?: string;
  /** Image format: png | jpeg | gif | webp. Defaults to jpeg server-side. */
  image_format?: string;
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
  reason?: string;
}

export interface CreditTxn {
  txn_id: string;
  type: "credit" | "debit" | string;
  amount: number;
  reason: string;
  balance_after: number;
  created_at: string;
  ref?: string;
}

export interface CreditLedger {
  balance: number;
  transactions: CreditTxn[];
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
    image_base64: payload.image_base64,
    image_format: payload.image_format,
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
    reason: payload.reason,
  });
  return data;
}

/** Green credits — full balance + transaction ledger for a user. */
export async function getCreditLedger(
  userId: string = DEMO_USER_ID
): Promise<CreditLedger> {
  const { data } = await api.get<CreditLedger>("/api/credits/ledger", {
    params: { user_id: userId },
  });
  return data;
}

/** Green credits — redeem (debit) credits for a reward. */
export async function redeemCredits(payload: {
  user_id?: string;
  amount: number;
  reward: string;
}): Promise<{ ok: boolean; new_balance: number; message: string }> {
  const { data } = await api.post("/api/credits/redeem", {
    user_id: payload.user_id ?? DEMO_USER_ID,
    amount: payload.amount,
    reward: payload.reward,
  });
  return data;
}

/**
 * Next Best Owner — ranked buyer segments for a second-life item.
 * Backend expects JSON `{ asin, grade, return_id }` (Nova Pro).
 */
export async function getNextOwners(payload: {
  asin?: string;
  grade: string;
  return_id?: string;
}): Promise<BuyerSegment[]> {
  const { data } = await api.post<BuyerSegment[]>("/api/next-owner", {
    asin: payload.asin ?? DEMO_ASIN,
    grade: payload.grade,
    return_id: payload.return_id ?? DEMO_RETURN_ID,
  });
  return data;
}

/**
 * ReLife Trust Certificate — generate the certificate for a graded item.
 * Backend expects JSON `{ return_id, asin, grade, condition_score, confidence, chosen_path, buyer_segment? }`.
 */
export async function generateCertificate(payload: {
  return_id?: string;
  asin?: string;
  grade: string;
  condition_score: number;
  confidence: number;
  chosen_path: string;
  buyer_segment?: string;
}): Promise<Certificate> {
  const { data } = await api.post<Certificate>("/api/certificate", {
    return_id: payload.return_id ?? DEMO_RETURN_ID,
    asin: payload.asin ?? DEMO_ASIN,
    grade: payload.grade,
    condition_score: payload.condition_score,
    confidence: payload.confidence,
    chosen_path: payload.chosen_path,
    buyer_segment: payload.buyer_segment,
  });
  return data;
}

/* ------------------------- ReLife Journey records ------------------------- */

export interface JourneyRecord {
  return_id: string;
  asin: string;
  product_name: string;
  reason: string;
  grade: string;
  condition_score: number;
  confidence: number;
  detected_issues: string[];
  chosen_path: string;
  disposition: string;
  recovery_value: number;
  green_credits: number;
  status: string; // "in_refurbishment" | "completed" | "refurbished_listed"
  created_at: string;
  image_format?: string;
  image_key?: string; // S3 object key (new storage path)
  image_url?: string; // pre-signed S3 URL (detail endpoint, when image_key set)
  image_base64?: string; // legacy inline photo (detail endpoint, older records)
}

/** Persist a finished ReLife Journey (powers the admin dashboard). */
export async function completeJourney(payload: {
  return_id: string;
  asin?: string;
  product_name: string;
  reason: string;
  grade: string;
  condition_score: number;
  confidence: number;
  detected_issues: string[];
  chosen_path: string;
  disposition: string;
  recovery_value: number;
  green_credits: number;
  image_base64?: string;
  image_format?: string;
}): Promise<JourneyRecord> {
  const { data } = await api.post<JourneyRecord>("/api/journey/complete", {
    ...payload,
    asin: payload.asin ?? DEMO_ASIN,
  });
  return data;
}

/** All AI decisions, newest first (no image payload). */
export async function getJourneyList(): Promise<JourneyRecord[]> {
  const { data } = await api.get<JourneyRecord[]>("/api/journey/list");
  return data;
}

/** Full record for one decision, including the uploaded photo. */
export async function getJourneyDetail(
  returnId: string
): Promise<JourneyRecord> {
  const { data } = await api.get<JourneyRecord>(
    `/api/journey/${encodeURIComponent(returnId)}`
  );
  return data;
}

/** Warehouse marks a refurbishment complete → item becomes listed. */
export async function completeRefurbishment(
  returnId: string
): Promise<{ ok: boolean; return_id: string; status?: string }> {
  const { data } = await api.post("/api/journey/refurbish-complete", {
    return_id: returnId,
  });
  return data;
}

/**
 * Smart Trade-In — grade a customer's own gadget and suggest an upgrade.
 * Backend expects JSON `{ category, image_base64?, image_format?, model_hint? }`.
 */
export async function tradeIn(payload: {
  category?: string;
  image_base64?: string;
  image_format?: string;
  model_hint?: string;
}): Promise<TradeInResult> {
  const { data } = await api.post<TradeInResult>("/api/tradein", {
    category: payload.category ?? "electronics",
    image_base64: payload.image_base64,
    image_format: payload.image_format,
    model_hint: payload.model_hint,
  });
  return data;
}

/* --------------------------- ReLife Marketplace --------------------------- */

export interface MarketplaceListing {
  id: string;
  name: string;
  category: string;
  grade: string;
  original: number;
  price: number;
  condition_score: number;
  disposition: string;
  created_at?: string;
}

/**
 * Backend-persisted marketplace listings, derived from journey records in
 * DynamoDB (resell = listed immediately; refurbish = listed once completed).
 * This is the cross-device source of truth, replacing localStorage-only listings.
 */
export async function getMarketplace(): Promise<MarketplaceListing[]> {
  const { data } = await api.get<MarketplaceListing[]>("/api/marketplace");
  return data;
}
