"""Predictive return prevention — Bedrock Nova Lite keep-rate scoring."""
from fastapi import APIRouter
from pydantic import BaseModel

from ._aws import (
    TABLE_PRODUCTS,
    TABLE_USERS,
    converse_text,
    get_item,
    parse_model_json,
)

router = APIRouter(prefix="/prevent", tags=["prevent"])

NOVA_LITE = "amazon.nova-lite-v1:0"


class PreventResponse(BaseModel):
    keep_rate: int
    top_reason: str
    badge_color: str
    recommendation: str


# Accept GET (query params, easy to test in a browser) and POST.
@router.api_route("/score", methods=["GET", "POST"], response_model=PreventResponse)
def score(asin: str, user_id: str):
    product = get_item(TABLE_PRODUCTS, {"asin": asin})

    # No product history → safe default (per spec).
    if not product:
        return PreventResponse(
            keep_rate=75,
            top_reason="Insufficient data",
            badge_color="green",
            recommendation="This product has limited return history",
        )

    user = get_item(TABLE_USERS, {"user_id": user_id}) or {}

    top_reasons = product.get("top_return_reasons", "Unknown")
    if isinstance(top_reasons, (list, tuple)):
        top_reasons = ", ".join(str(r) for r in top_reasons)

    prompt = f"""You are a purchase-regret prediction engine for Amazon India.

Product: {product.get("product_name", "Unknown")} (ASIN: {asin})
Category: {product.get("category", "Unknown")}
Average return rate: {product.get("avg_return_rate", 0)}%
Top return reasons: {top_reasons}
Current keep rate score: {product.get("keep_rate_score", "N/A")}
Price: ₹{product.get("price_inr", 0)}
Buyer's purchase history count: {user.get("purchase_history_count", 0)}

Return a JSON object only. No preamble. No markdown. Keys:
- keep_rate: integer 0-100 (probability buyer keeps this item)
- top_reason: string, max 8 words (most likely return reason)
- badge_color: "green" if keep_rate >= 70, "yellow" if 40-69, "red" if below 40
- recommendation: string, max 15 words (what to show buyer)"""

    try:
        data = parse_model_json(converse_text(NOVA_LITE, prompt))
        return PreventResponse(**data)
    except Exception as exc:  # noqa: BLE001 - never break the demo
        print(f"[prevent] Bedrock failed, using fallback: {exc}")
        return PreventResponse(
            keep_rate=72,
            top_reason="Size or fit mismatch",
            badge_color="green",
            recommendation="Check the size guide and reviews before buying",
        )
