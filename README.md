# Amazon ReLife AI — Every Product Deserves a Second Life

> **Amazon HackOn 6.0 · Theme: Sustainability & Circular Commerce**
> An AI-powered **circular-commerce operating system** that turns every Amazon return into a **certified second life** — in seconds. Built on **AWS Bedrock (Amazon Nova)**, **DynamoDB**, and **S3**. Total infrastructure cost to build: **~$1.**

---

## 📰 Working Backwards — the press release we built from

> *"Today Amazon launches **ReLife AI**. When a customer returns an item, AI inspects the actual photo, grades it, and instantly decides its most valuable next life — resell, refurbish, exchange, donate, or recycle. The customer is rewarded with **Green Credits** the moment they confirm, the next buyer gets a **trust-certified** product in the **ReLife Marketplace**, and Amazon recovers value it used to throw away. Returns stop being a cost to dispose of, and become inventory waiting for its next owner."*

We wrote this **press release first** and worked backwards to the product — the most Amazonian way to build. Everything below exists to make that paragraph true.

---

## 🎯 The Problem (Customer Obsession)

An estimated **20–30% of all e-commerce orders are returned**, and across an estimated **~40M+ returns/year** a large share of perfectly usable items are **landfilled or destroyed** — because manually inspecting, grading, and re-routing each return is slow and expensive. This hurts **three customers at once**:

| Customer | Pain today | What ReLife gives them |
|---|---|---|
| **The returning customer** *(our hero)* | Slow, opaque, zero reward | **Instant Green Credits** + a clear outcome — *even a broken item earns credits* |
| **Amazon Operations** | High reverse-logistics + manual-inspection cost | **Inspect once, decide once** — humans only touch the uncertain items |
| **The next buyer + the planet** | No trust in used goods; avoidable e-waste | A **trust-certified** second-life product; measurable **CO₂ avoided** |

**The core insight:** the bottleneck isn't the decision — it's *re-deciding the same item at every node*. ReLife AI makes the **AI's decision travel with the item**, so the warehouse, refurbisher, or NGO *executes* instead of re-inspecting.

---

## ✨ What we built (one use-case, executed end-to-end)

Most solutions stop at *Upload → Detect Damage*. **ReLife closes the full loop** — and it's **real**, not mocked: the AI grades the *actual uploaded photo* (multimodal), every decision is a real database record, and Green Credits is a real ledger.

### The ReLife Journey *(our centerpiece — 5 steps)*
```
1  Upload photos
2  AI Inspection & Grading   → condition score 0–100 + detected issues + Grade A / B / C / R   (Nova Lite, real vision)
3  AI Decision Engine        → ranks 5 paths: resell · refurbish · exchange · donate · recycle  (Nova Pro)
   └─ customer confirms → 💚 Green Credits issued → their part is DONE
4  Next Best Owner           → buyer-segment matching                                            (Nova Pro)
5  ReLife Trust Certificate  → "Amazon ReLife Certified" for the next buyer
```

### Highlighted features
- **🔍 ReLife Grading (A / B / C / R)** — deterministic multimodal grading of the real photo (condition score + detected issues).
- **🔀 5-Way AI Decision Engine** — policy-driven disposition routing; **recycle is the last resort**, never the top path for a usable item.
- **💚 Green Credits** — a **real credit/debit ledger**; rewards on confirm; *even a Grade-R return earns credits*.
- **🛍️ ReLife Marketplace** — backend-backed certified second-life inventory ("Pre-owned" / "Amazon Renewed / Refurbished"), with product detail pages + cart.
- **🧠 Smart Buy — Personalized Predictive Return Prevention** — stops the return *before it happens*: reads the shopper's usage profile and **right-sizes** overkill purchases to a cheaper certified-refurbished alternative (e.g., ₹89,990 gaming laptop → ₹41,990 certified Lenovo for an office user = **₹48,000 saved**). A **persona switcher** proves the AI gives different shoppers different advice.
- **🔁 Smart Trade-In** — upload your own gadget → instant AI value + upgrade suggestion.
- **🏭 Admin Operations Console** — **real** Refurbishment Queue + AI Decisions table + Work Orders (repair checklist from detected issues) — *inspect once, decide once.*

---

## 🖼️ Screenshots

> **📸 For me (Shashank) — capture these and drop the images in `docs/screenshots/`, then they'll render below:**

**1. ReLife Journey — live grading**
`![ReLife Journey grading](docs/screenshots/01-journey-grade.png)`
> *Capture: the `/portal` step showing a real scratched photo graded **Grade C** with condition score + detected issues. This is the "live wow" — the hero shot.*

**2. AI Decision Engine**
`![AI Decision Engine](docs/screenshots/02-decision.png)`
> *Capture: the 5-way decision step showing refurbish recommended + Green Credits to be issued.*

**3. Admin — Refurbishment Queue + decision modal**
`![Admin queue](docs/screenshots/03-admin-queue.png)`
> *Capture: the Admin console with the queue, and the detail modal open (photo + return reason + AI-detected problems + "Mark refurbishment complete").*

**4. Smart Buy — Personalized Return Prevention**
`![Smart Buy right-sizing](docs/screenshots/04-smart-buy.png)`
> *Capture: the gaming-laptop page with the "overkill" right-size card + ₹48,000 savings, with the persona switcher visible in the navbar.*

**5. ReLife Marketplace**
`![ReLife Marketplace](docs/screenshots/05-marketplace.png)`
> *Capture: the marketplace grid with real product photos + grade/Certified badges.*

**6. Green Credits ledger**
`![Green Credits](docs/screenshots/06-credits.png)`
> *Capture: the Impact page showing live balance + the credit/debit transaction history.*

---

## 🏗️ Architecture

```
        Frontend — Next.js 14 (Vercel)
        Customer · Marketplace · Smart Buy · Admin
                    │  HTTPS (REST, NEXT_PUBLIC_API_URL)
                    ▼
        FastAPI Backend (Render) — 9 microservice-style routers under /api
   ┌─────────────────────────────────────────────────────────────────┐
   │  /prevent  /grade  /redirect  /next-owner  /certificate           │
   │  /tradein  /credits(ledger)  /journey(ops)  /marketplace          │
   └─────────────────────────────────────────────────────────────────┘
        │                      │                        │
        ▼                      ▼                        ▼
  AWS Bedrock            AWS DynamoDB              AWS S3
  Nova Lite (vision)     products / returns /      hackon-images
  Nova Pro (reasoning)   users (single-table)      (photos, pre-signed URLs)
                         Region: us-east-1
```
**Data flow:** photo → FastAPI → **Bedrock Nova Lite** grades the image bytes → **Nova Pro** ranks the 5 disposition paths → decision + photo persist to **DynamoDB + S3** → the *same record* powers the **Admin queue, the Marketplace, and the Green Credits ledger.** Written **once**, read **everywhere.**

> **📸 For me:** export the architecture diagram from draw.io/Excalidraw and add it here as `![Architecture](docs/screenshots/00-architecture.png)` — judges weight a clean system diagram heavily.

---

## 🧰 Tech Stack (with justification)

| Layer | Technology | Why we chose it |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind, Chart.js | Fast, type-safe, Amazon-grade design system; fewer demo-day bugs |
| **Backend** | FastAPI, Pydantic, boto3 | Async, auto-validated contracts, one router per capability (microservice-ready) |
| **AI** | **AWS Bedrock** — Nova **Lite** `amazon.nova-lite-v1:0` (multimodal grading, prevention, trade-in) + Nova **Pro** `amazon.nova-pro-v1:0` (decision engine, next-best-owner) | **Right model for each job** — Lite is cheap+fast for vision, Pro reasons for disposition. *This is Frugality.* |
| **Data** | **DynamoDB** (on-demand), **S3** (pre-signed reads) | Serverless, pay-per-use, scales to zero and to millions |
| **Hosting** | Render (backend) + Vercel (frontend) | Auto-deploy on `git push`; $0 |

**Deterministic AI:** all Bedrock calls run at `temperature=0` → the **same photo always grades the same** (auditable, trustworthy). **Fail-soft:** every AI/DB/S3 call has a fallback, so a cold start or hiccup never breaks the demo.

---

## 💰 Frugality (a leadership principle, on purpose)

Amazon's Frugality means *accomplish more with less — there are no extra points for budget size.* We took it literally:

| Service | Cost |
|---|---|
| DynamoDB (on-demand) + S3 | ~$0 |
| Bedrock Nova Lite | ~$0.03 |
| Bedrock Nova Pro | ~$0.80 |
| Render + Vercel | $0 |
| **Total to build** | **~$1** |

A complete, real, multi-agent AI system on managed AWS for **~$1** — and the **cost-per-return only falls** as volume grows, because the expensive part (human inspection) is removed.

---

## 📈 Scalability & Future Scope

**Serverless-first**, so it scales horizontally with no re-architecture: DynamoDB on-demand absorbs spiky return volume, S3 holds photos off the database, Bedrock auto-scales inference, and each FastAPI router is stateless and **Lambda-ready**.

**Where it goes (multi-segment expansion):** retail returns → **Amazon Renewed** at scale → 3rd-party seller returns (returns-as-a-service API) → trade-in/buyback → warranty/insurance claims (condition assessment) → B2B liquidation. One decision engine, many industries. Long-term, the returns database becomes a **purchase-regret prediction** product that prevents returns *before the sale*.

---

## 🗺️ Leadership Principles → Features (mapped)

- **Customer Obsession** — three named customers; the returner's reward is instant; *even a broken return creates value.*
- **Working Backwards** — we wrote the press release first (top of this README).
- **Frugality** — right-model-per-job, serverless, **~$1** infra.
- **Invent & Simplify** — a 3-agent flywheel (grade → decide → match) replaces manual triage.
- **Think Big** — returns data becomes a return-prevention prediction product.
- **Ownership / Bias for Action** — built end-to-end on real AWS in 48 hours.

---

## 🚀 Local Setup

> Node 20+, Python 3.11+. Neither `node_modules/` nor the two `.env` files are in the repo.

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate   | macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python seed_dynamodb.py                 # seed products, users (usage profiles), returns, demo ledger
python -m uvicorn main:app --reload     # http://localhost:8000  · Swagger: /docs
```

### Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev                             # http://localhost:3000
```
> Start the backend first. `frontend/.env.local` sets `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).
> Windows tip: don't run `npm run build` while `npm run dev` is running (shared `.next` → EPERM).

### Environment Variables
- **`frontend/.env.local`** — `NEXT_PUBLIC_API_URL`
- **`backend/.env`** — `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=us-east-1`, `DYNAMODB_TABLE_PRODUCTS`, `DYNAMODB_TABLE_RETURNS`, `DYNAMODB_TABLE_USERS`, `S3_BUCKET_NAME`
> `.env` files are git-ignored. Without valid keys every route still responds via fallbacks (canned data) — fine for UI, not "live AI."

---

## 🔌 API Endpoints (9 routers, all under `/api`)

| Method | Endpoint | Purpose | Model |
|---|---|---|---|
| GET | `/` | Health check | — |
| GET/POST | `/api/prevent/score` | Personalized return prevention + right-sizing | Nova Lite |
| POST | `/api/grade` | Multimodal grading + condition score + issues | Nova Lite (vision) |
| POST | `/api/redirect` | 5-way disposition decision engine | Nova Pro |
| POST | `/api/next-owner` | Next-best-owner buyer-segment matching | Nova Pro |
| POST | `/api/certificate` | ReLife trust certificate | Nova Lite |
| POST | `/api/tradein` | Smart trade-in valuation + upgrade | Nova Lite (vision) |
| POST/GET | `/api/credits/{issue,redeem,ledger}` | Real Green Credits credit/debit ledger | — |
| POST/GET | `/api/journey/{complete,list,{id},refurbish-complete}` | AI decision records / ops (photo to S3) | — |
| GET | `/api/marketplace` | Live journey listings + seeded catalog (deduped) | — |

---

## 🔗 Submission Links

| | URL |
|---|---|
| **Live App (Frontend)** | [Vercel URL] |
| **Backend API + Swagger** | [Render URL]`/docs` |
| **Demo Video (2–3 min)** | [YouTube/Drive URL] |
| **GitHub** | [repo URL] |

> **📸 For me:** record a crisp **2–3 minute demo video** showing the happy path (grade a real photo → decision → credits → marketplace) *and* an edge case (Grade R still earns credits). Paste the link above — judges explicitly reward a working-prototype walkthrough.

---

*Keywords: circular commerce · reverse logistics · recommerce · Amazon Renewed · multimodal grading · agentic workflow · disposition routing · next-best-owner · return prevention · unit economics · serverless · deterministic AI · sustainability · CO₂ avoided · customer obsession · working backwards · frugality.*
