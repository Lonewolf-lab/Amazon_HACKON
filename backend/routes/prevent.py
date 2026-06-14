"""Predictive Return Prevention — Bedrock Nova Lite.

Two things in one call:
1. Keep-rate scoring for the product (the green/yellow/red badge).
2. Personalized RIGHT-SIZING: compares the product against how THIS shopper
   actually uses their devices (their usage_profile) and, if the item is
   overkill, recommends a cheaper certified-refurbished alternative + the ₹
   savings — which is what prevents the future return.

Everything is wrapped so it can never crash the request (safe fallbacks + a
deterministic heuristic right-size fallback if Bedrock is unavailable).
"""
from typing import List, Optional

from boto3.dynamodb.conditions import Attr
from fastapi import APIRouter
from pydantic import BaseModel

from ._aws import (
    TABLE_PRODUCTS,
    TABLE_USERS,
    converse_text,
    get_dynamodb,
    get_item,
    parse_model_json,
)

router = APIRouter(prefix="/prevent", tags=["prevent"])

NOVA_LITE = "amazon.nova-lite-v1:0"

# Profile keywords that justify a high-end device (so it's NOT overkill).
POWER_KEYWORDS = (
    "gaming", "game", "editing", "render", "3d", "stream", "production",
    "developer", "engineering", "design", "professional",
)


class Alternative(BaseModel):
    asin: str
    name: str
    refurbished_price: int
    condition: str = "Refurbished"


class PreventResponse(BaseModel):
    keep_rate: int
    top_reason: str
    badge_color: str
    recommendation: str
    # product info (lets the frontend render any product's header)
    product_name: str = ""
    price_inr: int = 0
    category: str = ""
    # personalized right-sizing
    usage_profile: List[str] = []
    needs_fit: str = "good_fit"  # good_fit | overkill | underpowered
    recommended_alternative: Optional[Alternative] = None
    potential_savings_inr: int = 0
    right_size_reason: str = ""


def _to_int(v, default: int = 0) -> int:
    try:
        return int(v)
    except Exception:  # noqa: BLE001
        return default


def _cheaper_candidates(category: str, max_price: int, limit: int = 6) -> list:
    """Same-category products priced below the viewed item (fail-soft)."""
    try:
        resp = get_dynamodb().Table(TABLE_PRODUCTS).scan(
            FilterExpression=Attr("category").eq(category)
        )
        cands = []
        for p in resp.get("Items", []):
            price = _to_int(p.get("price_inr"))
            if 0 < price < max_price:
                cands.append(
                    {"asin": p.get("asin"), "name": p.get("product_name", "Unknown"), "price": price}
                )
        cands.sort(key=lambda c: c["price"], reverse=True)  # closest-below first
        return cands[:limit]
    except Exception as exc:  # noqa: BLE001
        print(f"[prevent] candidate scan failed: {exc}")
        return []


def _right_size(product: dict, profile: List[str], price: int) -> dict:
    """Return {needs_fit, alternative(dict|None), reason}. Never raises."""
    category = product.get("category", "")
    candidates = _cheaper_candidates(category, price)

    # Nothing cheaper, or we don't know the shopper → treat as a good fit.
    if not candidates or not profile:
        return {"needs_fit": "good_fit", "alternative": None, "reason": ""}

    cand_lines = "\n".join(
        f"- {c['asin']}: {c['name']} (₹{c['price']})" for c in candidates
    )
    prompt = f"""You are a purchase right-sizing advisor for Amazon India.
Decide whether this product is a good fit for THIS shopper, or overkill (more
expensive/powerful than their actual usage needs).

Product: {product.get("product_name", "Unknown")} ({category}), price ₹{price}
Shopper's typical usage: {", ".join(profile)}

Cheaper certified-refurbished alternatives available (same category):
{cand_lines}

Return JSON only. No markdown. Keys:
- needs_fit: "good_fit" | "overkill" | "underpowered"
- alternative_asin: an ASIN from the list above that better fits the shopper, or "none"
- reason: string, max 18 words explaining the fit verdict"""

    try:
        data = parse_model_json(converse_text(NOVA_LITE, prompt))
        fit = str(data.get("needs_fit", "good_fit")).lower()
        alt_asin = str(data.get("alternative_asin", "none"))
        reason = str(data.get("reason", ""))[:160]
        if fit == "overkill" and alt_asin != "none":
            chosen = next((c for c in candidates if c["asin"] == alt_asin), None)
            if chosen:
                return {"needs_fit": "overkill", "alternative": chosen, "reason": reason}
        return {"needs_fit": fit if fit in ("good_fit", "overkill", "underpowered") else "good_fit",
                "alternative": None, "reason": reason}
    except Exception as exc:  # noqa: BLE001
        print(f"[prevent] right-size model failed, heuristic fallback: {exc}")
        # Deterministic fallback: a budget/casual shopper looking at a pricey
        # device with no power-use keywords → overkill, suggest the closest-below.
        profile_text = " ".join(profile).lower()
        powery = any(k in profile_text for k in POWER_KEYWORDS)
        if not powery and price >= 40000 and candidates:
            return {"needs_fit": "overkill", "alternative": candidates[0],
                    "reason": "Your usage is light — a refurbished model covers it for far less."}
        return {"needs_fit": "good_fit", "alternative": None, "reason": ""}


@router.api_route("/score", methods=["GET", "POST"], response_model=PreventResponse)
def score(asin: str, user_id: str):
    product = get_item(TABLE_PRODUCTS, {"asin": asin})

    # No product history → safe default (still returns a renderable shape).
    if not product:
        return PreventResponse(
            keep_rate=75,
            top_reason="Insufficient data",
            badge_color="green",
            recommendation="This product has limited return history",
            product_name="This product",
        )

    user = get_item(TABLE_USERS, {"user_id": user_id}) or {}
    profile = user.get("usage_profile") or []
    if not isinstance(profile, (list, tuple)):
        profile = [str(profile)]
    profile = [str(p) for p in profile]

    price = _to_int(product.get("price_inr"))
    category = product.get("category", "Unknown")

    top_reasons = product.get("top_return_reasons", "Unknown")
    if isinstance(top_reasons, (list, tuple)):
        top_reasons = ", ".join(str(r) for r in top_reasons)

    # ---- 1. Keep-rate badge (fail-soft) ----
    prompt = f"""You are a purchase-regret prediction engine for Amazon India.

Product: {product.get("product_name", "Unknown")} (ASIN: {asin})
Category: {category}
Average return rate: {product.get("avg_return_rate", 0)}%
Top return reasons: {top_reasons}
Current keep rate score: {product.get("keep_rate_score", "N/A")}
Price: ₹{price}
Buyer's typical usage: {", ".join(profile) if profile else "unknown"}

Return a JSON object only. No preamble. No markdown. Keys:
- keep_rate: integer 0-100 (probability buyer keeps this item)
- top_reason: string, max 8 words (most likely return reason)
- badge_color: "green" if keep_rate >= 70, "yellow" if 40-69, "red" if below 40
- recommendation: string, max 15 words (what to show buyer)"""

    try:
        data = parse_model_json(converse_text(NOVA_LITE, prompt))
        keep_rate = _to_int(data.get("keep_rate"), 72)
        top_reason = str(data.get("top_reason", "Size or fit mismatch"))
        badge_color = str(data.get("badge_color", "green"))
        recommendation = str(data.get("recommendation", "Check reviews before buying"))
    except Exception as exc:  # noqa: BLE001
        print(f"[prevent] keep-rate failed, using fallback: {exc}")
        keep_rate, top_reason = 72, "Size or fit mismatch"
        badge_color, recommendation = "green", "Check the size guide and reviews before buying"

    # ---- 2. Right-size recommendation (fail-soft) ----
    rs = _right_size(product, profile, price)
    alt = rs["alternative"]
    alternative = None
    savings = 0
    if alt:
        refurb_price = _to_int(alt.get("price"))
        savings = max(0, price - refurb_price)
        alternative = Alternative(
            asin=alt["asin"], name=alt["name"],
            refurbished_price=refurb_price, condition="Refurbished",
        )

    return PreventResponse(
        keep_rate=keep_rate,
        top_reason=top_reason,
        badge_color=badge_color,
        recommendation=recommendation,
        product_name=product.get("product_name", ""),
        price_inr=price,
        category=category,
        usage_profile=profile,
        needs_fit=rs["needs_fit"],
        recommended_alternative=alternative,
        potential_savings_inr=savings,
        right_size_reason=rs["reason"],
    )
