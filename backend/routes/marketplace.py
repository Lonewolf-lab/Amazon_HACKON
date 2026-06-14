"""ReLife Marketplace — real DynamoDB-backed listings.

Two sources, merged:
  1. Live journey listings — completed ReLife Journeys that are sellable
       (resell → "Pre-owned"; refurbish → "Refurbished" once completed).
  2. Catalog listings — the seeded `products` table (50 items) presented as
       AI-graded second-life inventory, so the storefront reflects real data
       instead of a hardcoded frontend list.

Journey listings take precedence: if a product already has a live listing,
its catalog duplicate is dropped (deduped by ASIN).
"""
from typing import List, Optional

from boto3.dynamodb.conditions import Attr
from fastapi import APIRouter
from pydantic import BaseModel

from ._aws import TABLE_PRODUCTS, TABLE_RETURNS, get_dynamodb, get_item

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

# products.category (lowercase) → marketplace UI category label
CATEGORY_MAP = {
    "electronics": "Electronics",
    "clothing": "Fashion",
    "appliances": "Appliances",
    "books": "Books",
    "sports": "Sports",
}
DISPOSITION = {"resell": "Pre-owned", "refurbish": "Refurbished"}
RESALE_PCT = {"A": 85, "B": 65, "C": 35}
COND_SCORE = {"A": 94, "B": 78, "C": 55}
CATALOG_DISPOSITION = {"A": "Open Box", "B": "Pre-owned", "C": "Refurbished"}


class Listing(BaseModel):
    id: str
    name: str
    category: str
    grade: str
    original: int
    price: int
    condition_score: int
    disposition: str
    asin: Optional[str] = None
    created_at: Optional[str] = None


def _is_listed(path: str, status: str) -> bool:
    if path == "resell":
        return True
    if path == "refurbish":
        return status == "refurbished_listed"
    return False


def _grade_for_keep(keep: int) -> str:
    """Derive a second-life grade from a product's keep-rate score."""
    if keep >= 85:
        return "A"
    if keep >= 70:
        return "B"
    return "C"


def _journey_listings() -> List[Listing]:
    """Sellable items from completed ReLife Journeys (newest first)."""
    try:
        records = (
            get_dynamodb()
            .Table(TABLE_RETURNS)
            .scan(FilterExpression=Attr("record_type").eq("journey"))
            .get("Items", [])
        )
    except Exception as exc:  # noqa: BLE001 - demo resilience
        print(f"[marketplace] journey scan failed: {exc}")
        return []

    out: List[Listing] = []
    cache: dict = {}
    for r in records:
        path = str(r.get("chosen_path", ""))
        if not _is_listed(path, str(r.get("status", ""))):
            continue
        asin = str(r.get("asin", ""))
        if asin not in cache:
            cache[asin] = get_item(TABLE_PRODUCTS, {"asin": asin}) or {}
        product = cache[asin]
        original = int(product.get("price_inr", 0) or 0)
        price = int(r.get("recovery_value", 0) or 0) or original or 0
        if not original:
            original = price
        out.append(
            Listing(
                id=str(r.get("return_id", "")),
                name=str(r.get("product_name", "ReLife Item")),
                category=CATEGORY_MAP.get(
                    str(product.get("category", "")).lower(), "Electronics"
                ),
                grade=str(r.get("grade", "B")).upper(),
                original=original,
                price=price,
                condition_score=int(r.get("condition_score", 0) or 0),
                disposition=DISPOSITION.get(path, "Pre-owned"),
                asin=asin or None,
                created_at=r.get("created_at"),
            )
        )
    out.sort(key=lambda x: x.created_at or "", reverse=True)
    return out


def _catalog_listings() -> List[Listing]:
    """The seeded products table as AI-graded second-life inventory."""
    try:
        items = get_dynamodb().Table(TABLE_PRODUCTS).scan().get("Items", [])
    except Exception as exc:  # noqa: BLE001 - demo resilience
        print(f"[marketplace] product scan failed: {exc}")
        return []

    out: List[Listing] = []
    for p in items:
        asin = str(p.get("asin", ""))
        if not asin:
            continue
        grade = _grade_for_keep(int(p.get("keep_rate_score", 75) or 75))
        original = int(p.get("price_inr", 0) or 0)
        out.append(
            Listing(
                id=asin,
                name=str(p.get("product_name", "Product")),
                category=CATEGORY_MAP.get(
                    str(p.get("category", "")).lower(), "Electronics"
                ),
                grade=grade,
                original=original,
                price=round(original * RESALE_PCT[grade] / 100),
                condition_score=COND_SCORE[grade],
                disposition=CATALOG_DISPOSITION[grade],
                asin=asin,
            )
        )
    out.sort(key=lambda x: x.name)
    return out


@router.get("", response_model=List[Listing])
def marketplace():
    journeys = _journey_listings()
    listed_asins = {j.asin for j in journeys if j.asin}
    catalog = [c for c in _catalog_listings() if c.asin not in listed_asins]
    return journeys + catalog
