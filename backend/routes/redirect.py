"""Return routing — recommends the best path for a returned item."""
from fastapi import APIRouter

router = APIRouter(prefix="/redirect", tags=["redirect"])


@router.post("")
def redirect():
    """Rank the possible disposition paths for a returned item.

    Stub: returns hardcoded mock data. Wire up to the routing model later.
    """
    return [
        {
            "path": "resell",
            "recommended": True,
            "confidence": 87,
            "reason": "Grade B item with high demand in buyer wishlist",
            "estimated_recovery_value": 1360,
            "green_credits_to_issue": 50,
        },
        {
            "path": "refurbish",
            "recommended": False,
            "confidence": 60,
            "reason": "Minor repair needed before resale",
            "estimated_recovery_value": 1100,
            "green_credits_to_issue": 35,
        },
        {
            "path": "donate",
            "recommended": False,
            "confidence": 40,
            "reason": "Functional item better suited for resale",
            "estimated_recovery_value": 0,
            "green_credits_to_issue": 20,
        },
        {
            "path": "recycle",
            "recommended": False,
            "confidence": 10,
            "reason": "Item is functional, recycling wastes value",
            "estimated_recovery_value": 0,
            "green_credits_to_issue": 5,
        },
        {
            "path": "exchange",
            "recommended": False,
            "confidence": 20,
            "reason": "Different variant available but resale preferred",
            "estimated_recovery_value": 0,
            "green_credits_to_issue": 0,
        },
    ]
