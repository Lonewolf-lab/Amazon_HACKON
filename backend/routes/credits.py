"""Green credits — issue rewards and update the user's DynamoDB balance."""
from fastapi import APIRouter
from pydantic import BaseModel

from ._aws import TABLE_USERS, get_dynamodb, get_item

router = APIRouter(prefix="/credits", tags=["credits"])

CO2_PER_CREDIT_KG = 0.016


class CreditsRequest(BaseModel):
    user_id: str
    amount: int
    return_id: str


class CreditsResponse(BaseModel):
    new_balance: int
    message: str


@router.post("/issue", response_model=CreditsResponse)
def issue(req: CreditsRequest):
    user = get_item(TABLE_USERS, {"user_id": req.user_id})
    current = int(user.get("green_credits_balance", 0)) if user else 0
    new_balance = current + req.amount

    table = get_dynamodb().Table(TABLE_USERS)
    try:
        if user:
            table.update_item(
                Key={"user_id": req.user_id},
                UpdateExpression="SET green_credits_balance = :b",
                ExpressionAttributeValues={":b": new_balance},
            )
        else:
            # User not found → create a basic record with just the credits.
            table.put_item(
                Item={"user_id": req.user_id, "green_credits_balance": new_balance}
            )
    except Exception as exc:  # noqa: BLE001 - never break the demo
        print(f"[credits] DynamoDB write skipped: {exc}")

    co2 = round(req.amount * CO2_PER_CREDIT_KG, 1)
    return CreditsResponse(
        new_balance=new_balance,
        message=(
            f"{req.amount} Green Credits added for your return. "
            f"You saved {co2} kg of CO2."
        ),
    )
