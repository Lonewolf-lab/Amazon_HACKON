"""Smart Trade-In (secondary) — multimodal Nova Lite valuation + upgrade pick.

A customer uploads their own used gadget; the AI grades it, estimates a fair
INR trade-in value, and suggests one upgrade drawn from the real catalog.
"""
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from ._aws import (
    TABLE_PRODUCTS,
    converse_image,
    converse_text,
    get_dynamodb,
    parse_model_json,
)

router = APIRouter(prefix="/tradein", tags=["tradein"])

NOVA_LITE = "amazon.nova-lite-v1:0"


class TradeInRequest(BaseModel):
    category: str = "electronics"
    image_base64: Optional[str] = None
    image_format: Optional[str] = "jpeg"
    model_hint: Optional[str] = None


class TradeInResponse(BaseModel):
    condition_grade: str
    trade_in_value_inr: int
    upgrade_name: str
    upgrade_reason: str
    instant_credit: int


FALLBACK = TradeInResponse(
    condition_grade="B",
    trade_in_value_inr=8500,
    upgrade_name="Sony WH-1000XM5 Noise Cancelling Headphones",
    upgrade_reason="Premium upgrade with best-in-class noise cancelling",
    instant_credit=450,
)


def _upgrade_candidates(category: str):
    """A few real catalog names in the same category (fail-soft)."""
    try:
        items = get_dynamodb().Table(TABLE_PRODUCTS).scan().get("Items", [])
        same = [it.get("product_name") for it in items if it.get("category") == category]
        names = same or [it.get("product_name") for it in items]
        return [n for n in names if n][:6]
    except Exception as exc:  # noqa: BLE001 - demo resilience
        print(f"[tradein] product scan skipped: {exc}")
        return ["Sony WH-1000XM5 Noise Cancelling Headphones", "JBL Charge 5 Speaker"]


@router.post("", response_model=TradeInResponse)
def tradein(req: TradeInRequest):
    candidates = ", ".join(_upgrade_candidates(req.category)) or "a newer model"
    hint = f" The item is roughly: {req.model_hint}." if req.model_hint else ""

    prompt = f"""You are Amazon ReLife Trade-In for India.
Estimate the condition and a fair INR trade-in value for a customer's used
{req.category} item.{hint}
Suggest ONE upgrade chosen from this catalog: {candidates}.

Return valid JSON only. No preamble. No markdown. Keys:
- condition_grade: 'A' | 'B' | 'C' | 'R'
- trade_in_value_inr: integer (fair trade-in value in INR)
- upgrade_name: string (one product name from the catalog above)
- upgrade_reason: string, max 15 words
- instant_credit: integer (about 5% of trade_in_value_inr, as bonus Amazon credit)"""

    try:
        if req.image_base64:
            text = converse_image(
                NOVA_LITE, prompt, req.image_base64, req.image_format or "jpeg"
            )
        else:
            text = converse_text(NOVA_LITE, prompt)
        return TradeInResponse(**parse_model_json(text))
    except Exception as exc:  # noqa: BLE001 - never break the demo
        print(f"[tradein] Bedrock failed, using fallback: {exc}")
        return FALLBACK
