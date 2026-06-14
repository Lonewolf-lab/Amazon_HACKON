"""Amazon ReLife AI — FastAPI entrypoint.

Initializes the app, configures CORS (wide open for the hackathon), and mounts
the feature routers under the /api prefix.
"""
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import (
    prevent,
    grade,
    redirect,
    credits,
    next_owner,
    certificate,
    tradein,
    journey,
    marketplace,
)

load_dotenv()

app = FastAPI(title="Amazon ReLife AI API")

# CORS — allow everything for the hackathon. Tighten before production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Feature routers
app.include_router(prevent.router, prefix="/api")
app.include_router(grade.router, prefix="/api")
app.include_router(redirect.router, prefix="/api")
app.include_router(credits.router, prefix="/api")
app.include_router(next_owner.router, prefix="/api")
app.include_router(certificate.router, prefix="/api")
app.include_router(tradein.router, prefix="/api")
app.include_router(journey.router, prefix="/api")
app.include_router(marketplace.router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "Amazon ReLife AI is live"}
