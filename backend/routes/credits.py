"""Green Credits — a real credit/debit ledger backed by DynamoDB.

- The user's running balance lives on the `users` table (green_credits_balance).
- Every credit (earned in a ReLife Journey) and debit (a redemption) is also
  written as a transaction row in the `returns` table (record_type="credit_txn"),
  so the Green Credits page can show a real, linked transaction history.
"""
import datetime
import uuid
from decimal import Decimal
from typing import Optional

from boto3.dynamodb.conditions import Attr
from fastapi import APIRouter
from pydantic import BaseModel

from ._aws import TABLE_RETURNS, TABLE_USERS, get_dynamodb, get_item

router = APIRouter(prefix="/credits", tags=["credits"])

CO2_PER_CREDIT_KG = 0.016
TXN_TYPE = "credit_txn"


class CreditsRequest(BaseModel):
    user_id: str
    amount: int
    return_id: str
    reason: Optional[str] = None


class CreditsResponse(BaseModel):
    new_balance: int
    message: str


class RedeemRequest(BaseModel):
    user_id: str
    amount: int
    reward: str


class RedeemResponse(BaseModel):
    ok: bool
    new_balance: int
    message: str


def _now_iso() -> str:
    return datetime.datetime.utcnow().isoformat() + "Z"


def _clean(obj):
    if isinstance(obj, list):
        return [_clean(x) for x in obj]
    if isinstance(obj, dict):
        return {k: _clean(v) for k, v in obj.items()}
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj


def _get_balance(user_id: str) -> int:
    user = get_item(TABLE_USERS, {"user_id": user_id})
    return int(user.get("green_credits_balance", 0)) if user else 0


def _set_balance(user_id: str, new_balance: int) -> None:
    table = get_dynamodb().Table(TABLE_USERS)
    try:
        table.update_item(
            Key={"user_id": user_id},
            UpdateExpression="SET green_credits_balance = :b",
            ExpressionAttributeValues={":b": new_balance},
        )
    except Exception as exc:  # noqa: BLE001
        # User row may not exist yet — create a minimal one.
        try:
            table.put_item(
                Item={"user_id": user_id, "green_credits_balance": new_balance}
            )
        except Exception as exc2:  # noqa: BLE001
            print(f"[credits] balance write skipped: {exc} / {exc2}")


def _write_txn(
    user_id: str,
    kind: str,          # "credit" | "debit"
    amount: int,
    reason: str,
    balance_after: int,
    ref: str = "",
) -> None:
    """Append one ledger row to the returns table."""
    txn_id = "CTX-" + uuid.uuid4().hex[:12].upper()
    try:
        get_dynamodb().Table(TABLE_RETURNS).put_item(
            Item={
                "return_id": txn_id,
                "user_id": user_id,
                "record_type": TXN_TYPE,
                "txn_id": txn_id,
                "type": kind,
                "amount": amount,
                "reason": reason,
                "balance_after": balance_after,
                "ref": ref,
                "created_at": _now_iso(),
            }
        )
    except Exception as exc:  # noqa: BLE001
        print(f"[credits] ledger write skipped: {exc}")


@router.post("/issue", response_model=CreditsResponse)
def issue(req: CreditsRequest):
    current = _get_balance(req.user_id)
    new_balance = current + req.amount
    _set_balance(req.user_id, new_balance)

    # amount 0 is just a balance read (used on page load) — don't log a txn.
    if req.amount != 0:
        _write_txn(
            req.user_id,
            "credit",
            req.amount,
            req.reason or "ReLife return reward",
            new_balance,
            ref=req.return_id,
        )

    co2 = round(req.amount * CO2_PER_CREDIT_KG, 1)
    return CreditsResponse(
        new_balance=new_balance,
        message=(
            f"{req.amount} Green Credits added for your return. "
            f"You saved {co2} kg of CO2."
        ),
    )


@router.post("/redeem", response_model=RedeemResponse)
def redeem(req: RedeemRequest):
    current = _get_balance(req.user_id)
    if req.amount <= 0:
        return RedeemResponse(ok=False, new_balance=current, message="Invalid amount.")
    if current < req.amount:
        return RedeemResponse(
            ok=False,
            new_balance=current,
            message="Not enough Green Credits for this reward.",
        )

    new_balance = current - req.amount
    _set_balance(req.user_id, new_balance)
    _write_txn(req.user_id, "debit", req.amount, f"Redeemed: {req.reward}", new_balance)

    return RedeemResponse(
        ok=True,
        new_balance=new_balance,
        message=f"Redeemed {req.amount} credits for {req.reward}.",
    )


@router.get("/ledger")
def ledger(user_id: str):
    """Balance + full transaction history (newest first) for a user."""
    balance = _get_balance(user_id)
    transactions = []
    try:
        resp = get_dynamodb().Table(TABLE_RETURNS).scan(
            FilterExpression=Attr("record_type").eq(TXN_TYPE)
            & Attr("user_id").eq(user_id)
        )
        transactions = _clean(resp.get("Items", []))
        transactions.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    except Exception as exc:  # noqa: BLE001
        print(f"[credits] ledger read failed: {exc}")

    return {"balance": balance, "transactions": transactions}
