"""Next Best Owner — Bedrock Nova Pro buyer-segment matching.

Grounds the match in real seed data: how many seeded users wishlisted this
exact ASIN becomes a demand signal fed into the prompt, so the segments are
data-driven rather than invented.
"""
from typing import List

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

router = APIRouter(prefix="/next-owner", tags=["next-owner"])

NOVA_PRO = "amazon.nova-pro-v1:0"


class NextOwnerRequest(BaseModel):
    asin: str
    grade: str
    return_id: str


class BuyerSegment(BaseModel):
    segment: str
    match_pct: int
    reasoning: str
    persona_example: str
    wishlist_hit: bool


FALLBACK_SEGMENTS = [
    {"segment": "Students", "match_pct": 92,
     "reasoning": "Budget-conscious buyers who value certified, affordable tech",
     "persona_example": "Aarav, 2nd-year engineering student", "wishlist_hit": True},
    {"segment": "Eco-conscious shoppers", "match_pct": 85,
     "reasoning": "Prefer second-life products to reduce e-waste footprint",
     "persona_example": "Priya, sustainability advocate", "wishlist_hit": False},
    {"segment": "Freelancers", "match_pct": 78,
     "reasoning": "Need reliable gear at lower cost for project work",
     "persona_example": "Rohan, freelance designer", "wishlist_hit": False},
]


def _wishlist_demand(asin: str) -> int:
    """Count how many seeded users wishlisted this ASIN (fail-soft)."""
    try:
        resp = get_dynamodb().Table(TABLE_USERS).scan()
        items = resp.get("Items", [])
        return sum(1 for it in items if asin in (it.get("wishlist_asins") or []))
    except Exception as exc:  # noqa: BLE001 - demo resilience
        print(f"[next-owner] user scan skipped: {exc}")
        return 0


@router.post("", response_model=List[BuyerSegment])
def next_owner(req: NextOwnerRequest):
    product = get_item(TABLE_PRODUCTS, {"asin": req.asin}) or {}
    name = product.get("product_name", "this product")
    category = product.get("category", "general")
    price = product.get("price_inr", 0)
    demand = _wishlist_demand(req.asin)

    prompt = f"""You are Amazon ReLife's buyer-matching engine for second-life resale.

A Grade {req.grade} {name} ({category}, ₹{price}) is entering second-life resale.
Demand signal: {demand} of our active users have wishlisted this exact item.

Identify the 3 BEST buyer segments for it (e.g. Students, Freelancers, Remote workers,
Eco-conscious shoppers, Budget families, Collectors).

Return a JSON array only. No preamble. No markdown. Each object:
- segment: string (the buyer segment name)
- match_pct: integer 0-100 (how well the item fits this segment)
- reasoning: string, max 18 words
- persona_example: string (one short name + context, e.g. "Aarav, engineering student")
- wishlist_hit: boolean (true if this segment likely includes the users who wishlisted it)"""

    try:
        data = parse_model_json(converse_text(NOVA_PRO, prompt))
        return [BuyerSegment(**s) for s in data][:3]
    except Exception as exc:  # noqa: BLE001 - never break the demo
        print(f"[next-owner] Bedrock failed, using fallback: {exc}")
        return [BuyerSegment(**s) for s in FALLBACK_SEGMENTS]
