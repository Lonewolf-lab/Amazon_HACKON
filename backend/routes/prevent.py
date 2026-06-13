"""Predictive return prevention — scores how likely a buyer is to keep an item."""
from fastapi import APIRouter

router = APIRouter(prefix="/prevent", tags=["prevent"])


@router.post("/score")
def score():
    """Return a 'keep rate' prediction and guidance shown on the product page.

    Stub: returns hardcoded mock data. Wire up to the model/DynamoDB later.
    """
    return {
        "keep_rate": 78,
        "top_reason": "Size runs small",
        "badge_color": "green",
        "recommendation": "Check size guide before purchasing",
    }
