"""Green credits — issues sustainability rewards for returns."""
from fastapi import APIRouter

router = APIRouter(prefix="/credits", tags=["credits"])


@router.post("/issue")
def issue():
    """Issue green credits to a user and return their updated balance.

    Stub: returns hardcoded mock data. Wire up to DynamoDB later.
    """
    return {
        "new_balance": 150,
        "message": "50 Green Credits added for your return. You saved 0.8kg of CO2.",
    }
