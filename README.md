# Amazon ReLife AI — Every Product Deserves a Second Life

**Amazon ReLife AI** is an intelligent second-life commerce ecosystem for Amazon HackOn 6.0. Millions of products are returned, underused, or discarded despite being perfectly usable. ReLife uses generative AI to make commerce decisions: it runs **smart quality grading** on a real product photo, then an **AI decision engine** determines the item's most valuable next life — **peer-to-peer resale**, **certified refurbished**, exchange, donation, or recycling — actively finds its **next best owner**, issues a **trust certificate**, rewards customers with **green credits**, and even delivers **predictive return prevention** before a purchase is ever made.

> The image analysis is only step one. The intelligence is the decision engine, buyer matching, trust generation, sustainability incentives, and the second-life marketplace.

## What makes it different

Most solutions stop at *Upload → Detect Damage*. ReLife goes the full loop:

```
Upload Product → AI Inspection (condition score) → AI Decision Engine
→ Next Best Owner → Trust Certificate → Marketplace / Trade-In
```

## Tech Stack

| Layer    | Stack |
| -------- | ----- |
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS · Chart.js · axios |
| Backend  | FastAPI · Uvicorn · Pydantic · boto3 |
| AI       | **AWS Bedrock** — Amazon **Nova Lite** (multimodal inspection, prevention, trade-in) · Amazon **Nova Pro** (decision engine, next-best-owner) |
| Data     | AWS DynamoDB (products / returns / users) · S3 |

All Bedrock/DynamoDB calls are wrapped with graceful fallbacks, so a cold start or AWS hiccup never breaks the demo.

## Screens

1. **Home** — ecosystem dashboard + impact stats.
2. **ReLife Journey** (`/portal`) — the 5-step returns flow: Upload → AI Inspection (0–100 condition score + detected issues) → 5-way Decision → Next Best Owner → ReLife Certificate.
3. **ReLife Marketplace** — AI-certified second-life listings, filterable by category.
4. **Smart Trade-In** — upload your own gadget → instant AI trade-in value + upgrade suggestion.
5. **Impact** — green credits wallet, CO₂ saved, sustainability tier.
6. **Smart Buy** — product page with predictive return-prevention keep-rate badge.
7. **Admin** — returns analytics: recovery value, grade mix, risk products.

## Local Setup

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate
# macOS/Linux:  source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

- API: http://localhost:8000 · Health: `/` · Swagger UI: `/docs`

### Frontend (Next.js 14)

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

> Start the backend first so the frontend's API calls resolve. `frontend/.env.local` sets `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).
> Tip (Windows): don't run `npm run build` while `npm run dev` is running — they share `.next` and the build will fail with `EPERM`. Stop dev first.

## Environment Variables

**`frontend/.env.local`** — `NEXT_PUBLIC_API_URL` (backend base URL).

**`backend/.env`** — `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (`us-east-1`), `DYNAMODB_TABLE_PRODUCTS`, `DYNAMODB_TABLE_RETURNS`, `DYNAMODB_TABLE_USERS`, `S3_BUCKET_NAME`.

> `.env` / `.env.local` are git-ignored. Without valid keys every route still responds via fallbacks (canned data) — fine to demo the UI, but not "live AI."

## API Endpoints

All routes are mounted under `/api`:

| Method | Endpoint              | Purpose                                          | Model |
| ------ | --------------------- | ------------------------------------------------ | ----- |
| GET    | `/`                   | Health check                                     | — |
| GET/POST | `/api/prevent/score` | Predictive return prevention (keep rate)        | Nova Lite |
| POST   | `/api/grade`          | Smart quality grading + condition score + issues | Nova Lite (multimodal) |
| POST   | `/api/redirect`       | 5-way disposition decision engine                | Nova Pro |
| POST   | `/api/next-owner`     | Next-best-owner buyer-segment matching           | Nova Pro |
| POST   | `/api/certificate`    | ReLife trust certificate                         | Nova Lite |
| POST   | `/api/credits/issue`  | Issue green credits (+ CO₂ saved)                | — |
| POST   | `/api/tradein`        | Smart trade-in valuation + upgrade               | Nova Lite (multimodal) |

## Live Links

| Environment | URL |
| ----------- | --- |
| Frontend    | https://relife.example.com _(placeholder)_ |
| Backend API | https://api.relife.example.com _(placeholder)_ |
| Swagger UI  | https://api.relife.example.com/docs _(placeholder)_ |
