"""ReLife Journey records — persist every AI decision and serve the admin views.

Each completed ReLife Journey writes one row to the `returns` table
(record_type="journey", user_id="JOURNEY") so the Admin dashboard reflects REAL,
linked data — the AI decisions table and the refurbishment queue both read from
here, not from mocks.
"""
import datetime
from decimal import Decimal
from typing import List, Optional

from boto3.dynamodb.conditions import Attr
from fastapi import APIRouter
from pydantic import BaseModel

from ._aws import TABLE_RETURNS, get_dynamodb

router = APIRouter(prefix="/journey", tags=["journey"])

JOURNEY_SK = "JOURNEY"      # sort-key marker for journey records
RECORD_TYPE = "journey"


class JourneyComplete(BaseModel):
    return_id: str
    asin: str
    product_name: str
    reason: str
    grade: str
    condition_score: int = 0
    confidence: int = 0
    detected_issues: List[str] = []
    chosen_path: str
    disposition: str = ""
    recovery_value: int = 0
    green_credits: int = 0
    image_base64: Optional[str] = None
    image_format: Optional[str] = "jpeg"


class RefurbDone(BaseModel):
    return_id: str


def _now_iso() -> str:
    return datetime.datetime.utcnow().isoformat() + "Z"


def _clean(obj):
    """Recursively convert DynamoDB Decimals to int/float for JSON output."""
    if isinstance(obj, list):
        return [_clean(x) for x in obj]
    if isinstance(obj, dict):
        return {k: _clean(v) for k, v in obj.items()}
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj


def _status_for(path: str) -> str:
    # Refurbish items go to the warehouse first; everything else is done.
    return "in_refurbishment" if path == "refurbish" else "completed"


@router.post("/complete")
def complete(req: JourneyComplete):
    """Persist a finished ReLife Journey as one returns-table record."""
    item = {
        "return_id": req.return_id,
        "user_id": JOURNEY_SK,
        "record_type": RECORD_TYPE,
        "asin": req.asin,
        "product_name": req.product_name,
        "reason": req.reason,
        "grade": req.grade,
        "condition_score": req.condition_score,
        "confidence": req.confidence,
        "detected_issues": req.detected_issues,
        "chosen_path": req.chosen_path,
        "disposition": req.disposition,
        "recovery_value": req.recovery_value,
        "green_credits": req.green_credits,
        "status": _status_for(req.chosen_path),
        "image_format": req.image_format or "jpeg",
        "created_at": _now_iso(),
    }
    if req.image_base64:
        item["image_base64"] = req.image_base64

    try:
        get_dynamodb().Table(TABLE_RETURNS).put_item(Item=item)
    except Exception as exc:  # noqa: BLE001 - never break the demo
        print(f"[journey] write skipped: {exc}")

    # Don't echo the (heavy) image back.
    return {k: v for k, v in item.items() if k != "image_base64"}


@router.get("/list")
def list_journeys():
    """All AI decisions, newest first, without the heavy image payload."""
    try:
        resp = get_dynamodb().Table(TABLE_RETURNS).scan(
            FilterExpression=Attr("record_type").eq(RECORD_TYPE)
        )
        items = resp.get("Items", [])
        for it in items:
            it.pop("image_base64", None)
        items = _clean(items)
        items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return items
    except Exception as exc:  # noqa: BLE001
        print(f"[journey] list failed: {exc}")
        return []


@router.post("/refurbish-complete")
def refurbish_complete(req: RefurbDone):
    """Warehouse marks a refurbishment done → item becomes listed."""
    try:
        get_dynamodb().Table(TABLE_RETURNS).update_item(
            Key={"return_id": req.return_id, "user_id": JOURNEY_SK},
            UpdateExpression="SET #s = :s, refurbished_at = :t",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={
                ":s": "refurbished_listed",
                ":t": _now_iso(),
            },
        )
        return {"ok": True, "return_id": req.return_id, "status": "refurbished_listed"}
    except Exception as exc:  # noqa: BLE001
        print(f"[journey] refurbish-complete failed: {exc}")
        return {"ok": False, "return_id": req.return_id}


# Declared last so /list and /refurbish-complete are matched before this
# dynamic path.
@router.get("/{return_id}")
def detail(return_id: str):
    """Full record for one decision, including the uploaded photo."""
    try:
        resp = get_dynamodb().Table(TABLE_RETURNS).get_item(
            Key={"return_id": return_id, "user_id": JOURNEY_SK}
        )
        item = resp.get("Item")
        return _clean(item) if item else {}
    except Exception as exc:  # noqa: BLE001
        print(f"[journey] detail failed: {exc}")
        return {}
