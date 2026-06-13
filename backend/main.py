"""ReLoop API — FastAPI entrypoint.

Initializes the app, configures CORS (wide open for the hackathon), and mounts
the four feature routers under the /api prefix.
"""
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import prevent, grade, redirect, credits

load_dotenv()

app = FastAPI(title="ReLoop API")

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


@app.get("/")
def health_check():
    return {"status": "ReLoop API is live"}
