"""ReLife Trust Certificate.

The value-bearing fields are deterministic (so the certificate always renders
crisply on stage); only the one-line `blurb` is an optional Nova Lite flourish
with a static fallback.
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from ._aws import TABLE_PRODUCTS, converse_text, get_item

router = APIRouter(prefix="/certificate", tags=["certificate"])

NOVA_LITE = "amazon.nova-lite-v1:0"
CO2_PER_CREDIT_KG = 0.016

VERDICTS = {
    "A": "Certified Like-New",
    "B": "Certified Good",
    "C": "Certified Fair",
    "R": "Responsibly Recycled",
}
CREDITS_BY_GRADE = {"A": 50, "B": 35, "C": 20, "R": 10}


class CertificateRequest(BaseModel):
    return_id: str
    asin: str
    grade: str
    condition_score: int
    confidence: int
    chosen_path: str
    buyer_segment: Optional[str] = None


class CertificateResponse(BaseModel):
    certificate_id: str
    product_name: str
    grade: str
    condition_score: int
    confidence: int
    verdict: str
    co2_saved_kg: float
    issued_at: str
    blurb: str


@router.post("", response_model=CertificateResponse)
def certificate(req: CertificateRequest):
    product = get_item(TABLE_PRODUCTS, {"asin": req.asin}) or {}
    name = product.get("product_name", "Amazon Product")
    grade = (req.grade or "B").upper()
    verdict = VERDICTS.get(grade, "Certified")
    co2 = round(CREDITS_BY_GRADE.get(grade, 20) * CO2_PER_CREDIT_KG, 2)
    cert_id = f"RELIFE-{req.return_id}-{grade}"
    issued_at = datetime.utcnow().isoformat() + "Z"

    # Deterministic blurb; upgraded by Nova Lite when available.
    blurb = (
        f"This {name} has been AI-inspected and graded {verdict} by Amazon ReLife "
        f"at {req.confidence}% confidence."
    )
    try:
        seg = f" and matched to {req.buyer_segment}" if req.buyer_segment else ""
        prompt = (
            f"Write ONE short trust sentence (max 25 words) for an Amazon ReLife "
            f"certificate: a {verdict} {name} inspected by AI at {req.confidence}% "
            f"confidence{seg}. No preamble, no quotes."
        )
        text = converse_text(NOVA_LITE, prompt).strip().strip('"')
        if text:
            blurb = text
    except Exception as exc:  # noqa: BLE001 - blurb is optional flourish
        print(f"[certificate] blurb fallback: {exc}")

    return CertificateResponse(
        certificate_id=cert_id,
        product_name=name,
        grade=grade,
        condition_score=req.condition_score,
        confidence=req.confidence,
        verdict=verdict,
        co2_saved_kg=co2,
        issued_at=issued_at,
        blurb=blurb,
    )
