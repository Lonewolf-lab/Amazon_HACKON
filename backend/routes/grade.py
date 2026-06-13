"""Smart quality grading — grades a returned item from uploaded photos."""
from fastapi import APIRouter

router = APIRouter(prefix="/grade", tags=["grade"])


@router.post("")
def grade():
    """Grade a returned item and estimate its resale value.

    Stub: returns hardcoded mock data. Wire up to the vision model later.
    """
    return {
        "grade": "B",
        "reason": "Minor scuff on left side, all functions intact",
        "resale_pct": 68,
        "confidence": 91,
    }
