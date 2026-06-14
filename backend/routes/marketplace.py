"""ReLife Marketplace — backend-persisted listings derived from journey records.

A listing is a completed ReLife Journey that is sellable:
  - chosen_path == "resell"  → listed immediately as "Pre-owned"
  - chosen_path == "refurbish" AND status == "refurbished_listed" → "Refurbished"
Donate / recycle / exchange and still-in-refurbishment items are never listed.

Category + original price are joined from the products table by ASIN, so the
listing matches the rest of the catalog. This replaces the previous
localStorage-only listings with a real, cross-device DynamoDB source.
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


class Listing(BaseModel):
    id: str
    name: str
    category: str
    grade: str
    original: int
    price: int
    condition_score: int
    disposition: str
    created_at: Optional[str] = None


def _is_listed(path: str, status: str) -> bool:
    if path == "resell":
        return True
    if path == "refurbish":
        return status == "refurbished_listed"
    return False


@router.get("", response_model=List[Listing])
def marketplace():
    try:
        resp = get_dynamodb().Table(TABLE_RETURNS).scan(
            FilterExpression=Attr("record_type").eq("journey")
        )
        records = resp.get("Items", [])
    except Exception as exc:  # noqa: BLE001 - demo resilience
        print(f"[marketplace] scan failed: {exc}")
        return []

    listings: List[Listing] = []
    product_cache: dict = {}

    for r in records:
        path = str(r.get("chosen_path", ""))
        if not _is_listed(path, str(r.get("status", ""))):
            continue

        asin = str(r.get("asin", ""))
        if asin not in product_cache:
            product_cache[asin] = get_item(TABLE_PRODUCTS, {"asin": asin}) or {}
        product = product_cache[asin]

        category = CATEGORY_MAP.get(
            str(product.get("category", "")).lower(), "Electronics"
        )
        original = int(product.get("price_inr", 0) or 0)
        price = int(r.get("recovery_value", 0) or 0) or original or 0
        if not original:
            original = price

        listings.append(
            Listing(
                id=str(r.get("return_id", "")),
                name=str(r.get("product_name", "ReLife Item")),
                category=category,
                grade=str(r.get("grade", "B")).upper(),
                original=original,
                price=price,
                condition_score=int(r.get("condition_score", 0) or 0),
                disposition=DISPOSITION.get(path, "Pre-owned"),
                created_at=r.get("created_at"),
            )
        )

    listings.sort(key=lambda x: x.created_at or "", reverse=True)
    return listings
