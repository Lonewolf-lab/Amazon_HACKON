"""Return routing — Bedrock Nova Pro disposition ranking."""
from typing import List

from fastapi import APIRouter
from pydantic import BaseModel

from ._aws import (
    TABLE_PRODUCTS,
    TABLE_RETURNS,
    converse_text,
    get_dynamodb,
    get_item,
    parse_model_json,
)

router = APIRouter(prefix="/redirect", tags=["redirect"])

NOVA_PRO = "amazon.nova-pro-v1:0"

ROUTING_CONTEXT = """
Partner network:
- Amazon Renewed: certified resale of Grade A/B electronics & appliances (highest recovery).
- P2P Resale: Grade A/B, any category, price > ₹500.
- Refurbish: Cashify (electronics), QuikrRefurb (appliances) — repair cosmetic/minor damage, then resell. Ideal for Grade C items that still function.
- Donate (NGO): Goonj (clothing/household), CRY (children's items), HelpAge India (appliances) — for usable items with low resale value.
- Recycle: E-Parisaraa (electronics), Attero (batteries) — LAST RESORT, only for non-functional/unsafe (Grade R) items.
- Exchange: only for wrong size/color returns, Grade A/B.

Decision policy — recommend the HIGHEST-value path the item qualifies for:
- Grade A -> resell (P2P or Amazon Renewed). Highest recovery.
- Grade B -> resell, or refurbish then resell.
- Grade C -> refurbish (preferred: visible/cosmetic damage but still usable). If not economically refurbishable, donate. Recycle only if truly unusable.
- Grade R -> donate if an NGO can use it, otherwise recycle (non-functional/unsafe).
Recycle is the LAST resort. NEVER recommend recycle as the top path for a functional Grade A, B, or C item — it destroys recoverable value.
"""


class RedirectRequest(BaseModel):
    return_id: str
    grade: str
    asin: str


class RedirectPath(BaseModel):
    path: str
    recommended: bool
    confidence: int
    reason: str
    estimated_recovery_value: int
    green_credits_to_issue: int


# Sensible 5-path fallback so the demo never breaks if Bedrock is unavailable.
FALLBACK_PATHS = [
    {"path": "resell", "recommended": True, "confidence": 87,
     "reason": "Grade B item with high resale demand",
     "estimated_recovery_value": 1360, "green_credits_to_issue": 50},
    {"path": "refurbish", "recommended": False, "confidence": 60,
     "reason": "Minor repair needed before resale",
     "estimated_recovery_value": 1100, "green_credits_to_issue": 35},
    {"path": "donate", "recommended": False, "confidence": 40,
     "reason": "Functional item better suited for resale",
     "estimated_recovery_value": 0, "green_credits_to_issue": 20},
    {"path": "recycle", "recommended": False, "confidence": 10,
     "reason": "Item is functional, recycling wastes value",
     "estimated_recovery_value": 0, "green_credits_to_issue": 10},
    {"path": "exchange", "recommended": False, "confidence": 20,
     "reason": "Different variant available but resale preferred",
     "estimated_recovery_value": 0, "green_credits_to_issue": 15},
]


@router.post("", response_model=List[RedirectPath])
def redirect(req: RedirectRequest):
    product = get_item(TABLE_PRODUCTS, {"asin": req.asin}) or {}

    prompt = f"""You are a circular commerce routing specialist for Amazon India.

Returned item:
- Product: {product.get("product_name", "Unknown")} ({product.get("category", "Unknown")})
- Grade: {req.grade}
- Original price: ₹{product.get("price_inr", 0)}
- ASIN: {req.asin}

Available routing context:
{ROUTING_CONTEXT}

Apply the decision policy above to choose the single recommended path for this
grade, then rank ALL five paths. Return a JSON array only. No preamble. No markdown.
Each object must have keys:
- path: 'resell' | 'refurbish' | 'donate' | 'recycle' | 'exchange'
- recommended: boolean (exactly one must be true)
- confidence: integer 0-100
- reason: string, max 15 words
- estimated_recovery_value: integer in INR
- green_credits_to_issue: integer (resell=50, refurbish=35, donate=20, recycle=10, exchange=15)"""

    try:
        data = parse_model_json(converse_text(NOVA_PRO, prompt))
        paths = [RedirectPath(**p) for p in data]
    except Exception as exc:  # noqa: BLE001 - never break the demo
        print(f"[redirect] Bedrock failed, using fallback: {exc}")
        paths = [RedirectPath(**p) for p in FALLBACK_PATHS]

    # Persist the recommended path to the returns table (best-effort).
    try:
        recommended = next((p.path for p in paths if p.recommended), paths[0].path)
        get_dynamodb().Table(TABLE_RETURNS).update_item(
            Key={"return_id": req.return_id, "user_id": "SYSTEM"},
            UpdateExpression="SET #rp = :rp",
            ExpressionAttributeNames={"#rp": "recommended_path"},
            ExpressionAttributeValues={":rp": recommended},
        )
    except Exception as exc:  # noqa: BLE001
        print(f"[redirect] DynamoDB write skipped: {exc}")

    return paths
